import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification } from '@/services/notificationService';
import { getUserSegment } from '@/lib/notifications/segmentation';

export const useReactivationNotifications = () => {
  const { user } = useAuth();

  // Vérifier et envoyer des notifications de réactivation
  useEffect(() => {
    if (!user) return;

    const checkAndSendReactivation = async () => {
      const segment = await getUserSegment(user.id);

      // Ne rien faire si l'utilisateur n'est pas inactif
      if (segment.segment !== 'inactive') return;

      // Choisir le bon template selon le nombre de jours d'inactivité
      let templateId: string;

      if (segment.daysSinceLastActivity >= 14) {
        templateId = 'reactive_community_miss';
      } else if (segment.daysSinceLastActivity >= 10) {
        templateId = 'reactive_new_features';
      } else if (segment.daysSinceLastActivity >= 7) {
        templateId = 'reactive_miss_you';
      } else {
        return; // Pas encore assez inactif
      }

      await sendNotification({
        userId: user.id,
        templateId,
        data: { daysSinceLastActivity: segment.daysSinceLastActivity },
      });
    };

    // Vérifier toutes les 24h
    const interval = setInterval(checkAndSendReactivation, 24 * 60 * 60 * 1000);
    checkAndSendReactivation(); // Vérification immédiate

    return () => clearInterval(interval);
  }, [user]);

  // Notifier de nouveaux chiens dans le quartier
  const notifyNewDogs = async (count: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'reactive_new_dogs',
      data: { count },
    });
  };

  // Notifier d'un Whoof en attente
  const notifyPendingWhoof = async (daysPending: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'reactive_pending_whoof',
      data: { daysPending },
    });
  };

  // Notifier d'une belle balade repérée
  const notifyNiceWalk = async (location: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'reactive_nice_walk',
      data: { location },
    });
  };

  // Notifier de nouveaux profils intéressants
  const notifyNewProfiles = async () => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'reactive_new_profiles',
    });
  };

  // Notifier d'une rencontre en attente
  const notifyEncounterWaiting = async (dogName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'reactive_encounter_waiting',
      data: { dogName },
    });
  };

  return {
    notifyNewDogs,
    notifyPendingWhoof,
    notifyNiceWalk,
    notifyNewProfiles,
    notifyEncounterWaiting,
  };
};
