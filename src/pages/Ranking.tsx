import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Dog, User, Star, Sparkles, Calendar, Award, Gift, TrendingUp, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWeeklyLeaderboard, useUserXP } from "@/hooks/useGamification";
import { levelForXp } from "@/components/ui/XpProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallenges } from "@/components/events/DailyChallenges";
import { ChallengeHistory } from "@/components/events/ChallengeHistory";
import { ChallengeLeaderboard } from "@/components/events/ChallengeLeaderboard";
import { LeagueStandings } from "@/components/events/LeagueStandings";
import { SeasonCard } from "@/components/events/SeasonCard";
import { GamificationWrapper } from "@/components/gamification/GamificationWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Ranking() {
  const [activeTab, setActiveTab] = useState<"ranking" | "challenges">("ranking");
  const [activePeriod, setActivePeriod] = useState<"weekly" | "monthly">("weekly");
  const { user } = useAuth();
  const { currentChallenge, challengeProgress } = useEvents();

  const { session } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: leaderboard, isLoading } = useWeeklyLeaderboard(profile?.city);
  const { data: myXP } = useUserXP(session?.user?.id);

  const myRank = leaderboard?.findIndex(entry => entry.user_id === session?.user?.id);
  const myRanking = myRank !== undefined && myRank !== -1 ? leaderboard?.[myRank] : null;

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)"
    }}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-40 right-20 w-5 h-5 text-white/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute top-60 left-1/4 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-32 right-10 w-7 h-7 text-white/25 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-80 left-1/3 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "2s" }} />
        <Star className="absolute top-96 right-1/4 w-5 h-5 text-white/35 animate-pulse" style={{ animationDelay: "2.5s" }} />
        <Sparkles className="absolute bottom-40 left-20 w-4 h-4 text-white/25 animate-pulse" style={{ animationDelay: "3s" }} />
        <Star className="absolute bottom-60 right-16 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "3.5s" }} />
      </div>

      <main className="mx-auto max-w-[720px] px-4 pb-20 space-y-5 relative z-10">
        {/* Header */}
        <div className="pt-20 pb-4 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Classement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Découvre où ton duo se situe cette semaine
          </p>
        </div>

        {/* Season Card */}
        <SeasonCard />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ranking" | "challenges")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ranking">
              <Trophy className="mr-2 h-4 w-4" />
              Classement
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Award className="mr-2 h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-6">
            {/* User Position Card */}
            {myRanking && myXP && profile ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-[24px] p-6 shadow-soft border border-primary/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      <Dog className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-primary">#{myRank! + 1}</span>
                      <span className="text-sm text-muted-foreground">sur {leaderboard?.length || 0}</span>
                    </div>
                    <div className="text-base font-semibold">{profile.display_name || "Toi"}</div>
                    <div className="text-sm text-muted-foreground">
                      Niveau {levelForXp(myXP.total_xp)} • {myXP.total_xp} XP
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{myRanking.weekly_xp} XP cette semaine</span>
                    <span>Prochain rang : {Math.max(0, (leaderboard?.[Math.max(0, myRank! - 1)]?.weekly_xp || 0) - myRanking.weekly_xp)} XP</span>
                  </div>
                  <Progress value={(myRanking.weekly_xp / ((leaderboard?.[Math.max(0, myRank! - 1)]?.weekly_xp || myRanking.weekly_xp) + 1)) * 100} className="h-2" />
                  {myRank! > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Encore {Math.max(0, (leaderboard?.[myRank! - 1]?.weekly_xp || 0) - myRanking.weekly_xp)} XP pour gagner une place !
                    </p>
                  )}
                </div>
              </motion.div>
            ) : !isLoading && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Commence à gagner de l'XP pour apparaître dans le classement</p>
                </CardContent>
              </Card>
            )}

            {/* Period Tabs */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setActivePeriod("weekly")}
                variant={activePeriod === "weekly" ? "default" : "outline"}
                className="rounded-full px-6"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Hebdomadaire
              </Button>
              <Button
                onClick={() => setActivePeriod("monthly")}
                variant={activePeriod === "monthly" ? "default" : "outline"}
                className="rounded-full px-6"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Mensuel
              </Button>
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold px-2">🏆 Top 10</h2>
              
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : leaderboard && leaderboard.length > 0 ? (
                <>
                  {leaderboard.slice(0, 10).map((entry, index) => {
                    const isCurrentUser = entry.user_id === session?.user?.id;
                    const rank = index + 1;
                    const getMedalEmoji = (r: number) => {
                      if (r === 1) return "🥇";
                      if (r === 2) return "🥈";
                      if (r === 3) return "🥉";
                      return null;
                    };
                    const medal = getMedalEmoji(rank);

                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`transition-all hover:shadow-md ${
                          isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
                        } ${rank <= 3 ? "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20" : ""}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 text-center">
                                {medal ? (
                                  <span className="text-3xl">{medal}</span>
                                ) : (
                                  <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                                )}
                              </div>
                              
                              <Avatar className="w-14 h-14 border-2 border-primary/20">
                                <AvatarImage src={entry.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  <Dog className="w-7 h-7" />
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate flex items-center gap-2">
                                  {entry.profile?.display_name || "Utilisateur"}
                                  {isCurrentUser && <Badge variant="secondary" className="text-xs">Toi</Badge>}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  📍 {entry.city || "Ville inconnue"}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-base font-bold text-primary">{entry.weekly_xp}</div>
                                <div className="text-xs text-muted-foreground">XP</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  {/* Premium Teaser */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Crown className="w-5 h-5 text-amber-600" />
                          <span>Classement Premium</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Accède au classement illimité, vois toutes les stats détaillées, et découvre les duos les plus actifs de ta ville.
                        </p>
                        <Button className="w-full rounded-full" variant="default">
                          <Crown className="w-4 h-4 mr-2" />
                          Débloquer Premium
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              ) : (
                // Empty state
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun XP pour le moment</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Commence une balade pour entrer dans le classement.
                    </p>
                    <Button className="rounded-full">
                      <Dog className="w-4 h-4 mr-2" />
                      Commencer une balade
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <GamificationWrapper feature="showChallenges">
              <DailyChallenges />
            </GamificationWrapper>

            <GamificationWrapper feature="showChallenges">
              <ChallengeHistory />
            </GamificationWrapper>

            <GamificationWrapper feature="showLeaderboard">
              <ChallengeLeaderboard />
            </GamificationWrapper>

            <GamificationWrapper feature="showLeaderboard">
              <LeagueStandings />
            </GamificationWrapper>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
