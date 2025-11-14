import { supabase } from '@/integrations/supabase/client';
import { getCurrentMonthEvent } from '@/lib/events/annualEvents';
import { getCurrentMonthChallenge } from '@/lib/events/monthlyChallenges';
import { 
  shouldTriggerContextualEvent, 
  getContextualEventById,
  type ContextualEvent 
} from '@/lib/events/contextualEvents';
import { sendNotification } from './notificationService';

export interface ChallengeProgress {
  userId: string;
  challengeId: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export const trackChallengeProgress = async (
  userId: string,
  challengeId: string,
  increment: number = 1
): Promise<ChallengeProgress | null> => {
  try {
    const challenge = getCurrentMonthChallenge();
    if (!challenge || challenge.id !== challengeId) {
      return null;
    }

    // Récupérer la progression actuelle
    const { data: existing, error: fetchError } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching challenge progress:', fetchError);
      return null;
    }

    const currentProgress = (existing?.current_progress || 0) + increment;
    const isCompleted = currentProgress >= challenge.objectiveTarget;

    // Mettre à jour ou créer la progression
    const { data, error } = await supabase
      .from('challenge_progress')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        current_progress: currentProgress,
        target_progress: challenge.objectiveTarget,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge progress:', error);
      return null;
    }

    // Envoyer notification de progression
    const progressPercentage = Math.floor((currentProgress / challenge.objectiveTarget) * 100);
    
    if (isCompleted && !existing?.is_completed) {
      await sendNotification({
        userId,
        templateId: 'game_badge_unlocked',
        data: { badgeName: challenge.reward },
      });
    } else if (progressPercentage >= 50 && progressPercentage < 75) {
      const messageIndex = Math.floor((progressPercentage / 100) * challenge.notificationMessages.length);
      await sendNotification({
        userId,
        templateId: 'game_challenge_progress',
        data: { 
          percentage: progressPercentage,
          message: challenge.notificationMessages[messageIndex] 
        },
      });
    }

    return {
      userId,
      challengeId,
      currentProgress,
      targetProgress: challenge.objectiveTarget,
      isCompleted,
      completedAt: data.completed_at,
    };
  } catch (error) {
    console.error('Error tracking challenge progress:', error);
    return null;
  }
};

export const checkAndTriggerContextualEvent = async (
  userId: string,
  context: {
    nearbyDogs?: number;
    temperature?: number;
    weather?: string;
    newProfiles?: number;
    isDogLost?: boolean;
    isDogFound?: boolean;
    hasPartnerOffer?: boolean;
  }
): Promise<void> => {
  try {
    // Vérifier chaque type d'événement contextuel
    const eventTypes: ContextualEvent['type'][] = [
      'activity_wave',
      'weather',
      'neighborhood',
      'dog_lost',
      'partner_offer',
    ];

    for (const eventType of eventTypes) {
      if (shouldTriggerContextualEvent(eventType, context)) {
        // Obtenir l'événement approprié
        let eventId: string;
        
        switch (eventType) {
          case 'activity_wave':
            eventId = 'activity_wave';
            break;
          case 'weather':
            eventId = context.temperature && context.temperature >= 18 && context.temperature <= 25
              ? 'perfect_weather'
              : 'rainy_weather';
            break;
          case 'neighborhood':
            eventId = 'neighborhood_active';
            break;
          case 'dog_lost':
            eventId = context.isDogFound ? 'dog_found_alert' : 'dog_lost_alert';
            break;
          case 'partner_offer':
            eventId = 'partner_weekend_offer';
            break;
          default:
            continue;
        }

        const event = getContextualEventById(eventId);
        if (!event) continue;

        // Envoyer notification
        await sendNotification({
          userId,
          templateId: eventId,
          data: context,
          force: event.priority === 'urgent',
        });
      }
    }
  } catch (error) {
    console.error('Error checking contextual events:', error);
  }
};

export const getActiveEvent = () => {
  return getCurrentMonthEvent();
};

export const getActiveChallenge = () => {
  return getCurrentMonthChallenge();
};

export const getChallengeProgress = async (
  userId: string,
  challengeId: string
): Promise<ChallengeProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      challengeId: data.challenge_id,
      currentProgress: data.current_progress,
      targetProgress: data.target_progress,
      isCompleted: data.is_completed,
      completedAt: data.completed_at,
    };
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    return null;
  }
};
