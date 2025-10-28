import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";

const PLAN = {
  name: 'Pro Premium',
  price: 19.90,
  lookupKey: 'whoof_pro_premium_monthly',
  priceId: 'price_1SMYIODL0qnGuzb7w0btGE8o',
  icon: Crown,
  color: 'var(--brand-plum)',
  badge: 'Recommandé',
  features: [
    'Fiche annuaire enrichie avec galerie photos',
    'Offres partenaires illimitées',
    'Position sponsorisée en tête de liste',
    'Badge "Partenaire Premium"',
    'Analytics étendus et reporting',
    'Intégration API (à venir)',
    'Support dédié 24/7',
    'Campagnes promotionnelles (à venir)',
  ],
};

export default function ProPricing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Vous devez être connecté');
        navigate('/login');
        return;
      }

      // Call the edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
        body: {
          lookupKey: PLAN.lookupKey,
          priceId: PLAN.priceId,
          type: 'pro',
          successUrl: `${window.location.origin}/pro/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pro/pricing?canceled=true`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erreur lors de la création de la session');
      }

      if (!data?.url) {
        throw new Error('Aucune URL de paiement reçue');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du paiement';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = PLAN.icon;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Whoof Pro Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Développez votre activité avec Whoof et touchez plus de propriétaires de chiens
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card
            className="p-8 rounded-3xl shadow-soft relative ring-2 ring-offset-4"
            style={{ borderColor: PLAN.color, borderWidth: '2px', borderStyle: 'solid' }}
          >
            {/* Badge */}
            <Badge
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-semibold"
              style={{ backgroundColor: PLAN.color }}
            >
              {PLAN.badge}
            </Badge>

            {/* Icon */}
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
              style={{ backgroundColor: `${PLAN.color}20` }}
            >
              <Icon className="w-8 h-8" style={{ color: PLAN.color }} />
            </div>

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "Fredoka" }}>
              {PLAN.name}
            </h3>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold" style={{ color: PLAN.color }}>
                {PLAN.price.toFixed(2)}€
              </div>
              <div className="text-sm text-muted-foreground">par mois</div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {PLAN.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: PLAN.color }} />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              className="w-full rounded-2xl text-white font-semibold"
              style={{ backgroundColor: PLAN.color }}
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : "S'abonner à Pro Premium"}
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Fredoka" }}>
            Questions fréquentes
          </h2>
          <div className="space-y-4 text-left">
            <details className="bg-white p-4 rounded-2xl shadow-soft">
              <summary className="font-semibold cursor-pointer">
                Puis-je changer de plan à tout moment ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord.
              </p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow-soft">
              <summary className="font-semibold cursor-pointer">
                Comment fonctionne l'engagement ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Nos abonnements sont mensuels sans engagement. Vous pouvez annuler à tout moment.
              </p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow-soft">
              <summary className="font-semibold cursor-pointer">
                Que se passe-t-il si j'annule mon abonnement ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous conservez l'accès à votre plan jusqu'à la fin de la période payée, puis repassez automatiquement au plan Free.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
