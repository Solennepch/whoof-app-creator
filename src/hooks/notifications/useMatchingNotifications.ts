import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification } from '@/services/notificationService';

export const useMatchingNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Écouter les nouveaux matches
    const matchChannel = supabase
      .channel('matching-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
        },
        async (payload) => {
          const friendship = payload.new;
          
          // Vérifier si l'utilisateur est impliqué
          if (friendship.a_user !== user.id && friendship.b_user !== user.id) {
            return;
          }

          // Envoyer notification selon le statut
          if (friendship.status === 'matched') {
            await sendNotification({
              userId: user.id,
              templateId: 'match_potential',
            });
          } else if (friendship.status === 'pending') {
            await sendNotification({
              userId: user.id,
              templateId: 'match_whoofed',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [user]);

  // Fonction pour notifier de nouveaux profils compatibles à proximité
  const notifyCompatibleNearby = async () => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'match_compatible_nearby',
    });
  };

  // Fonction pour notifier de profils avec les mêmes vibes
  const notifySimilarVibes = async (dogName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'match_same_vibes',
      data: { dogName },
    });
  };

  return {
    notifyCompatibleNearby,
    notifySimilarVibes,
  };
};
