import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  pro_profile_id: string;
  service_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Fetch bookings for a pro profile
export const useProBookings = (proId?: string) => {
  return useQuery({
    queryKey: ['pro-bookings', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      const { data, error } = await supabase
        .from('pro_bookings')
        .select(`
          *,
          pro_services(name, price),
          profiles(display_name, avatar_url)
        `)
        .eq('pro_profile_id', proId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proId,
  });
};

// Fetch user's bookings
export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pro_bookings')
        .select(`
          *,
          pro_services(name, price),
          pro_profiles(business_name, logo_url)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Create booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      pro_profile_id: string;
      service_id: string;
      booking_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pro_bookings')
        .insert([{ ...booking, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Réservation créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating booking:', error);
      toast.error('Erreur lors de la réservation');
    }
  });
};

// Update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const { data, error } = await supabase
        .from('pro_bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });
};

// Fetch availability for a pro
export const useProAvailability = (proId?: string) => {
  return useQuery({
    queryKey: ['pro-availability', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      const { data, error } = await supabase
        .from('pro_availability')
        .select('*')
        .eq('pro_profile_id', proId)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proId,
  });
};

// Create availability slot
export const useCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: {
      pro_profile_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
    }) => {
      const { data, error } = await supabase
        .from('pro_availability')
        .insert([availability])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-availability'] });
      toast.success('Disponibilité ajoutée');
    },
    onError: (error) => {
      console.error('Error creating availability:', error);
      toast.error('Erreur lors de la création');
    }
  });
};

// Delete availability
export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pro_availability')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-availability'] });
      toast.success('Disponibilité supprimée');
    },
    onError: (error) => {
      console.error('Error deleting availability:', error);
      toast.error('Erreur lors de la suppression');
    }
  });
};
