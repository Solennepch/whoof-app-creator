import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { refetch } = useNotifications();

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Listen to real-time notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          const notification = payload.new as any;
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo-whoof-app-new.png',
              badge: '/paw-icon.png',
              tag: notification.id,
              requireInteraction: notification.type === 'booking_confirmed',
            });
          }
          
          // Show toast
          toast.info(notification.title, {
            description: notification.message,
          });
          
          // Refetch notifications list
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées sur cet appareil');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Notifications activées !');
      await registerServiceWorker();
      return true;
    } else {
      toast.error('Permission refusée pour les notifications');
      return false;
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      setSubscription(sub);

      // Send subscription to backend
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('push-register', {
          body: { subscription: sub.toJSON() },
        });
      }

      return sub;
    } catch (error) {
      console.error('Error registering service worker:', error);
      toast.error('Erreur lors de l\'activation des notifications push');
      return null;
    }
  };

  const unregisterServiceWorker = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke('push-unregister');
        }
        
        setSubscription(null);
        toast.success('Notifications désactivées');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error('Erreur lors de la désactivation');
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    unregisterServiceWorker,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
