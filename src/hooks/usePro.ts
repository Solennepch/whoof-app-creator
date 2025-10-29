import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch current user's pro profile
export function useMyProProfile() {
  return useQuery({
    queryKey: ['my-pro-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pro_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
  });
}

// Create or update pro profile
export function useUpsertProProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pro_profiles')
        .upsert({
          ...profileData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pro-profile'] });
      toast.success('Profil professionnel mis à jour');
    },
    onError: (error) => {
      console.error('Upsert pro profile error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

// Fetch pro profile stats
export function useProStats(proId?: string) {
  return useQuery({
    queryKey: ['pro-stats', proId],
    queryFn: async () => {
      if (!proId) return null;

      const { data, error } = await supabase
        .from('pro_profiles')
        .select('views_count, clicks_count')
        .eq('id', proId)
        .single();

      if (error) throw error;
      
      // Count unread messages
      const { count: unreadCount } = await supabase
        .from('messages_pro')
        .select('*', { count: 'exact', head: true })
        .eq('pro_id', proId)
        .not('read_by', 'cs', `{${proId}}`);

      return {
        views: data.views_count || 0,
        clicks: data.clicks_count || 0,
        unread: unreadCount || 0
      };
    },
    enabled: !!proId,
  });
}

// Increment view count
export function useIncrementProView() {
  return useMutation({
    mutationFn: async (proId: string) => {
      const { error } = await supabase.rpc('increment_pro_view', { pro_id: proId });
      if (error) throw error;
    },
  });
}

// Fetch pro messages/conversations
export function useProMessages(proId?: string) {
  return useQuery({
    queryKey: ['pro-messages', proId],
    queryFn: async () => {
      if (!proId) return [];

      const { data, error } = await supabase
        .from('messages_pro')
        .select('*, profiles!messages_pro_user_id_fkey(display_name, avatar_url)')
        .eq('pro_id', proId)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      // Group by user_id to get conversations
      const conversations = new Map();
      data?.forEach((msg: any) => {
        if (!conversations.has(msg.user_id)) {
          conversations.set(msg.user_id, {
            user_id: msg.user_id,
            user_name: msg.profiles?.display_name || 'Utilisateur',
            user_avatar: msg.profiles?.avatar_url,
            last_message: msg.body,
            last_message_at: msg.sent_at,
            unread: !msg.read_by.includes(proId)
          });
        }
      });

      return Array.from(conversations.values());
    },
    enabled: !!proId,
  });
}

// Send message to user
export function useSendProMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proId, userId, body }: { proId: string; userId: string; body: string }) => {
      const { data, error } = await supabase
        .from('messages_pro')
        .insert({
          pro_id: proId,
          user_id: userId,
          sender_role: 'pro',
          body
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pro-messages', variables.proId] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error('Erreur lors de l\'envoi');
    },
  });
}

// Add/remove favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proId, isFavorite }: { proId: string; isFavorite: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites_pro')
          .delete()
          .eq('user_id', user.id)
          .eq('pro_id', proId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites_pro')
          .insert({
            user_id: user.id,
            pro_id: proId
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(variables.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    },
    onError: (error) => {
      console.error('Toggle favorite error:', error);
      toast.error('Erreur');
    },
  });
}

// Check if pro is favorite
export function useIsFavorite(proId?: string) {
  return useQuery({
    queryKey: ['is-favorite', proId],
    queryFn: async () => {
      if (!proId) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorites_pro')
        .select('id')
        .eq('user_id', user.id)
        .eq('pro_id', proId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!proId,
  });
}
