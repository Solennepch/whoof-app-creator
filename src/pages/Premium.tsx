import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Premium() {
  const [isPremium] = useState(false); // TODO: Connect to actual subscription state

  const features = [
    { icon: "🏅", text: "Badges exclusifs et avatars premium" },
    { icon: "⚡", text: "Boost XP x2 sur toutes les activités" },
    { icon: "🗺️", text: "Filtres avancés dans l'annuaire" },
    { icon: "🎁", text: "Réductions partenaires jusqu'à -30%" },
    { icon: "🔔", text: "Notifications prioritaires pour les events" },
    { icon: "💬", text: "Badge premium visible sur ton profil" }
  ];

  const handleStartTrial = () => {
    console.log('Analytics: start_trial_premium');
    toast.success("🎉 Essai gratuit activé !", {
      description: "Profite de 14 jours de Premium gratuit"
    });
  };

  const handleSubscribe = () => {
    console.log('Analytics: subscribe_premium');
    toast.success("✨ Bienvenue dans Premium !", {
      description: "Ton abonnement a été activé avec succès"
    });
  };

  if (isPremium) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--paper))" }}>
        <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "hsl(var(--ink))" }}>
              <Crown className="h-8 w-8" style={{ color: "hsl(var(--brand-yellow))" }} />
              Premium
            </h1>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              Tu es membre Premium !
            </p>
          </div>

          <Card className="rounded-2xl shadow-sm p-6 space-y-4">
            <div 
              className="p-4 rounded-xl text-center"
              style={{ 
                background: "linear-gradient(135deg, hsl(var(--brand-plum)), hsl(var(--brand-yellow)))",
              }}
            >
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-white" />
              <p className="text-lg font-bold text-white">Statut Premium Actif</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "hsl(var(--ink))" }}>
                Abonnement mensuel : 4,99€/mois
              </p>
              <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                Prochain renouvellement : 1er Mars 2025
              </p>
            </div>

            <Link to="/account/subscription">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Gérer mon abonnement
              </Button>
            </Link>
          </Card>

          <Card className="rounded-2xl shadow-sm p-6 space-y-3">
            <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--ink))" }}>
              Tes avantages Premium
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{feature.icon}</span>
                  <span className="text-sm flex-1" style={{ color: "hsl(var(--ink) / 0.8)" }}>
                    {feature.text}
                  </span>
                  <Check className="h-5 w-5 flex-shrink-0" style={{ color: "hsl(var(--brand-plum))" }} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "hsl(var(--ink))" }}>
            <Crown className="h-8 w-8" style={{ color: "hsl(var(--brand-yellow))" }} />
            Passer Premium
          </h1>
          <p className="text-sm mt-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            Débloque tous les avantages exclusifs
          </p>
        </div>

        {/* Hero Card */}
        <Card 
          className="rounded-2xl shadow-lg p-6 text-white relative overflow-hidden"
          style={{ 
            background: "linear-gradient(135deg, hsl(var(--brand-plum)), hsl(var(--brand-yellow)))"
          }}
        >
          <Sparkles className="absolute top-4 right-4 h-8 w-8 opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Essai 14 jours gratuit</h2>
            <p className="text-sm opacity-90 mb-4">
              Teste Premium sans engagement, annule à tout moment
            </p>
            <p className="text-3xl font-bold">4,99€<span className="text-lg font-normal">/mois</span></p>
          </div>
        </Card>

        {/* Features Card */}
        <Card className="rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--ink))" }}>
            ✨ Ce que tu obtiens
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{feature.icon}</span>
                <span className="text-sm flex-1" style={{ color: "hsl(var(--ink) / 0.8)" }}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleStartTrial}
            className="w-full h-12 rounded-xl text-white font-semibold text-base"
            style={{ backgroundColor: "hsl(var(--brand-plum))" }}
          >
            <Crown className="h-5 w-5 mr-2" />
            Démarrer l'essai gratuit
          </Button>
          <Button
            onClick={handleSubscribe}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "hsl(var(--brand-plum))", color: "hsl(var(--brand-plum))" }}
          >
            S'abonner directement
          </Button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-center px-4" style={{ color: "hsl(var(--ink) / 0.5)" }}>
          L'essai gratuit se transforme en abonnement mensuel à 4,99€. Annule à tout moment depuis ton compte.
        </p>
      </div>
    </div>
  );
}
