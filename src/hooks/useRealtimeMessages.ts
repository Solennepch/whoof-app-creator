import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

export function useRealtimeMessages(threadId: string | undefined) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());

  useEffect(() => {
    if (!threadId) return;

    const roomChannel = supabase.channel(`thread-${threadId}`);

    // Track presence
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        const users = new Set<string>();
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            users.add(presence.user_id);
          });
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // Track typing indicators
    roomChannel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const { userId, userName, isTyping } = payload;
      
      if (isTyping) {
        setTypingUsers(prev => new Map(prev.set(userId, {
          userId,
          userName,
          timestamp: Date.now(),
        })));
      } else {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      }
    });

    // Listen to new messages
    roomChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        console.log('New message:', payload);
        // Query client will handle the refresh
      }
    );

    roomChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await roomChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

    setChannel(roomChannel);

    // Cleanup typing indicators older than 5 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const next = new Map(prev);
        let changed = false;
        next.forEach((user, userId) => {
          if (now - user.timestamp > 5000) {
            next.delete(userId);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      roomChannel.unsubscribe();
    };
  }, [threadId]);

  const broadcastTyping = async (isTyping: boolean) => {
    if (!channel) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        userName: profile?.display_name || 'Utilisateur',
        isTyping,
      },
    });
  };

  return {
    onlineUsers,
    typingUsers: Array.from(typingUsers.values()),
    broadcastTyping,
  };
}
