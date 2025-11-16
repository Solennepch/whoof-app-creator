import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useDevTools } from "@/hooks/useDevTools";

export function usePremium() {
  const { session } = useAuth();
  const { isDevAccount, premiumOverride } = useDevTools();
  
  return useQuery({
    queryKey: ['premium-status', premiumOverride],
    queryFn: async () => {
      if (!session?.user) return false;

      // Dev account with override
      if (isDevAccount && premiumOverride !== null) {
        return premiumOverride;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) return false;

        const { isPremium } = await response.json();
        return isPremium === true;
      } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
      }
    },
  });
}
