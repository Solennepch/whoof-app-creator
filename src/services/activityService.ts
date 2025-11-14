import { supabase } from '@/integrations/supabase/client';

interface CreateActivityParams {
  userId: string;
  activityType: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'friends' | 'private';
}

export const createActivity = async ({
  userId,
  activityType,
  title,
  description,
  metadata = {},
  visibility = 'public',
}: CreateActivityParams): Promise<boolean> => {
  try {
    const { error } = await supabase.from('activity_feed').insert({
      user_id: userId,
      activity_type: activityType,
      title,
      description,
      metadata,
      visibility,
    });

    if (error) {
      console.error('Error creating activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating activity:', error);
    return false;
  }
};

// Helper pour créer automatiquement une activité lors d'un challenge complété
export const trackChallengeCompletionActivity = async (
  userId: string,
  challengeName: string,
  badge?: string
) => {
  return createActivity({
    userId,
    activityType: 'challenge_completed',
    title: `a complété le challenge "${challengeName}"`,
    description: `Un nouveau badge bien mérité ! 🎉`,
    metadata: { challengeName, badge },
  });
};

// Helper pour créer une activité lors d'un jalon atteint
export const trackMilestoneActivity = async (
  userId: string,
  milestone: number,
  challengeName: string
) => {
  return createActivity({
    userId,
    activityType: 'milestone_reached',
    title: `a atteint ${milestone}% du challenge "${challengeName}"`,
    description: `Continue comme ça ! 💪`,
    metadata: { milestone, challengeName },
  });
};

// Helper pour créer une activité lors d'un badge obtenu
export const trackBadgeEarnedActivity = async (
  userId: string,
  badgeName: string,
  badgeIcon?: string
) => {
  return createActivity({
    userId,
    activityType: 'badge_earned',
    title: `a obtenu le badge "${badgeName}"`,
    description: `Un nouveau badge pour la collection ! 🏆`,
    metadata: { badgeName, badge: badgeIcon },
  });
};

// Helper pour créer une activité lors d'une position top atteinte
export const trackTopPositionActivity = async (
  userId: string,
  position: number,
  challengeName?: string
) => {
  const positionText = position === 1 ? '1ère' : position === 2 ? '2ème' : '3ème';
  return createActivity({
    userId,
    activityType: 'top_position',
    title: `a atteint la ${positionText} place du classement`,
    description: challengeName ? `Challenge: ${challengeName}` : undefined,
    metadata: { position, challengeName },
  });
};

// Helper pour créer une activité lors d'une quête complétée
export const trackQuestCompletionActivity = async (
  userId: string,
  questName: string,
  icon?: string
) => {
  return createActivity({
    userId,
    activityType: 'quest_completed',
    title: `a terminé la quête "${questName}"`,
    description: `Une aventure épique achevée ! ⚔️`,
    metadata: { questName, icon },
  });
};

// Helper pour créer une activité lors d'une série atteinte
export const trackStreakActivity = async (
  userId: string,
  streakDays: number
) => {
  return createActivity({
    userId,
    activityType: 'streak_achieved',
    title: `a maintenu une série de ${streakDays} jours`,
    description: `Quelle détermination ! 🔥`,
    metadata: { streakDays },
  });
};
