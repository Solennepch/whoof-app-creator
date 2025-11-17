import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import logoWhoof from "@/assets/logo-whoof-v3.png";

function ProfileMeContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    async function checkAndRedirect() {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      try {
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }

        // Check if returning from successful checkout
        const success = searchParams.get('success');
        if (success === 'true') {
          setShowSuccess(true);
          
          // Call check-subscription endpoint
          try {
            const checkResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (checkResponse.ok) {
              const { isPremium } = await checkResponse.json();
              if (isPremium) {
                toast.success('Abonnement Premium activé ! 🎉');
              }
            }
          } catch (error) {
            console.error('Error checking subscription:', error);
          }

          // Wait a bit before continuing
          await new Promise(resolve => setTimeout(resolve, 1500));
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

        // Handle 401 - Unauthorized
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        // Handle 200 - Success
        if (response.ok) {
          const data = await response.json();
          const profile = data?.profile;
          
          if (!profile || !profile.id) {
            toast.error('Erreur lors du chargement du profil');
            setIsLoading(false);
            return;
          }

          // Check if profile is empty/newly created (no display_name or empty)
          const isEmpty = !profile.display_name || profile.display_name.trim() === '';
          
          if (isEmpty) {
            // Show onboarding card
            setShowOnboarding(true);
            setIsLoading(false);
            return;
          }
          
          // Profile exists and is filled → redirect to profile page
          navigate(`/profile/${profile.id}`, { replace: true });
          return;
        }

        // Handle other errors
        console.error('Unexpected response status:', response.status);
        toast.error('Erreur lors du chargement du profil');
        setIsLoading(false);

      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Erreur lors du chargement du profil');
        setIsLoading(false);
      }
    }

    checkAndRedirect();
  }, [session, authLoading, navigate, searchParams]);

  // Show onboarding card for empty profile
  if (showOnboarding) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
      >
        <Card className="max-w-md w-full p-8 rounded-3xl shadow-soft text-center">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
            style={{ 
              background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)" 
            }}
          >
            <Sparkles 
              className="w-8 h-8 text-white" 
            />
          </div>
          
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
          >
            Bienvenue sur Whoof !
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Crée ton profil et celui de ton chien pour démarrer l'aventure avec la communauté Whoof.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/settings')}
              className="rounded-2xl text-white font-semibold"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              Créer mon profil maintenant
            </Button>
            
            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              className="rounded-2xl"
            >
              Plus tard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading screen
  if (isLoading || authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center animate-fade-in" 
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
      >
        <div className="text-center max-w-md px-4">
          {/* Success Message */}
          {showSuccess && (
            <Alert className="mb-8 bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-semibold">
                Paiement réussi ! Votre abonnement Premium est maintenant actif.
              </AlertDescription>
            </Alert>
          )}

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

  return null;
}

export default function ProfileMe() {
  return (
    <ErrorBoundary>
      <ProfileMeContent />
    </ErrorBoundary>
  );
}
