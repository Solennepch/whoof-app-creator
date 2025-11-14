import { motion } from "framer-motion";
import { Trophy, Calendar, Award, TrendingUp, Gift, Sparkles } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useUserBadges, useUserXP } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { XpProgress, levelForXp } from "@/components/ui/XpProgress";
import { ChallengeHistory } from "@/components/events/ChallengeHistory";
import { ChallengeLeaderboard } from "@/components/events/ChallengeLeaderboard";
import { ChallengeStats } from "@/components/events/ChallengeStats";
import { DailyChallenges } from "@/components/events/DailyChallenges";
import { ShareAchievement } from "@/components/events/ShareAchievement";
import { SeasonCard } from "@/components/events/SeasonCard";
import { QuestsList } from "@/components/events/QuestsList";
import { ActivityFeed } from "@/components/events/ActivityFeed";
import { SpecialEventWidget } from "@/components/events/SpecialEventWidget";
import { GuildWidget } from "@/components/events/GuildWidget";
import { CosmeticsShowcase } from "@/components/events/CosmeticsShowcase";
import { SecretAchievements } from "@/components/events/SecretAchievements";
import { LeagueStandings } from "@/components/events/LeagueStandings";
import { ReferralSystem } from "@/components/events/ReferralSystem";
import { DailyMissionsWidget } from "@/components/events/DailyMissionsWidget";
import { GamificationWrapper } from "@/components/gamification/GamificationWrapper";
import { InteractiveTutorial } from "@/components/tutorial/InteractiveTutorial";
import { TUTORIALS } from "@/config/tutorials";
import { useConfettiEvents } from "@/hooks/useConfettiEvents";
import { useEffect } from "react";

export default function Events() {
  const { user } = useAuth();
  const { currentEvent, currentChallenge, challengeProgress, isLoading: eventsLoading } = useEvents();
  const { data: badges, isLoading: badgesLoading } = useUserBadges(user?.id);
  const { data: xpData, isLoading: xpLoading } = useUserXP(user?.id);

  // Active les confettis pour les événements
  useConfettiEvents();

  const isLoading = eventsLoading || badgesLoading || xpLoading;

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Season Card */}
        <SeasonCard />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Événements & Challenges
          </h1>
          <p className="text-muted-foreground">
            Participe aux événements et relève les challenges du mois
          </p>
        </motion.div>

        {/* Current Event */}
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Événement du mois
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background text-4xl">
                    {currentEvent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {currentEvent.name}
                    </h3>
                    <p className="text-muted-foreground mb-3">{currentEvent.description}</p>
                    <div className="space-y-2">
                      {currentEvent.activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-foreground">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Challenge */}
        {currentChallenge && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Challenge du mois
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background text-4xl">
                    {currentChallenge.badge}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {currentChallenge.name}
                    </h3>
                    <p className="text-muted-foreground">{currentChallenge.objective}</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-4 p-4 rounded-2xl bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Ta progression</span>
                    </div>
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {progress} / {target}
                    </Badge>
                  </div>

                  <div className="relative">
                    <Progress value={percentage} className="h-4" />
                    {percentage > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute -top-2 left-0 h-8 w-8 rounded-full bg-primary border-4 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
                        style={{ left: `calc(${Math.min(percentage, 95)}% - 16px)` }}
                      >
                        {Math.round(percentage)}%
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <Gift className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Récompense</p>
                      <p className="text-sm text-muted-foreground">{currentChallenge.reward}</p>
                    </div>
                    <ShareAchievement
                      title={currentChallenge.name}
                      description={currentChallenge.objective}
                      badge={currentChallenge.badge}
                    />
                  </div>

                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center"
                    >
                      <Trophy className="h-8 w-8 text-primary mx-auto mb-2 fill-primary" />
                      <p className="font-semibold text-primary text-lg">Challenge complété ! 🎉</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Félicitations, tu as obtenu ta récompense !
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* XP Progress */}
        {xpData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <XpProgress
              current={xpData.total_xp || 0}
              min={0}
              max={5400}
              t={(k) => ({ level: "Niveau" }[k] || k)}
            />
          </motion.div>
        )}

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ActivityFeed />
        </motion.div>

        {/* Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <QuestsList />
        </motion.div>

        {/* Daily Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <DailyChallenges />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChallengeStats />
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <ChallengeLeaderboard />
        </motion.div>

        {/* Challenge History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ChallengeHistory />
        </motion.div>

        {/* Special Event */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <SpecialEventWidget />
        </motion.div>

        {/* Guild */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GuildWidget />
        </motion.div>

        {/* Cosmetics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <CosmeticsShowcase />
        </motion.div>

        {/* Daily Missions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <DailyMissionsWidget />
        </motion.div>

        {/* League Standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <LeagueStandings />
        </motion.div>

        {/* Secret Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <SecretAchievements />
        </motion.div>

        {/* Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
        >
          <ReferralSystem />
        </motion.div>

        {/* Badges Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Mes badges ({badges?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {badges.map((userBadge) => (
                    <motion.div
                      key={userBadge.badge_code}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 hover:border-primary/50 transition-all"
                    >
                      <div className="text-3xl">{userBadge.badge?.icon || "🏆"}</div>
                      <p className="text-xs text-center font-medium text-foreground line-clamp-2">
                        {userBadge.badge?.name || "Badge"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Aucun badge pour le moment
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Relève des challenges pour gagner tes premiers badges !
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Tutorial for Gamification */}
      <InteractiveTutorial
        tutorialId="gamification"
        steps={TUTORIALS.gamification.steps}
      />
    </div>
  );
}
