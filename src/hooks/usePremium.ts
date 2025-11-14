import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function usePremium() {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['premium-status'],
    queryFn: async () => {
      if (!session?.user) return false;

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
