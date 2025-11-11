import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay } from "date-fns";

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalPros: number;
  pendingVerifications: number;
  openReports: number;
  activeAlerts: number;
  totalMatches: number;
  activeUsersToday: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfDay(subDays(now, 7));

      // Exécuter toutes les requêtes en parallèle
      const [
        totalUsersResult,
        newUsersTodayResult,
        newUsersWeekResult,
        totalProsResult,
        pendingVerificationsResult,
        openReportsResult,
        activeAlertsResult,
        totalFriendshipsResult,
      ] = await Promise.all([
        // Total utilisateurs
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        
        // Nouveaux utilisateurs aujourd'hui
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString()),
        
        // Nouveaux utilisateurs cette semaine
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart.toISOString()),
        
        // Total professionnels
        supabase
          .from('pro_profiles')
          .select('id', { count: 'exact', head: true }),
        
        // Vérifications en attente
        supabase
          .from('verifications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Signalements ouverts
        supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
        
        // Alertes actives
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        
        // Total de friendships/matches
        supabase
          .from('friendships')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'accepted'),
      ]);

      const stats: AdminStats = {
        totalUsers: totalUsersResult.count || 0,
        newUsersToday: newUsersTodayResult.count || 0,
        newUsersThisWeek: newUsersWeekResult.count || 0,
        totalPros: totalProsResult.count || 0,
        pendingVerifications: pendingVerificationsResult.count || 0,
        openReports: openReportsResult.count || 0,
        activeAlerts: activeAlertsResult.count || 0,
        totalMatches: totalFriendshipsResult.count || 0,
        activeUsersToday: 0, // Sera calculé différemment si nécessaire
      };

      return stats;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}
