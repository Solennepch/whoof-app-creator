import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const checkAdminStatus = async () => {
      // En mode dev, on donne automatiquement les droits admin
      if (isDev) {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const hasAdminRole = roles?.some(r => r.role === 'admin') || false;
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isDev]);

  return { isAdmin, isLoading };
}
