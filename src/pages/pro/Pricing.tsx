import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    icon: Zap,
    color: 'var(--brand-yellow)',
    features: [
      'Fiche annuaire basique',
      'Apparition dans les résultats de recherche',
      'Coordonnées publiques',
      'Logo et description',
    ],
    limitations: [
      'Pas d\'offre partenaire',
      'Pas de mise en avant',
      'Statistiques limitées',
    ],
  },
  {
    name: 'Pro Plus',
    price: 19.90,
    priceId: 'price_1SMY3rDL0qnGuzb7P4DcyhG7',
    icon: Star,
    color: 'var(--brand-raspberry)',
    badge: 'Populaire',
    features: [
      'Tout du plan Free',
      'Fiche enrichie avec galerie photos',
      '1 offre partenaire active',
      'Mise en avant dans les recherches locales',
      'Badge "Partenaire Certifié"',
      'Statistiques de vues et clics',
      'Support prioritaire',
    ],
    limitations: [],
  },
  {
    name: 'Pro Premium',
    price: 49.90,
    priceId: 'price_1SMY4MDL0qnGuzb70gJe0k0B',
    icon: Crown,
    color: 'var(--brand-plum)',
    badge: 'Meilleur choix',
    features: [
      'Tout du plan Pro Plus',
      'Offres partenaires illimitées',
      'Position sponsorisée en tête de liste',
      'Badge "Partenaire Premium"',
      'Analytics étendus et reporting',
      'Intégration API (à venir)',
      'Support dédié 24/7',
      'Campagnes promotionnelles (à venir)',
    ],
    limitations: [],
  },
];

export default function ProPricing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!priceId) {
      navigate('/pro/onboarding');
      return;
    }

    setIsLoading(priceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Développez votre activité avec Whoof et touchez plus de propriétaires de chiens
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.badge === 'Populaire';
            const isBest = plan.badge === 'Meilleur choix';

            return (
              <Card
                key={plan.name}
                className={`p-8 rounded-3xl shadow-soft relative ${
                  isPopular || isBest ? 'ring-2 ring-offset-4' : ''
                }`}
                style={
                  isPopular || isBest
                    ? { borderColor: plan.color, borderWidth: '2px', borderStyle: 'solid' }
                    : undefined
                }
              >
                {/* Badge */}
                {plan.badge && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    style={{ backgroundColor: plan.color }}
                  >
                    {plan.badge}
                  </Badge>
                )}

                {/* Icon */}
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
                  style={{ backgroundColor: `${plan.color}20` }}
                >
                  <Icon className="w-8 h-8" style={{ color: plan.color }} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "Fredoka" }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-6">
                  {plan.price === 0 ? (
                    <div className="text-4xl font-bold" style={{ color: plan.color }}>
                      Gratuit
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold" style={{ color: plan.color }}>
                        {plan.price}€
                      </div>
                      <div className="text-sm text-muted-foreground">par mois</div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full rounded-2xl"
                  style={{ backgroundColor: plan.color }}
                  onClick={() => handleSubscribe(plan.priceId || '', plan.name)}
                  disabled={isLoading === plan.priceId}
                >
                  {isLoading === plan.priceId
                    ? 'Redirection...'
                    : plan.price === 0
                    ? 'Commencer gratuitement'
                    : 'Souscrire maintenant'}
                </Button>
              </Card>
            );
          })}
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
