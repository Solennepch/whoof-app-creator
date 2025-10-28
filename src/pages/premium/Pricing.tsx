import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";

export default function PremiumPricing() {
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
          lookupKey: 'whoof_premium_monthly',
          priceId: 'price_1SMZuHDL0qnGuzb7rPxyAqZq',
          type: 'user',
          successUrl: `${window.location.origin}/profile/me?success=true`,
          cancelUrl: `${window.location.origin}/premium/pricing?canceled=true`,
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

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Whoof Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez toutes les fonctionnalités premium pour une expérience Whoof optimale
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card
            className="p-8 rounded-3xl shadow-soft relative ring-2 ring-offset-4"
            style={{ borderColor: "var(--brand-raspberry)", borderWidth: '2px', borderStyle: 'solid' }}
          >
            {/* Badge */}
            <Badge
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-semibold"
              style={{ backgroundColor: "var(--brand-raspberry)" }}
            >
              Le plus populaire
            </Badge>

            {/* Icon */}
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
              style={{ backgroundColor: "var(--brand-raspberry)20" }}
            >
              <Star className="w-8 h-8" style={{ color: "var(--brand-raspberry)" }} />
            </div>

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "Fredoka" }}>
              Whoof Premium
            </h3>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold" style={{ color: "var(--brand-raspberry)" }}>
                4,99€
              </div>
              <div className="text-sm text-muted-foreground">par mois</div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                'Profil enrichi avec galerie photos',
                'Matchs illimités',
                'Messages prioritaires',
                'Badge Premium visible',
                'Filtres de recherche avancés',
                'Accès aux événements premium',
                'Support prioritaire',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-raspberry)" }} />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              className="w-full rounded-2xl text-white font-semibold"
              style={{ backgroundColor: "var(--brand-raspberry)" }}
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : "S'abonner à Premium"}
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
                Puis-je annuler à tout moment ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. Aucun engagement.
              </p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow-soft">
              <summary className="font-semibold cursor-pointer">
                Comment fonctionne le paiement ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Le paiement est sécurisé par Stripe et se renouvelle automatiquement chaque mois jusqu'à annulation.
              </p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow-soft">
              <summary className="font-semibold cursor-pointer">
                Que se passe-t-il si j'annule ?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous conservez l'accès Premium jusqu'à la fin de la période payée, puis repassez au plan gratuit.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
