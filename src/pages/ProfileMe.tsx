import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileMe() {
  const navigate = useNavigate();

  useEffect(() => {
    async function redirectToUserProfile() {
      try {
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // Authenticated, redirect to their profile
        navigate(`/profile/${user.id}`, { replace: true });
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login', { replace: true });
      }
    }

    redirectToUserProfile();
  }, [navigate]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
      <div className="text-center">
        <div className="animate-pulse text-4xl mb-4">🐕</div>
        <p className="text-muted-foreground">Redirection...</p>
      </div>
    </div>
  );
}
