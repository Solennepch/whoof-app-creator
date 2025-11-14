import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getUserSegment, UserSegmentData } from '@/lib/notifications/segmentation';
import { sendNotification } from '@/services/notificationService';

interface NotificationSystemContextType {
  userSegment: UserSegmentData | null;
  isLoading: boolean;
  sendCustomNotification: (templateId: string, data?: Record<string, any>) => Promise<void>;
  refreshSegment: () => Promise<void>;
}

const NotificationSystemContext = createContext<NotificationSystemContextType>({
  userSegment: null,
  isLoading: true,
  sendCustomNotification: async () => {},
  refreshSegment: async () => {},
});

export const useNotificationSystem = () => useContext(NotificationSystemContext);

export const NotificationSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userSegment, setUserSegment] = useState<UserSegmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserSegment = async () => {
    if (!user) {
      setUserSegment(null);
      setIsLoading(false);
      return;
    }

    try {
      const segment = await getUserSegment(user.id);
      setUserSegment(segment);
    } catch (error) {
      console.error('Erreur chargement segment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserSegment();
  }, [user]);

  // Écouter les changements d'activité pour mettre à jour le segment
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('user-activity-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `sender_id=eq.${user.id}`,
          },
          () => loadUserSegment()
        )
        .subscribe(),

      supabase
        .channel('user-activity-friendships')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friendships',
          },
          (payload) => {
            if (payload.new.a_user === user.id || payload.new.b_user === user.id) {
              loadUserSegment();
            }
          }
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

  const sendCustomNotification = async (templateId: string, data?: Record<string, any>) => {
    if (!user) return;

    const result = await sendNotification({
      userId: user.id,
      templateId,
      data,
    });

    if (!result.success) {
      console.warn('Notification non envoyée:', result.reason);
    }
  };

  const refreshSegment = async () => {
    await loadUserSegment();
  };

  return (
    <NotificationSystemContext.Provider
      value={{
        userSegment,
        isLoading,
        sendCustomNotification,
        refreshSegment,
      }}
    >
      {children}
    </NotificationSystemContext.Provider>
  );
};
