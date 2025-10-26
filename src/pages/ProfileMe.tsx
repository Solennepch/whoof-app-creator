import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import logoWhoof from "@/assets/logo-whoof.png";

export default function ProfileMe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function checkSubscriptionAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
              const { isPremium, proPlan } = await checkResponse.json();
              
              if (isPremium) {
                toast.success('Abonnement Premium activé ! 🎉');
                // UI updates handled by profile data refresh
              }
              
              console.log('Subscription status:', { isPremium, proPlan });
            } else {
              console.error('Error checking subscription:', await checkResponse.text());
              toast.info('Impossible de vérifier l\'abonnement, mais vous êtes bien connecté.');
            }
          } catch (error) {
            console.error('Error checking subscription:', error);
            toast.info('Impossible de vérifier l\'abonnement, mais vous êtes bien connecté.');
          }

          // Wait a bit before redirecting to show the success message
          await new Promise(resolve => setTimeout(resolve, 2000));
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
          navigate('/login', { replace: true });
          return;
        }

        if (response.ok) {
          const profile = await response.json();
          navigate(`/profile/${profile.id}`, { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/login', { replace: true });
      }
    }

    checkSubscriptionAndRedirect();
  }, [navigate, searchParams]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center animate-fade-in" 
      style={{ backgroundColor: "var(--paper)" }}
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
