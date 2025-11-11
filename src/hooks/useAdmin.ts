import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check if current user is admin/moderator with permissions
export function useAdminRole() {
  return useQuery({
    queryKey: ['admin-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isModerator: false, hasAccess: false, permissions: [] };

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin') || false;
      const isModerator = roles?.some(r => r.role === 'moderator') || false;

      // Récupérer les permissions
      const userRoles = roles?.map(r => r.role) || [];
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', userRoles);

      const permissionsList = permissions?.map(p => p.permission) || [];

      return { 
        isAdmin, 
        isModerator, 
        hasAccess: isAdmin || isModerator,
        permissions: permissionsList,
        role: isAdmin ? 'admin' : isModerator ? 'moderator' : 'user'
      };
    },
  });
}

// Fetch pending verifications
export function usePendingVerifications() {
  return useQuery({
    queryKey: ['admin-verifications-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('*, profiles!verifications_user_id_fkey(display_name, avatar_url)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Fetch open reports
export function useOpenReports() {
  return useQuery({
    queryKey: ['admin-reports-open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(display_name, avatar_url)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Fetch active alerts
export function useActiveAlerts() {
  return useQuery({
    queryKey: ['admin-alerts-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data?.map(a => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(alert => ({
        ...alert,
        profiles: profilesMap.get(alert.user_id) || { display_name: null, avatar_url: null }
      }));
    },
  });
}

// Verify user (approve/reject verification)
export function useVerifyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verificationId, status, notes }: { verificationId: string; status: 'approved' | 'rejected'; notes?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-moderation/verify', {
        body: { verificationId, status, notes }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications-pending'] });
      toast.success(variables.status === 'approved' ? 'Vérification approuvée !' : 'Vérification rejetée');
    },
    onError: (error) => {
      console.error('Verify user error:', error);
      toast.error('Erreur lors de la vérification');
    },
  });
}

// Resolve report
export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reportId, 
      status, 
      action,
      sanctionData 
    }: { 
      reportId: string; 
      status: 'resolved' | 'ignored';
      action: string;
      sanctionData?: {
        type: 'warn' | 'suspend' | 'ban';
        reason: string;
        end_at?: string;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-moderation/resolve-report', {
        body: { reportId, status, action, sanctionData }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports-open'] });
      toast.success('Signalement traité');
    },
    onError: (error) => {
      console.error('Resolve report error:', error);
      toast.error('Erreur lors du traitement');
    },
  });
}

// Validate alert
export function useValidateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: 'validate' | 'hide' | 'resolve' }) => {
      const { data, error } = await supabase.functions.invoke('admin-moderation/validate-alert', {
        body: { alertId, action }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-active'] });
      toast.success('Alerte traitée');
    },
    onError: (error) => {
      console.error('Validate alert error:', error);
      toast.error('Erreur lors du traitement');
    },
  });
}
