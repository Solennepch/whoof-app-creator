import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a gamification notification should be sent based on user preferences
 */
export async function shouldSendGamificationNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'should_send_gamification_notification',
      {
        p_user_id: userId,
        p_notification_type: notificationType,
      }
    );

    if (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to sending if check fails
    }

    return data as boolean;
  } catch (error) {
    console.error('Error in shouldSendGamificationNotification:', error);
    return true;
  }
}

/**
 * Filter notifications based on user's gamification level
 */
export function getNotificationsByGamificationLevel(
  level: 'minimal' | 'moderate' | 'complete'
): string[] {
  switch (level) {
    case 'minimal':
      return ['level_up', 'challenge_completed'];
    
    case 'moderate':
      return [
        'xp_gains',
        'level_up',
        'badge_earned',
        'challenge_available',
        'challenge_completed',
        'daily_missions',
        'league_promotion',
      ];
    
    case 'complete':
      return [
        'xp_gains',
        'level_up',
        'badge_earned',
        'challenge_available',
        'challenge_completed',
        'daily_missions',
        'league_promotion',
        'guild_activity',
        'secret_achievement_hint',
      ];
    
    default:
      return [];
  }
}

/**
 * Get user-friendly notification type labels
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    xp_gains: 'Gains d\'XP',
    level_up: 'Montée de niveau',
    badge_earned: 'Badge débloqué',
    challenge_available: 'Nouveau challenge',
    challenge_completed: 'Challenge complété',
    daily_missions: 'Missions quotidiennes',
    league_promotion: 'Promotion de ligue',
    guild_activity: 'Activité de guilde',
    secret_achievement_hint: 'Indice de succès secret',
  };

  return labels[type] || type;
}
