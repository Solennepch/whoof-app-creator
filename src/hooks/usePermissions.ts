import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Permission = 
  | 'manage_users'
  | 'manage_moderators'
  | 'view_all_content'
  | 'delete_content'
  | 'ban_users'
  | 'manage_verifications'
  | 'manage_reports'
  | 'manage_alerts'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_professionals'
  | 'manage_content';

export interface UserRole {
  role: 'admin' | 'moderator' | 'user';
  permissions: Permission[];
}

export function usePermissions() {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Récupérer les rôles de l'utilisateur
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!userRoles || userRoles.length === 0) {
        return { role: 'user' as const, permissions: [] };
      }

      // Récupérer toutes les permissions associées aux rôles
      const roles = userRoles.map(r => r.role);
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', roles);

      const uniquePermissions = [...new Set(permissions?.map(p => p.permission) || [])] as Permission[];

      // Déterminer le rôle le plus élevé
      const highestRole = roles.includes('admin') ? 'admin' : 
                          roles.includes('moderator') ? 'moderator' : 'user';

      return {
        role: highestRole,
        permissions: uniquePermissions
      };
    },
  });
}

export function useHasPermission(permission: Permission) {
  const { data: userRole } = usePermissions();
  return userRole?.permissions.includes(permission) || false;
}

export function useIsAdmin() {
  const { data: userRole } = usePermissions();
  return userRole?.role === 'admin';
}

export function useIsModerator() {
  const { data: userRole } = usePermissions();
  return userRole?.role === 'moderator' || userRole?.role === 'admin';
}
