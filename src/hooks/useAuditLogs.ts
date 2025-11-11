import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before: any;
  after: any;
  metadata?: any;
  created_at: string;
  actor?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface UseAuditLogsOptions {
  entityType?: string;
  action?: string;
  days?: number;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { entityType, action, days = 30, limit = 100 } = options;

  return useQuery({
    queryKey: ['audit-logs', entityType, action, days, limit],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (action) {
        query = query.eq('action', action);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      // Fetch actor profiles separately
      const actorIds = [...new Set(logs?.map(l => l.actor_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', actorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (logs || []).map(log => ({
        ...log,
        actor: log.actor_id ? profilesMap.get(log.actor_id) : undefined
      })) as AuditLog[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: async () => {
      const [
        totalResult,
        todayResult,
        byActionResult,
        byEntityResult
      ] = await Promise.all([
        // Total logs
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true }),
        
        // Today's logs
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        
        // By action type
        supabase
          .from('audit_logs')
          .select('action')
          .gte('created_at', subDays(new Date(), 7).toISOString()),
        
        // By entity type
        supabase
          .from('audit_logs')
          .select('entity_type')
          .gte('created_at', subDays(new Date(), 7).toISOString())
      ]);

      const actionCounts = (byActionResult.data || []).reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const entityCounts = (byEntityResult.data || []).reduce((acc, log) => {
        acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        byAction: actionCounts,
        byEntity: entityCounts
      };
    },
  });
}
