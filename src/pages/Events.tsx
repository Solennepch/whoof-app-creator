import { motion } from "framer-motion";
import { Trophy, Sparkles, Gift, TrendingUp } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useUserXP } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { XpProgress } from "@/components/ui/XpProgress";
import { ChallengeLeaderboard } from "@/components/events/ChallengeLeaderboard";
import { ChallengeStats } from "@/components/events/ChallengeStats";
import { ShareAchievement } from "@/components/events/ShareAchievement";
import { SeasonCard } from "@/components/events/SeasonCard";
import { SpecialEventWidget } from "@/components/events/SpecialEventWidget";
import { DailyMissionsWidget } from "@/components/events/DailyMissionsWidget";
import { GamificationWrapper } from "@/components/gamification/GamificationWrapper";
import { InteractiveTutorial } from "@/components/tutorial/InteractiveTutorial";
import { TUTORIALS } from "@/config/tutorials";
import { useConfettiEvents } from "@/hooks/useConfettiEvents";
import { useEffect } from "react";

export default function Events() {
  const { user } = useAuth();
  const { currentChallenge, challengeProgress, isLoading: eventsLoading } = useEvents();
  const { data: xpData, isLoading: xpLoading } = useUserXP(user?.id);

  // Active les confettis pour les événements
  useConfettiEvents();

  const isLoading = eventsLoading || xpLoading;

  const progress = challengeProgress?.currentProgress || 0;
  const target = currentChallenge?.objectiveTarget || 1;
  const percentage = Math.min((progress / target) * 100, 100);
  const isCompleted = challengeProgress?.isCompleted || false;

  // Déclencher confettis si challenge complété
  useEffect(() => {
    if (isCompleted && currentChallenge) {
      window.dispatchEvent(new CustomEvent('challenge-completed', {
        detail: { challengeName: currentChallenge.name, reward: currentChallenge.reward }
      }));
    }
  }, [isCompleted, currentChallenge]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Season Card */}
        <SeasonCard />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Challenges & Saisons</h1>
              <p className="text-sm text-muted-foreground">
                Participe aux défis du moment avec ton chien et gagne de l'XP.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero - Challenge du mois */}
        {currentChallenge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-background border-primary/30 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Challenge du mois</CardTitle>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {currentChallenge.badge} {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {currentChallenge.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Objectif : {currentChallenge.objective}
                  </p>
                </div>

                {/* Progression */}
                <div className="space-y-2 bg-background/50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      Tu en es à : {progress} / {target}
                    </span>
                    <span className="text-primary font-bold">{Math.round(percentage)}%</span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  {!isCompleted && (
                    <p className="text-xs text-muted-foreground">
                      Encore {Math.max(0, target - progress)} {currentChallenge.objectiveType === 'walks' ? 'balades' : 'actions'} avant ton prochain palier de récompense 🎁
                    </p>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Sparkles className="h-4 w-4" />
                      Challenge terminé ! 🎉
                    </div>
                  )}
                </div>

                {/* Reward */}
                <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Récompense :</span>
                    <span className="text-sm text-muted-foreground">{currentChallenge.reward}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <ShareAchievement
                    challengeName={currentChallenge.name}
                    progress={progress}
                    target={target}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!currentChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 text-center"
          >
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              ✨ Pas encore de challenge actif.
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Les prochains défis arrivent bientôt, continue tes balades pour gagner de l'XP !
            </p>
          </motion.div>
        )}

        {/* Quêtes du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
              🐾 Quêtes du jour
            </h2>
            <p className="text-sm text-muted-foreground">
              Complète ces missions pour gagner des XP supplémentaires.
            </p>
          </div>
          <GamificationWrapper featureName="dailyMissions">
            <DailyMissionsWidget />
          </GamificationWrapper>
        </motion.div>

        {/* Ta saison en cours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-xl font-semibold mb-1">Ta saison en cours</h2>
          </div>
          <ChallengeStats />
        </motion.div>

        {/* XP Progress */}
        {xpData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ta progression XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <XpProgress xpData={xpData} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mini Classement de la saison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Classement de la saison</h2>
            <a href="/ranking" className="text-sm text-primary hover:underline">
              Voir le classement complet →
            </a>
          </div>
          <GamificationWrapper featureName="leaderboards">
            <ChallengeLeaderboard />
          </GamificationWrapper>
        </motion.div>

        {/* Challenges spéciaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-xl font-semibold mb-1">Challenges spéciaux</h2>
          </div>
          <GamificationWrapper featureName="specialEvents">
            <SpecialEventWidget />
          </GamificationWrapper>
        </motion.div>
      </div>

      {/* Tutorial */}
      <InteractiveTutorial steps={TUTORIALS.gamification} />
    </div>
  );
}
