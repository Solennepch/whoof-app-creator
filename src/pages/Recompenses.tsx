import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GamificationSection } from "@/components/profile/GamificationSection";
import { Crown, Zap, Heart, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserXP } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";

export default function Recompenses() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const { data: xpSummary, isLoading, error } = useUserXP(session?.user?.id);

  const currentLevel = xpSummary?.level || 1;
  const totalXP = xpSummary?.total_xp || 0;
  const nextLevelXP = (currentLevel + 1) * 200;
  const progressToNext = totalXP % 200;
  const remainingToNext = nextLevelXP - totalXP;
  const progressPercent = (progressToNext / 200) * 100;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ 
        background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)"
      }}>
        <main className="mx-auto max-w-[720px] px-4 pt-20 pb-6 space-y-6 relative z-10">
          <header className="space-y-1">
            <h1 className="text-lg font-semibold">Récompenses</h1>
            <p className="text-xs text-muted-foreground">
              Chargement de tes points et de tes niveaux…
            </p>
          </header>
          <div className="grid gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ 
        background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)"
      }}>
        <main className="mx-auto max-w-[720px] px-4 pt-20 pb-6 space-y-6 relative z-10">
          <h1 className="text-lg font-semibold">Récompenses</h1>
          <Card className="rounded-2xl border-destructive/50">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-destructive mb-2">
                Impossible de charger tes récompenses pour le moment.
              </p>
              <p className="text-xs text-muted-foreground">
                Vérifie ta connexion ou réessaie un peu plus tard.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)"
    }}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-6 h-6 text-white animate-pulse" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-40 right-20 w-5 h-5 text-white animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute top-60 left-1/4 w-4 h-4 text-white animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-32 right-10 w-7 h-7 text-white animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-80 left-1/3 w-6 h-6 text-white animate-pulse" style={{ animationDelay: "2s" }} />
        <Star className="absolute top-96 right-1/4 w-5 h-5 text-white animate-pulse" style={{ animationDelay: "2.5s" }} />
        <Sparkles className="absolute bottom-40 left-20 w-4 h-4 text-white animate-pulse" style={{ animationDelay: "3s" }} />
        <Star className="absolute bottom-60 right-16 w-6 h-6 text-white animate-pulse" style={{ animationDelay: "3.5s" }} />
      </div>

      <main className="mx-auto max-w-[720px] px-4 pt-20 pb-6 space-y-6 relative z-10">
        {/* Header */}
        <header className="space-y-1 mb-6">
          <h1 className="text-lg font-semibold">Récompenses</h1>
          <p className="text-xs text-muted-foreground">
            Plus tu sors ton chien, plus vous gagnez de l'XP, des niveaux et des badges.
          </p>
        </header>

        {/* Empty State - First Time */}
        {(!xpSummary || totalXP === 0) && (
          <Card className="border-dashed rounded-2xl">
            <CardContent className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2">
                Tu n'as pas encore gagné d'XP… mais ça va venir très vite ✨
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lance ta première balade, participe à un événement ou rencontre un nouveau duo chien·humain pour commencer à gagner des points.
              </p>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => navigate("/balades")}
              >
                Commencer une balade
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content when user has XP */}
        {xpSummary && totalXP > 0 && (
          <>
            {/* BLOC 1 — NIVEAU / PROGRESSION */}
            <Card className="rounded-2xl border-none bg-gradient-to-r from-amber-100 via-pink-100 to-indigo-100 shadow-sm">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ton duo aujourd'hui
                    </p>
                    <p className="text-xl font-extrabold">
                      Niveau {currentLevel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalXP} XP cumulés
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">
                      Prochain niveau à{" "}
                      <span className="font-semibold">
                        {nextLevelXP} XP
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progression vers le prochain niveau */}
                <div className="space-y-1">
                  <Progress
                    value={progressPercent}
                    className="h-2 rounded-full"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Plus que{" "}
                    <span className="font-semibold">
                      {remainingToNext} XP
                    </span>{" "}
                    pour passer au niveau suivant 🐾
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* BLOC 2 — Section originale gamification */}
            <GamificationSection 
              level={currentLevel}
              currentXP={totalXP}
              maxXP={nextLevelXP}
              totalRecommendations={0}
            />

            {/* BLOC 3 — XP Rewards Section */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium">Convertir mes XP</h2>
              <Card className="p-6 rounded-3xl shadow-soft bg-white">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-[#7B61FF] bg-gradient-to-br from-[#7B61FF]/5 to-transparent hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2] flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">1 mois Premium</h4>
                        <p className="text-xs text-muted-foreground">800 XP</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      disabled={totalXP < 800}
                    >
                      Échanger
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-[#FF5DA2] bg-gradient-to-br from-[#FF5DA2]/5 to-transparent hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5DA2] to-[#FFC14D] flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">5 Super Likes</h4>
                        <p className="text-xs text-muted-foreground">400 XP</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      disabled={totalXP < 400}
                    >
                      Échanger
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-[#FFC14D] bg-gradient-to-br from-[#FFC14D]/5 to-transparent hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC14D] to-[#FF5DA2] flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">Boost de visibilité</h4>
                        <p className="text-xs text-muted-foreground">500 XP</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      disabled={totalXP < 500}
                    >
                      Échanger
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* BLOC 4 — Available Rewards Info */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium">Comment gagner plus d'XP</h2>
              <Card className="p-6 rounded-3xl shadow-soft bg-gradient-to-br from-amber-50 to-indigo-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Star className="w-4 h-4 text-[#FFC14D]" />
                  <span>Gagne de l'XP en participant :</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-[#7B61FF]">•</span>
                    <span><strong>+50 XP</strong> : Complète ton profil à 100%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7B61FF]">•</span>
                    <span><strong>+100 XP</strong> : Participe à ta première balade de groupe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7B61FF]">•</span>
                    <span><strong>+200 XP</strong> : Organise un événement avec 5+ participants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7B61FF]">•</span>
                    <span><strong>+150 XP</strong> : Envoie 5 messages positifs à d'autres maîtres</span>
                  </li>
                </ul>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
