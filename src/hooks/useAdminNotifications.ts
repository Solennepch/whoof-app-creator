import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export interface AdminNotification {
  id: string;
  type: 'verification' | 'report' | 'alert' | 'system';
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  expires_at: string | null;
}

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as AdminNotification[];
    },
  });

  // S'abonner aux nouvelles notifications en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          
          // Afficher une toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });

          // Rafraîchir la liste des notifications
          queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
