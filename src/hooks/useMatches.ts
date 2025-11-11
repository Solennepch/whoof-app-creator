import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

export interface Match {
  id: string;
  a_user: string;
  b_user: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useMatches() {
  const queryClient = useQueryClient();

  // Get my matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("friendships")
        .select(`
          *,
          a_profile:a_user(id, display_name, avatar_url),
          b_profile:b_user(id, display_name, avatar_url)
        `)
        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`)
        .eq("status", "matched")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Match[];
    },
  });

  // Get suggested profiles for discovery
  const { data: suggested, isLoading: suggestedLoading } = useQuery({
    queryKey: ["suggested"],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const data = await safeFetch(`${baseUrl}/functions/v1/suggested`, {
        method: "GET",
      });
      return data;
    },
  });

  // Swipe action (like or pass)
  const swipe = useMutation({
    mutationFn: async ({
      to_user,
      action,
    }: {
      to_user: string;
      action: "like" | "pass";
    }) => {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const data = await safeFetch(`${baseUrl}/functions/v1/swipe`, {
        method: "POST",
        body: JSON.stringify({ to_user, action }),
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      
      if (data.match) {
        toast.success(data.message || "C'est un match ! 🎉");
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de l'action");
      console.error(error);
    },
  });

  return {
    matches,
    suggested,
    matchesLoading,
    suggestedLoading,
    swipe: swipe.mutate,
    isSwiping: swipe.isPending,
  };
}
