import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cache } from "@/lib/cache";

// Fetch current user's pro profile
export function useMyProProfile() {
  return useQuery({
    queryKey: ['my-pro-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get from cache first
      const data = await cache.getOrSet(
        `pro-profile:${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from('pro_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          return data || null;
        },
        { type: 'profile' }
      );

      return data;
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['my-pro-profile'] });
      
      // Invalidate cache
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await cache.delete(`pro-profile:${user.id}`);
      }
      
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
      const { error } = await supabase.rpc('increment_pro_view' as any, { pro_id: proId });
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

// Toggle publish status
export function useTogglePublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proId, isPublished }: { proId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('pro_profiles')
        .update({ 
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', proId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pro-profile'] });
    },
    onError: (error) => {
      console.error('Toggle publish error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

// Services Management
export function useProServices(proId?: string) {
  return useQuery({
    queryKey: ['pro-services', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      // Try to get from cache first
      const data = await cache.getOrSet(
        `pro-services:${proId}`,
        async () => {
          const { data, error } = await supabase
            .from('pro_services')
            .select('*')
            .eq('pro_profile_id', proId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data || [];
        },
        { type: 'directory' }
      );
      
      return data;
    },
    enabled: !!proId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: {
      pro_profile_id: string;
      name: string;
      description?: string;
      price: number;
      duration?: string;
    }) => {
      const { data, error } = await supabase
        .from('pro_services')
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['pro-services'] });
      
      // Invalidate cache
      await cache.delete(`pro-services:${data.pro_profile_id}`);
      
      toast.success("Service créé avec succès");
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast.error("Erreur lors de la création du service");
    }
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      duration?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('pro_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['pro-services'] });
      
      // Invalidate cache
      await cache.delete(`pro-services:${data.pro_profile_id}`);
      
      toast.success("Service mis à jour");
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pro_services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-services'] });
      toast.success("Service supprimé");
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error("Erreur lors de la suppression");
    }
  });
}

// Audit logs
export function useProAuditLogs(proId?: string) {
  return useQuery({
    queryKey: ['pro-audit-logs', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'pro_profiles')
        .eq('entity_id', proId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!proId,
  });
}
