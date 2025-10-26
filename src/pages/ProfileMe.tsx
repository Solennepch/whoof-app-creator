import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logoWhoof from "@/assets/logo-whoof.png";

export default function ProfileMe() {
  const navigate = useNavigate();

  useEffect(() => {
    async function redirectToUserProfile() {
      try {
        // Get current session to extract auth token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // Call GET /profile edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401 || response.status === 400) {
          // Unauthorized or error, redirect to login
          navigate('/login', { replace: true });
          return;
        }

        if (response.ok) {
          const profile = await response.json();
          // Redirect to user's profile page
          navigate(`/profile/${profile.id}`, { replace: true });
        } else {
          // Other errors, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
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
