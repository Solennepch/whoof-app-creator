import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Stripe product IDs for pro tiers
export const PRO_TIERS = {
  basique: {
    product_id: 'prod_RUjU3pAmtv1AIT',
    price_id: 'price_1Qf9BHBdQRO0xcW3Wlo1u3Fs',
    name: 'Plan Basique',
    price: '14,90€',
    features: ['Profil visible', 'Jusqu\'à 10 photos', 'Support standard']
  },
  premium: {
    product_id: 'prod_RUjUOIg6eIdRnL',
    price_id: 'price_1Qf9BgBdQRO0xcW3MgQVIFSz',
    name: 'Plan Premium',
    price: '19,90€',
    features: ['Profil mis en avant', 'Photos illimitées', 'Statistiques avancées']
  },
  enterprise: {
    product_id: 'prod_RUjVjTfD4C5Tvz',
    price_id: 'price_1Qf9C9BdQRO0xcW3V0bexK9I',
    name: 'Plan Enterprise',
    price: '29,90€',
    features: ['Tout Premium', 'Support prioritaire', 'Accès API', 'Fonctionnalités avancées']
  }
} as const;

export type ProTier = 'basique' | 'premium' | 'enterprise' | null;

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
  tier?: ProTier;
}

// Get subscription status from backend
export const useProSubscriptionStatus = () => {
  return useQuery({
    queryKey: ['pro-subscription-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { subscribed: false, tier: null };

      const { data, error } = await supabase.functions.invoke('pro-subscription-status');
      
      if (error) throw error;

      const result = data as SubscriptionStatus;
      
      // Determine tier from product_id
      let tier: ProTier = null;
      if (result.subscribed && result.product_id) {
        if (result.product_id === PRO_TIERS.basique.product_id) tier = 'basique';
        else if (result.product_id === PRO_TIERS.premium.product_id) tier = 'premium';
        else if (result.product_id === PRO_TIERS.enterprise.product_id) tier = 'enterprise';
      }

      return {
        ...result,
        tier
      };
    },
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
};

// Create checkout session
export const useCreateProCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceId: string) => {
      const { data, error } = await supabase.functions.invoke('pro-checkout', {
        body: { price_id: priceId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Open checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirection vers le paiement...');
      }
      // Invalidate subscription status to refetch after checkout
      queryClient.invalidateQueries({ queryKey: ['pro-subscription-status'] });
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la création de la session de paiement');
    }
  });
};

// Open customer portal
export const useProCustomerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pro-customer-portal');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Ouverture du portail de gestion...');
      }
    },
    onError: (error) => {
      console.error('Portal error:', error);
      toast.error('Erreur lors de l\'ouverture du portail');
    }
  });
};

// Helper to check if a feature is available for current tier
export const useHasFeature = (requiredTier: ProTier) => {
  const { data } = useProSubscriptionStatus();
  
  if (!data?.subscribed || !data.tier) return false;
  
  const tierHierarchy: ProTier[] = ['basique', 'premium', 'enterprise'];
  const currentTierIndex = tierHierarchy.indexOf(data.tier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  return currentTierIndex >= requiredTierIndex;
};
