import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface XPEvent {
  id: string;
  user_id: string;
  type: string;
  points: number;
  ref_id?: string;
  metadata?: any;
  created_at: string;
}

export interface Badge {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  criteria: any;
  color: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_code: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserXPSummary {
  user_id: string;
  total_xp: number;
  level: number;
  total_events: number;
}

// Fetch user XP summary
export function useUserXP(userId?: string) {
  return useQuery({
    queryKey: ["user-xp", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("user_xp_summary")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserXPSummary | null;
    },
    enabled: !!userId,
  });
}

// Fetch user badges
export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!userId,
  });
}

// Fetch all badges
export function useAllBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("code");
      
      if (error) throw error;
      return data as Badge[];
    },
  });
}

// Fetch XP events history
export function useXPEvents(userId?: string, limit = 50) {
  return useQuery({
    queryKey: ["xp-events", userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("xp_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as XPEvent[];
    },
    enabled: !!userId,
  });
}

// Add XP event mutation
export function useAddXPEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      type,
      points,
      refId,
      metadata,
    }: {
      userId: string;
      type: string;
      points: number;
      refId?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase.rpc("add_xp_event", {
        p_user_id: userId,
        p_type: type,
        p_points: points,
        p_ref_id: refId,
        p_metadata: metadata || {},
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-xp", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["xp-events", variables.userId] });
      toast.success(`+${variables.points} XP!`, {
        description: getXPEventDescription(variables.type),
      });
    },
    onError: (error) => {
      console.error("Failed to add XP:", error);
      toast.error("Erreur lors de l'ajout des XP");
    },
  });
}

// Check and award badges
export function useCheckBadges() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("check_and_award_badges", {
        p_user_id: userId,
      });
      
      if (error) throw error;
      return data as { badge_code: string; newly_awarded: boolean }[];
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["user-badges", userId] });
      
      // Show toast for newly awarded badges
      const newBadges = data?.filter((b) => b.newly_awarded) || [];
      newBadges.forEach((badge) => {
        toast.success("🏆 Nouveau badge débloqué !", {
          description: badge.badge_code,
        });
      });
    },
  });
}

// Weekly leaderboard
export function useWeeklyLeaderboard(city?: string, limit = 50) {
  return useQuery({
    queryKey: ["weekly-leaderboard", city, limit],
    queryFn: async () => {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      let query = supabase
        .from("leaderboard_weekly")
        .select("*")
        .eq("week_start", monday.toISOString().split("T")[0])
        .order("rank", { ascending: true })
        .limit(limit);

      if (city) {
        query = query.eq("city", city);
      }

      const { data: leaderboardData, error } = await query;
      
      if (error) throw error;
      if (!leaderboardData) return [];

      // Fetch profiles separately to avoid relation issues
      const userIds = leaderboardData.map(entry => entry.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      // Merge data
      return leaderboardData.map(entry => ({
        ...entry,
        profile: profiles?.find(p => p.id === entry.user_id) || null,
      }));
    },
  });
}

// Helper function to get XP event description
function getXPEventDescription(type: string): string {
  const descriptions: Record<string, string> = {
    profile_complete: "Profil complété",
    verification_approved: "Vérification approuvée",
    walk_start: "Balade démarrée",
    walk_complete: "Balade terminée",
    walk_invite: "Amis invités",
    event_participate: "Participation à un événement",
    event_create: "Événement créé",
    alert_create: "Danger signalé",
    lost_dog_resolve: "Chien retrouvé",
    match: "Nouveau match",
    walk_streak: "Série de balades",
    referral: "Filleul inscrit",
  };
  
  return descriptions[type] || "Action complétée";
}

// Calculate next level XP requirement
export function getNextLevelXP(currentLevel: number): number {
  return (currentLevel + 1) * 200;
}

// Calculate XP progress percentage
export function getXPProgress(totalXP: number, level: number): number {
  const currentLevelXP = level * 200;
  const nextLevelXP = getNextLevelXP(level);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
}
