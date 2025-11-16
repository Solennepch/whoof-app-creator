import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Sparkles, Trophy, Crown, Dog, Star, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserXP, useUserBadges, useAllBadges } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { levelForXp } from "@/components/ui/XpProgress";
import { motion } from "framer-motion";

const DAILY_QUESTS = [
  { id: "walk_20min", title: "Faire une balade de 20 min", xp: 20, icon: "🎯" },
  { id: "say_hello", title: "Dire bonjour à 1 chien", xp: 15, icon: "👋" },
  { id: "post_photo", title: "Poster une photo", xp: 10, icon: "📸" },
  { id: "steps_3000", title: "3 000 pas avec ton chien", xp: 25, icon: "🚶" },
];

const REWARD_CHESTS = [
  { id: "bronze", name: "Coffre Bronze", xp: 100, reward: "1 badge aléatoire", icon: "🎁", color: "from-amber-600/20 to-amber-800/20" },
  { id: "silver", name: "Coffre Argent", xp: 150, reward: "1 badge + bonus", icon: "✨", color: "from-gray-400/20 to-gray-600/20" },
  { id: "gold", name: "Coffre Or", xp: 250, reward: "Badge rare + skin", icon: "👑", color: "from-yellow-400/20 to-yellow-600/20", premium: true },
];

export default function Recompenses() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  
  const { data: xpSummary, isLoading: xpLoading } = useUserXP(session?.user?.id);
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges(session?.user?.id);
  const { data: allBadges, isLoading: allBadgesLoading } = useAllBadges();
  
  // Ne pas utiliser useProfileData si on n'a pas de session, évite les redirections
  const profileData = useProfileData(session?.user?.id || undefined);
  const profile = profileData.profile;
  const dogs = profileData.dogs;
  const primaryDog = dogs?.[0];

  const currentLevel = levelForXp(xpSummary?.total_xp || 0);
  const totalXP = xpSummary?.total_xp || 0;
  const xpTable = [0, 500, 1200, 2200, 3600, 5400];
  const nextLevelXP = xpTable[currentLevel] || (currentLevel * 1200);
  const remainingToNext = nextLevelXP - totalXP;
  const progressPercent = ((totalXP - (xpTable[currentLevel - 1] || 0)) / (nextLevelXP - (xpTable[currentLevel - 1] || 0))) * 100;

  const isLoading = xpLoading || badgesLoading || allBadgesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <main className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
          <Skeleton className="h-32 rounded-[24px]" />
        </main>
      </div>
    );
  }

  if (!xpSummary || totalXP === 0) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <main className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
          <div className="text-center space-y-2">
            <Gift className="w-12 h-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Récompenses</h1>
          </div>
          <Card><CardContent className="py-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Aucune récompense</h3>
            <p className="text-sm text-muted-foreground mb-6">Fais ta première balade !</p>
            <Button onClick={() => navigate("/balades")} className="rounded-full">Commencer</Button>
          </CardContent></Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <main className="mx-auto max-w-[720px] px-4 pt-20 pb-6 space-y-6">
        <div className="text-center space-y-2 mb-6">
          <Gift className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Récompenses</h1>
          <p className="text-sm text-muted-foreground">Gagne des XP et débloque des badges</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-[24px] border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-2 border-primary">
                  <AvatarImage src={primaryDog?.avatar_url || profile?.avatar_url || undefined} />
                  <AvatarFallback><Dog className="w-10 h-10" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-lg font-bold">{primaryDog?.name || profile?.display_name || "Ton duo"} 🐶✨</div>
                  <div className="text-sm text-muted-foreground">Niveau {currentLevel} • {totalXP} XP</div>
                </div>
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Niveau {currentLevel + 1}</span>
                  <span>{Math.max(0, remainingToNext)} XP</span>
                </div>
                <Progress value={Math.min(100, progressPercent)} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="rounded-[24px]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" />Badges</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {allBadges?.slice(0, 9).map(badge => {
                const unlocked = userBadges?.some(ub => ub.badge_code === badge.code);
                return (
                  <Card key={badge.code} className={unlocked ? "bg-amber-50 border-amber-200" : "opacity-40"}>
                    <CardContent className="p-3 text-center">
                      <div className="text-3xl">{badge.icon || "🏆"}</div>
                      <div className="text-xs font-semibold truncate">{badge.name}</div>
                      {!unlocked && <Lock className="w-3 h-3 mx-auto mt-1" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Quêtes 🐾</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DAILY_QUESTS.map(quest => {
              const done = completedQuests.includes(quest.id);
              return (
                <Card key={quest.id} className={done ? "bg-green-50" : ""} onClick={() => setCompletedQuests(p => p.includes(quest.id) ? p.filter(i => i !== quest.id) : [...p, quest.id])}>
                  <CardContent className="p-4 flex items-center gap-3 cursor-pointer">
                    <Checkbox checked={done} className="rounded-full" />
                    <div className="text-2xl">{quest.icon}</div>
                    <div className="flex-1 text-sm">{quest.title}</div>
                    <Badge>+{quest.xp} XP</Badge>
                    {done && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-[24px]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-600" />Premium 👑</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Débloque coffres OR et badges rares</p>
            <Button className="w-full rounded-full" onClick={() => navigate("/premium")}><Crown className="w-4 h-4 mr-2" />Débloquer</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
