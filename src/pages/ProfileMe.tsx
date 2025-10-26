import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logoWhoof from "@/assets/logo-whoof.png";

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

  // Show an elegant loading state while redirecting
  return (
    <div 
      className="min-h-screen flex items-center justify-center animate-fade-in" 
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="text-center">
        {/* Logo Whoof with scale-in animation */}
        <div className="mb-8 animate-scale-in">
          <img 
            src={logoWhoof} 
            alt="Whoof Logo" 
            className="w-32 h-32 mx-auto"
          />
        </div>
        
        {/* Pulsating loading indicator */}
        <div className="flex justify-center gap-2">
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ 
              backgroundColor: "var(--brand-plum)",
              animationDelay: "0ms",
              animationDuration: "1.5s"
            }}
          />
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ 
              backgroundColor: "var(--brand-raspberry)",
              animationDelay: "150ms",
              animationDuration: "1.5s"
            }}
          />
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ 
              backgroundColor: "var(--brand-yellow)",
              animationDelay: "300ms",
              animationDuration: "1.5s"
            }}
          />
        </div>
      </div>
    </div>
  );
}
