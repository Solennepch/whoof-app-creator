import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification } from '@/services/notificationService';
import { getTemplatesByCategory } from '@/lib/notifications/templates';

export const useWalkNotifications = () => {
  const { user } = useAuth();

  // Notifier quand des chiens sont à proximité
  const notifyDogsNearby = async (count: number) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_dogs_nearby',
      data: { count },
    });
  };

  // Notifier quand le parc préféré est animé
  const notifyParkActive = async (parkName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_park_active',
      data: { parkName },
    });
  };

  // Notifier quand un ami est en balade à proximité
  const notifyFriendNearby = async (friendDogName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_friend_nearby',
      data: { friendDogName },
    });
  };

  // Notifier selon la météo
  const notifyGoodWeather = async () => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_good_weather',
    });
  };

  // Notifier d'une nouvelle balade populaire
  const notifyNewRoute = async (routeName: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_new_route',
      data: { routeName },
    });
  };

  // Notifier d'une balade groupée qui commence
  const notifyGroupWalkStarting = async (location: string) => {
    if (!user) return;

    await sendNotification({
      userId: user.id,
      templateId: 'walk_group_starting',
      data: { location },
    });
  };

  return {
    notifyDogsNearby,
    notifyParkActive,
    notifyFriendNearby,
    notifyGoodWeather,
    notifyNewRoute,
    notifyGroupWalkStarting,
  };
};
