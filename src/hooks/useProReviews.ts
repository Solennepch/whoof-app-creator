import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  pro_profile_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  pro_response?: string;
  is_verified: boolean;
  is_moderated: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Fetch reviews for a pro profile
export const useProReviews = (proId?: string) => {
  return useQuery({
    queryKey: ['pro-reviews', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      const { data, error } = await supabase
        .from('pro_reviews')
        .select(`
          *,
          profiles(display_name, avatar_url)
        `)
        .eq('pro_profile_id', proId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proId,
  });
};

// Create review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      pro_profile_id: string;
      booking_id?: string;
      rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pro_reviews')
        .insert([{ ...review, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-reviews'] });
      toast.success('Avis envoyé pour modération');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    }
  });
};

// Respond to review (pro only)
export const useRespondToReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { data, error } = await supabase
        .from('pro_reviews')
        .update({ pro_response: response })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-reviews'] });
      toast.success('Réponse publiée');
    },
    onError: (error) => {
      console.error('Error responding to review:', error);
      toast.error('Erreur lors de la publication');
    }
  });
};

// Moderate review (admin only)
export const useModerateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('pro_reviews')
        .update({ status, is_moderated: true })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-reviews'] });
      toast.success('Avis modéré');
    },
    onError: (error) => {
      console.error('Error moderating review:', error);
      toast.error('Erreur lors de la modération');
    }
  });
};

// Fetch pending reviews for moderation
export const usePendingReviews = () => {
  return useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_reviews')
        .select(`
          *,
          profiles(display_name, avatar_url),
          pro_profiles(business_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};
