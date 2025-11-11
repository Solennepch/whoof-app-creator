import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserWithRole {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  created_at: string;
  roles: string[];
}

export function useUsersWithRoles(searchQuery = '') {
  return useQuery({
    queryKey: ['users-with-roles', searchQuery],
    queryFn: async () => {
      // Fetch all profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        profilesQuery = profilesQuery.ilike('display_name', `%${searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Group roles by user_id
      const rolesMap = new Map<string, string[]>();
      userRoles?.forEach(ur => {
        const roles = rolesMap.get(ur.user_id) || [];
        roles.push(ur.role);
        rolesMap.set(ur.user_id, roles);
      });

      return (profiles || []).map(profile => ({
        ...profile,
        roles: rolesMap.get(profile.id) || []
      })) as UserWithRole[];
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success(`Rôle ${variables.role} assigné avec succès`);
    },
    onError: (error: any) => {
      console.error('Assign role error:', error);
      if (error.code === '23505') {
        toast.error('Ce rôle est déjà assigné à cet utilisateur');
      } else {
        toast.error('Erreur lors de l\'assignation du rôle');
      }
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success(`Rôle ${variables.role} révoqué avec succès`);
    },
    onError: (error) => {
      console.error('Revoke role error:', error);
      toast.error('Erreur lors de la révocation du rôle');
    },
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;

      // Group permissions by role
      const permissionsByRole = (data || []).reduce((acc, rp) => {
        if (!acc[rp.role]) {
          acc[rp.role] = [];
        }
        acc[rp.role].push(rp.permission);
        return acc;
      }, {} as Record<string, string[]>);

      return permissionsByRole;
    },
  });
}
