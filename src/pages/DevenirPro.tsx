import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMyProProfile } from "@/hooks/usePro";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Eye,
  Star,
  Target,
  MessageSquare,
  TrendingUp,
  Gift,
  Check,
  ArrowRight,
  Sparkles,
  Crown
} from "lucide-react";

// Benefits data
const benefits = [
  {
    icon: Eye,
    title: "Visibilité locale",
    description: "Apparais en tête de l'annuaire dog-friendly"
  },
  {
    icon: Star,
    title: "Mises en avant",
    description: "Tes services recommandés aux utilisateurs autour de toi"
  },
  {
    icon: Target,
    title: "Ciblage précis",
    description: "Des maîtres concernés par ta spécialité (chiots, éducation, sport…)"
  },
  {
    icon: MessageSquare,
    title: "Demandes directes",
    description: "Les utilisateurs peuvent te contacter facilement"
  },
  {
    icon: TrendingUp,
    title: "Statistiques de profil",
    description: "Nombre de vues, clics, interactions (V2)"
  },
  {
    icon: Gift,
    title: "Partenariats & deals",
    description: "Possibilité de proposer des offres spéciales"
  }
];

// Accepted pro types
const proTypes = [
  "Éducateurs canins",
  "Vétérinaires / auxiliaires",
  "Toiletteurs",
  "Pensions & dog-sitters",
  "Pet stores & boutiques",
  "Photographe animalier",
  "Coachs comportementalistes"
];

// Steps
const steps = [
  {
    number: 1,
    title: "Crée ton profil Pro",
    description: "Ton logo, ta description, ton adresse, tes services"
  },
  {
    number: 2,
    title: "Valide ton activité",
    description: "Envoie un justificatif (simple et rapide)"
  },
  {
    number: 3,
    title: "Publie tes offres et services",
    description: "Sois visible immédiatement dans l'annuaire"
  }
];

export default function DevenirPro() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: proProfile, isLoading: proLoading } = useMyProProfile();

  const isLoading = authLoading || proLoading;

  // If user is already a pro, show different content
  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="h-64 w-full rounded-3xl mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (proProfile) {
    return (
      <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <Card 
            className="rounded-3xl shadow-soft border-2"
            style={{
              background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
              borderColor: "#10B981"
            }}
          >
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center animate-scale-in"
                  style={{ background: "#10B981" }}
                >
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "Fredoka" }}>
                🎉 Tu es déjà inscrit comme Professionnel PAWTES
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Accède à ton espace Pro pour gérer ton profil et tes offres
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/pro/home")}
                className="rounded-full px-8"
                style={{
                  background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
                  color: "white"
                }}
              >
                Accéder à mon espace Pro
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl animate-scale-in"
              style={{
                background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
              }}
            >
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground" style={{ fontFamily: "Fredoka" }}>
            Devenir Pro
          </h1>
          <p className="text-lg text-muted-foreground">
            Développe ton activité grâce à la communauté PAWTES
          </p>
        </div>

        {/* Hero Card */}
        <Card 
          className="mb-12 rounded-3xl shadow-soft border-2 overflow-hidden relative animate-fade-in"
          style={{
            background: "linear-gradient(135deg, #FFF9E6 0%, #FFE4C4 50%, #FFD1E8 100%)",
            borderColor: "var(--brand-yellow)"
          }}
        >
          <CardContent className="p-8 md:p-12 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                style={{ background: "rgba(255, 255, 255, 0.9)" }}
              >
                <Briefcase className="w-12 h-12" style={{ color: "var(--brand-raspberry)" }} />
                <Sparkles 
                  className="w-6 h-6 absolute -top-2 -right-2 animate-pulse" 
                  style={{ color: "var(--brand-yellow)" }} 
                />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Fredoka" }}>
              🏢 Rejoins les Pros PAWTES
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Plus de 10 000 propriétaires de chiens dans ta ville.
              <br />
              Fais-toi connaître en quelques minutes.
            </p>
            <Badge 
              className="text-base px-4 py-2 rounded-full"
              style={{ 
                background: "var(--brand-raspberry)",
                color: "white"
              }}
            >
              100% gratuit • Sans engagement
            </Badge>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: "Fredoka" }}>
            Pourquoi devenir Pro ?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={index}
                  className="rounded-3xl shadow-soft hover:shadow-lg transition-all hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "var(--brand-raspberry)" }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Accepted Pro Types */}
        <Card className="mb-12 rounded-3xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: "Fredoka" }}>
              Les Pros acceptés sur PAWTES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {proTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--brand-yellow)" }}
                  >
                    <Check className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-foreground">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: "Fredoka" }}>
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="rounded-3xl shadow-soft relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center text-6xl font-bold opacity-10"
                  style={{ fontFamily: "Fredoka" }}
                >
                  {step.number}
                </div>
                <CardContent className="p-6 relative z-10">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "var(--brand-raspberry)" }}
                  >
                    <span className="text-2xl font-bold text-white" style={{ fontFamily: "Fredoka" }}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Pro Teaser (optional) */}
        <Card 
          className="mb-12 rounded-3xl shadow-soft border-2"
          style={{
            background: "linear-gradient(135deg, #FFF9E6 0%, #FFE4C4 100%)",
            borderColor: "var(--brand-yellow)"
          }}
        >
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Crown className="w-12 h-12" style={{ color: "var(--brand-yellow)" }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "Fredoka" }}>
              👑 PAWTES Pro Plus
            </h3>
            <p className="text-muted-foreground mb-6">
              Mises en avant + Statistiques + Badge "Pro Certifié" (Bientôt disponible)
            </p>
            <Badge 
              className="text-sm px-4 py-2 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              Fonctionnalité à venir
            </Badge>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card 
          className="rounded-3xl shadow-soft sticky bottom-24 md:relative md:bottom-0"
          style={{ background: "var(--card)" }}
        >
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "Fredoka" }}>
              Prêt à te lancer ?
            </h3>
            <p className="text-muted-foreground mb-6">
              5 minutes — gratuit — sans engagement
            </p>
            <Button
              size="lg"
              onClick={() => {
                if (!user) {
                  navigate("/login?redirect=/pro/onboarding");
                } else {
                  navigate("/pro/onboarding");
                }
              }}
              className="rounded-full px-8 hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
                color: "white"
              }}
            >
              Créer mon compte Pro
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
