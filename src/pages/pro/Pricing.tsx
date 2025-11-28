import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Star, TrendingUp, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PRO_TIERS = {
  basic: {
    name: "Basique",
    price: "14,90€",
    priceId: "price_1SSFbYDL0qnGuzb7UhjuFO9t",
    productId: "prod_TP3jx5kRrH3awC",
    description: "Idéal pour débuter",
    icon: Star,
    popular: false,
    features: [
      "Profil visible dans l'annuaire",
      "Jusqu'à 10 photos",
      "Contact direct (email/téléphone)",
      "Notifications des demandes",
      "Badge \"Professionnel\"",
    ],
  },
  premium: {
    name: "Premium",
    price: "19,90€",
    priceId: "price_1SSFcODL0qnGuzb7yvAEGrXo",
    productId: "prod_TP3jk0TxBUDitR",
    description: "Pour développer votre activité",
    icon: TrendingUp,
    popular: true,
    features: [
      "Tout du plan Basique",
      "Profil mis en avant",
      "Photos illimitées",
      "Statistiques avancées",
      "Gestion des offres partenaires",
      "Support prioritaire",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "29,90€",
    priceId: "price_1SSFuCDL0qnGuzb7cC4z4q0I",
    productId: "prod_TP42AgOKpiRoaF",
    description: "Solution complète",
    icon: Crown,
    popular: false,
    features: [
      "Tout du plan Premium",
      "API d'intégration",
      "Support prioritaire 7j/7",
      "Consultation dédiée",
      "Accès aux événements exclusifs",
      "Badge \"Partenaire Premium\"",
    ],
  },
};

export default function ProPricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleSubscribe = async (priceId: string, tierName: string) => {
    setLoading(priceId);
    try {
      if (!session) {
        toast.error("Vous devez être connecté");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke('pro-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success(`Redirection vers le paiement...`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Erreur lors de la création de la session de paiement");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Développez votre activité avec Pawtes Pro
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PRO_TIERS).map(([key, tier]) => {
          const Icon = tier.icon;
          return (
            <Card 
              key={key}
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Le plus populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier.priceId, tier.name)}
                  disabled={loading !== null}
                >
                  {loading === tier.priceId ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    `S'abonner au plan ${tier.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Puis-je changer de plan ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Oui, vous pouvez changer de plan à tout moment depuis votre espace professionnel. 
                Le nouveau tarif sera appliqué dès le prochain cycle de facturation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comment annuler mon abonnement ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
                Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quels moyens de paiement acceptez-vous ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) 
                via notre partenaire de paiement sécurisé Stripe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
