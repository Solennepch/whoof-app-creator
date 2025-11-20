import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useDevTools } from "@/hooks/useDevTools";

export function usePremium() {
  // MODE SANDBOX : tous les utilisateurs ont le premium
  return useQuery({
    queryKey: ['premium-status'],
    queryFn: async () => true,
  });
}
