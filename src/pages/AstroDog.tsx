import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronLeft, Star, Sparkles, Lightbulb, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getZodiacSign, getZodiacEmoji } from "@/utils/zodiac";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Mock data pour la compatibilité
const mockCompatibleDogs = [
  { name: "Max", sign: "Taureau", emoji: "♉", photo: "/placeholder.svg" },
  { name: "Nala", sign: "Lion", emoji: "♌", photo: "/placeholder.svg" },
  { name: "Oslo", sign: "Vierge", emoji: "♍", photo: "/placeholder.svg" },
];

export default function AstroDog() {
  const { session } = useAuth();
  const { data: isPremium, isLoading: isPremiumLoading } = usePremium();

  // Récupérer le profil et le chien de l'utilisateur
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: dog, isLoading: dogLoading } = useQuery({
    queryKey: ["dog", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const isLoading = profileLoading || dogLoading || isPremiumLoading;

  // Calculer le signe astrologique si on a le chien
  const zodiacSign = dog?.birthdate ? getZodiacSign(dog.birthdate) : null;
  const zodiacEmoji = zodiacSign ? getZodiacEmoji(zodiacSign) : "⭐";

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-6 h-6 text-muted-foreground/20 animate-pulse" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-40 right-20 w-5 h-5 text-muted-foreground/30 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute top-60 left-1/4 w-4 h-4 text-muted-foreground/15 animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-32 right-10 w-7 h-7 text-muted-foreground/20 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-80 left-1/3 w-6 h-6 text-muted-foreground/25 animate-pulse" style={{ animationDelay: "2s" }} />
        <Star className="absolute top-96 right-1/4 w-5 h-5 text-muted-foreground/30 animate-pulse" style={{ animationDelay: "2.5s" }} />
      </div>

      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6 relative z-10">
        {/* Back Button */}
        <Link 
          to="/profile/me" 
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au profil
        </Link>

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Star className="w-8 h-8 text-primary animate-pulse" fill="currentColor" />
            Astro Dog
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Les astres ont un message pour ton duo aujourd'hui ✨
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          </div>
        ) : !dog ? (
          <Card className="p-8 text-center space-y-4">
            <div className="text-4xl">🐶</div>
            <h3 className="text-lg font-semibold text-foreground">Ajoute ton chien</h3>
            <p className="text-sm text-muted-foreground">
              Pour découvrir l'horoscope de ton duo, commence par ajouter ton chien à ton profil.
            </p>
            <Button asChild>
              <Link to="/onboarding/dog">Ajouter mon chien</Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Signe astrologique du chien */}
            <Card className="p-6 space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={dog.avatar_url || dog.photo || undefined} alt={dog.name} />
                  <AvatarFallback className="text-2xl">
                    {dog.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {dog.name}
                    <span className="text-3xl">{zodiacEmoji}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {zodiacSign || "Signe inconnu"} • Horoscope du {today}
                  </p>
                </div>
              </div>
            </Card>

            {/* Horoscope du jour */}
            <Card className="p-6 space-y-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Humeur du jour</h3>
              </div>
              <p className="text-base leading-relaxed text-foreground/90">
                {dog.name} sera très sociable aujourd'hui. Une nouvelle rencontre canine pourrait devenir une belle amitié ✨
                Attention cependant : {dog.name} risque d'être un peu têtu{dog.name.endsWith('a') || dog.name.endsWith('e') ? 'e' : ''} sur la fin de journée…
              </p>
            </Card>

            {/* Compatibilité du jour */}
            <Card className="p-6 space-y-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Compatibilité</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Chiens avec lesquels {dog.name} s'entend le mieux aujourd'hui :
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {mockCompatibleDogs.map((compatDog) => (
                  <div 
                    key={compatDog.name}
                    className="flex-shrink-0 text-center space-y-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12 mx-auto">
                      <AvatarImage src={compatDog.photo} alt={compatDog.name} />
                      <AvatarFallback>{compatDog.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{compatDog.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {compatDog.sign} {compatDog.emoji}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Conseils du jour */}
            <Card className="p-6 space-y-3 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Conseil du jour</h3>
              </div>
              <p className="text-base leading-relaxed text-foreground/90">
                Une balade plus longue que d'habitude ferait beaucoup de bien à ton duo aujourd'hui.
                Ajoute un jeu d'exploration pour booster votre connexion 🐾
              </p>
            </Card>

            {/* Premium Section */}
            {!isPremium && (
              <Card className="p-6 space-y-4 bg-gradient-to-br from-accent/20 to-primary/10 border-primary/20 animate-fade-in" style={{ animationDelay: "500ms" }}>
                <div className="flex items-start gap-3">
                  <Crown className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Astro Dog Premium
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Reçois les prédictions de la semaine, des compatibilités plus précises,
                      et des conseils personnalisés selon la race et l'âge du chien.
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/premium">
                    <Crown className="h-4 w-4 mr-2" />
                    Débloquer Astro Premium
                  </Link>
                </Button>
              </Card>
            )}

            {/* Horoscopes précédents */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-accent" />
                Horoscopes précédents
              </h3>
              <p className="text-sm text-muted-foreground">
                L'historique de tes horoscopes sera bientôt disponible !
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
