import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification } from '@/services/notificationService';

export const useGamificationNotifications = () => {
  const { user } = useAuth();

  // Notifier d'une série quotidienne
  const notifyDailyStreak = async (streakDays: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_daily_streak',
      data: { streakDays },
    });
  };

  // Notifier de la progression d'un challenge
  const notifyChallengeProgress = async (percentage: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_challenge_progress',
      data: { percentage },
    });
  };

  // Notifier d'un nouveau badge débloqué
  const notifyBadgeUnlocked = async (badgeName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_badge_unlocked',
      data: { badgeName },
    });
  };

  // Notifier du classement local
  const notifyTopWalker = async (rank: number, percentage: number) => {
    if (!user) return;

    if (rank <= 3) {
      await sendNotification({
        userId: user.id,
        templateId: 'game_top_local',
        data: { rank },
      });
    } else {
      await sendNotification({
        userId: user.id,
        templateId: 'game_top_walker',
        data: { percentage },
      });
    }
  };

  // Notifier de l'objectif quotidien
  const notifyDailyGoal = async (goalMinutes: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_daily_goal',
      data: { goalMinutes },
    });
  };

  // Notifier qu'on est proche de l'objectif
  const notifyAlmostGoal = async (remainingKm: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_almost_goal',
      data: { remainingKm },
    });
  };

  // Notifier du challenge weekend
  const notifyWeekendChallenge = async () => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_weekend_challenge',
    });
  };

  // Notifier que le chien devient une star locale
  const notifyLocalStar = async () => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'game_local_star',
    });
  };

  return {
    notifyDailyStreak,
    notifyChallengeProgress,
    notifyBadgeUnlocked,
    notifyTopWalker,
    notifyDailyGoal,
    notifyAlmostGoal,
    notifyWeekendChallenge,
    notifyLocalStar,
  };
};
