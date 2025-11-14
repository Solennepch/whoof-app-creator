import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GamificationSection } from "@/components/profile/GamificationSection";
import { Crown, Zap, Heart, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserXP } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";

export default function Recompenses() {
  const navigate = useNavigate();

  const { session } = useAuth();

  const { data: xpSummary } = useUserXP(session?.user?.id);

  const currentLevel = xpSummary?.level || 1;
  const totalXP = xpSummary?.total_xp || 0;
  const nextLevelXP = (currentLevel + 1) * 200;

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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Récompenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Gagne des XP et débloque des avantages exclusifs
          </p>
        </div>

        {/* Gamification & Communauté Section */}
        <GamificationSection 
          level={currentLevel}
          currentXP={totalXP}
          maxXP={nextLevelXP}
          totalRecommendations={0}
        />

        {/* Empty State - First Time */}
        {totalXP === 0 && (
          <Card className="p-6 rounded-3xl shadow-soft bg-gradient-to-br from-[#7B61FF]/5 to-[#FF5DA2]/5 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFC14D] to-[#FF5DA2] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Commence ta première activité ! 🎯
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tu n'as pas encore gagné d'XP. Lance une balade, participe à un événement ou complète ton profil pour débloquer des récompenses.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => navigate('/balades')}
                className="rounded-full"
              >
                Première balade
              </Button>
              <Button 
                onClick={() => navigate('/events')}
                variant="outline"
                className="rounded-full"
              >
                Voir les events
              </Button>
            </div>
          </Card>
        )}

        {/* XP Rewards Section */}
        <Card className="p-6 rounded-3xl shadow-soft bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: "#111827", fontFamily: "Fredoka" }}>
                Convertir mes XP
              </h3>
              <p className="text-sm text-muted-foreground">
                Échange tes points contre des récompenses
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#FFC14D20" }}>
              <Zap className="w-6 h-6" style={{ color: "#FFC14D" }} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FFC14D]/10 to-[#FF5DA2]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFC14D] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#111827" }}>1 mois Premium</p>
                  <p className="text-xs text-muted-foreground">500 XP</p>
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full font-semibold text-white"
                style={{ backgroundColor: "#FFC14D" }}
                onClick={() => navigate('/premium')}
                disabled={totalXP < 500}
              >
                {totalXP >= 500 ? 'Échanger' : 'Pas assez d\'XP'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#7B61FF]/10 to-[#FF5DA2]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5DA2] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#111827" }}>5 Super Likes</p>
                  <p className="text-xs text-muted-foreground">200 XP</p>
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full font-semibold text-white"
                style={{ backgroundColor: "#FF5DA2" }}
                disabled={totalXP < 200}
              >
                {totalXP >= 200 ? 'Échanger' : 'Pas assez d\'XP'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#7B61FF]/10 to-[#FF5DA2]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7B61FF] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#111827" }}>Boost de visibilité</p>
                  <p className="text-xs text-muted-foreground">100 XP</p>
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full font-semibold text-white"
                style={{ backgroundColor: "#7B61FF" }}
                disabled={totalXP < 100}
              >
                {totalXP >= 100 ? 'Échanger' : 'Pas assez d\'XP'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Available Rewards Info */}
        <Card className="p-5 rounded-3xl shadow-soft bg-gradient-to-r from-[#7B61FF]/10 to-[#FF5DA2]/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" style={{ color: "#FFC14D" }} />
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{ color: "#111827" }}>
                Comment gagner plus d'XP ?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complète ton profil (+50 XP)</li>
                <li>• Participe aux événements (+20 XP par événement)</li>
                <li>• Invite tes amis (+100 XP par ami actif)</li>
                <li>• Partage des recommandations (+10 XP par recommandation)</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
