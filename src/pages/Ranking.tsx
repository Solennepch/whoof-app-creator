import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Dog, User, Star, Sparkles, Calendar, Award, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWeeklyLeaderboard, useUserXP } from "@/hooks/useGamification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallenges } from "@/components/events/DailyChallenges";
import { ChallengeHistory } from "@/components/events/ChallengeHistory";
import { ChallengeLeaderboard } from "@/components/events/ChallengeLeaderboard";
import { LeagueStandings } from "@/components/events/LeagueStandings";
import { SeasonCard } from "@/components/events/SeasonCard";
import { GamificationWrapper } from "@/components/gamification/GamificationWrapper";

export default function Ranking() {
  const [activeTab, setActiveTab] = useState("ranking");
  const { user } = useAuth();
  const { currentChallenge, challengeProgress } = useEvents();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

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
        <div className="pt-20 pb-4">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Classement & Challenges
          </h1>
        </div>

        {/* Season Card */}
        <SeasonCard />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          <TabsContent value="ranking" className="space-y-5">

        {/* Sticky Summary Card */}
        {myRanking && myRank !== undefined && (
          <section className="sticky top-[56px] z-10 rounded-2xl p-4 bg-gradient-to-r from-[#7B61FF] to-[#FF5DA2] text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs leading-4 opacity-90">Ta position</p>
                <p className="text-2xl font-extrabold">#{myRank + 1}</p>
              </div>
              <div className="text-right">
                <p className="text-xs leading-4 opacity-90">{activeTab === "weekly" ? "Cette semaine" : "Ce mois"}</p>
                <p className="text-2xl font-extrabold">{myRanking.weekly_xp} XP</p>
                <p className="text-xs leading-4 opacity-90">Niveau {myXP?.level || 1}</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/30 overflow-hidden">
              <div 
                className="h-full bg-white/90 transition-all duration-300" 
                style={{ width: `${Math.min((myRanking.weekly_xp / (leaderboard?.[0]?.weekly_xp || 1)) * 100, 100)}%` }}
              />
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-white/70 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === "weekly" 
                ? "bg-white shadow text-[#111827]" 
                : "text-gray-600"
            }`}
          >
            Hebdo
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === "monthly" 
                ? "bg-white shadow text-[#111827]" 
                : "text-gray-600"
            }`}
          >
            Mensuel
          </button>
        </div>

        {/* Rankings List */}
        <ul className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-white/60">
              Chargement du classement...
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="rounded-2xl p-8 bg-white text-center">
              <p className="text-gray-600">
                Aucun classement disponible pour le moment.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Commencez à gagner des XP pour apparaître dans le classement !
              </p>
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isMe = entry.user_id === session?.user?.id;
              const rankNum = index + 1;
              
              return (
                <li key={entry.id}>
                  <article 
                    className={`rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${
                      isMe 
                        ? "ring-4 ring-[#7B61FF] shadow-lg scale-[1.02]" 
                        : "bg-white"
                    }`}
                    style={isMe ? {
                      background: "linear-gradient(135deg, rgba(123, 97, 255, 0.15) 0%, rgba(255, 93, 162, 0.15) 100%)",
                      backdropFilter: "blur(10px)"
                    } : {}}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      {rankNum <= 3 ? (
                        <div 
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: rankNum === 1 ? "#FFC14D" : 
                                           rankNum === 2 ? "#E5E7EB" : 
                                           "#D1D5DB"
                          }}
                        >
                          <Trophy 
                            className="w-5 h-5"
                            style={{
                              color: rankNum === 1 ? "#ffffff" : 
                                    rankNum === 2 ? "#6B7280" :
                                    "#7B61FF"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-[#111827] shrink-0">
                          #{rankNum}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="min-w-0">
                        <p className="text-base font-semibold truncate text-[#111827] flex items-center gap-1">
                          <User className="w-4 h-4 inline" />
                          {entry.profile?.display_name || "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{entry.city || "Ville inconnue"}</p>
                      </div>
                    </div>

                    {/* XP Count */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold leading-none" style={{ color: "#7B61FF" }}>
                        {entry.weekly_xp}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">XP</p>
                    </div>
                  </article>
                </li>
              );
            })
          )}
        </ul>
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
