import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { shouldSendGamificationNotification } from '@/lib/notifications/gamificationFilter';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  description?: string;
  type: string;
}

/**
 * Hook for sending smart gamification notifications that respect user preferences
 */
export function useSmartNotifications() {
  const { user } = useAuth();

  const sendNotification = useCallback(async (options: NotificationOptions) => {
    if (!user?.id) return;

    try {
      // Check if notification should be sent based on user preferences
      const shouldSend = await shouldSendGamificationNotification(user.id, options.type);

      if (shouldSend) {
        // Send toast notification
        toast.success(options.title, {
          description: options.description,
        });

        // Could also send push notification here if enabled
        // await sendPushNotification(...)
      }
    } catch (error) {
      console.error('Error sending smart notification:', error);
    }
  }, [user?.id]);

  return {
    sendNotification,
  };
}
