import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Edit, Eye, Percent, BarChart3, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ProAccount {
  id: string;
  business_name: string;
  category: string;
  status: string;
  plan: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export default function ProDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [proAccount, setProAccount] = useState<ProAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadProAccount() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
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
              
              if (proPlan === 'pro_premium' || proPlan === 'pro_plus') {
                toast.success('Abonnement Pro activé ! 🎉');
                // Reload pro account to get updated plan
                setTimeout(() => window.location.reload(), 1000);
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

          // Remove success param from URL
          setSearchParams({});
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pro-me`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.status === 404) {
          navigate('/pro/onboarding');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load pro account');
        }

        const data = await response.json();
        setProAccount(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    }

    loadProAccount();
  }, [navigate, searchParams, setSearchParams]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approuvé
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            En attente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Refusé
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!proAccount) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-semibold">
              Paiement réussi ! Votre abonnement Pro Premium est maintenant actif.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
              Tableau de bord Pro
            </h1>
            {getStatusBadge(proAccount.status)}
          </div>
          <p className="text-lg text-muted-foreground">{proAccount.business_name}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ma fiche */}
          <Card className="p-6 rounded-2xl shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-6 h-6" style={{ color: "var(--brand-plum)" }} />
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Fredoka" }}>
                Ma fiche
              </h2>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Catégorie:</strong> {proAccount.category}
              </p>
              {proAccount.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {proAccount.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-2xl flex-1"
                onClick={() => navigate(`/annuaire/${proAccount.id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu public
              </Button>
              <Button
                className="rounded-2xl flex-1"
                style={{ backgroundColor: "var(--brand-plum)" }}
                onClick={() => navigate('/pro/onboarding')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Éditer
              </Button>
            </div>
          </Card>

          {/* Mon offre partenaire */}
          <Card className="p-6 rounded-2xl shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <Percent className="w-6 h-6" style={{ color: "var(--brand-raspberry)" }} />
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Fredoka" }}>
                Mon offre partenaire
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Créez une offre exclusive pour les utilisateurs Whoof
            </p>
            <Button
              className="w-full rounded-2xl"
              style={{ backgroundColor: "var(--brand-raspberry)" }}
              onClick={() => toast.info('Fonctionnalité à venir')}
            >
              Créer une offre
            </Button>
          </Card>

          {/* Statistiques */}
          <Card className="p-6 rounded-2xl shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6" style={{ color: "var(--brand-yellow)" }} />
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Fredoka" }}>
                Statistiques
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "var(--brand-plum)" }}>-</p>
                <p className="text-xs text-muted-foreground">Vues</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "var(--brand-raspberry)" }}>-</p>
                <p className="text-xs text-muted-foreground">Clics</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "var(--brand-yellow)" }}>-</p>
                <p className="text-xs text-muted-foreground">Contacts</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Disponible prochainement
            </p>
          </Card>

          {/* Abonnement */}
          <Card className="p-6 rounded-2xl shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6" style={{ color: "var(--brand-plum)" }} />
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Fredoka" }}>
                Abonnement
              </h2>
            </div>
            <div className="mb-4">
              <Badge 
                variant="outline" 
                className="text-lg px-4 py-1"
                style={
                  proAccount.plan === 'pro_premium' 
                    ? { backgroundColor: 'var(--brand-plum)', color: 'white', borderColor: 'var(--brand-plum)' }
                    : proAccount.plan === 'pro_plus'
                    ? { backgroundColor: 'var(--brand-raspberry)', color: 'white', borderColor: 'var(--brand-raspberry)' }
                    : undefined
                }
              >
                {proAccount.plan === 'free' && 'FREE'}
                {proAccount.plan === 'pro_plus' && 'PRO PLUS'}
                {proAccount.plan === 'pro_premium' && 'PRO PREMIUM'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {proAccount.plan === 'free' 
                ? 'Passez au plan Pro+ ou Premium pour plus de visibilité'
                : 'Gérez votre abonnement depuis le portail Stripe'}
            </p>
            {proAccount.plan === 'free' ? (
              <Button
                className="w-full rounded-2xl"
                style={{ backgroundColor: "var(--brand-plum)" }}
                onClick={() => navigate('/pro/pricing')}
              >
                Passer au plan supérieur
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      navigate('/login');
                      return;
                    }

                    const { data, error } = await supabase.functions.invoke('customer-portal');

                    if (error) throw error;
                    if (data?.url) {
                      window.open(data.url, '_blank');
                    } else {
                      toast.error('Impossible d\'ouvrir le portail');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error('Erreur lors de l\'ouverture du portail');
                  }
                }}
              >
                Gérer l'abonnement
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
