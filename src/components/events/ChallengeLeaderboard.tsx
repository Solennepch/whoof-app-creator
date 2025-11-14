import { motion } from "framer-motion";
import { TrendingUp, Medal, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useEffect } from "react";

interface LeaderboardEntry {
  user_id: string;
  current_progress: number;
  target_progress: number;
  is_completed: boolean;
  profiles?: {
    display_name: string | null;
    city: string | null;
    avatar_url: string | null;
  } | null;
}

export function ChallengeLeaderboard() {
  const { user } = useAuth();
  const { currentChallenge } = useEvents();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["challenge-leaderboard", currentChallenge?.id, user?.id],
    queryFn: async () => {
      if (!currentChallenge?.id || !user?.id) return [];

      // Récupérer la ville de l'utilisateur
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user.id)
        .maybeSingle();

      const userCity = userProfile?.city;

      // Récupérer le leaderboard
      const { data: progressData, error: progressError } = await supabase
        .from("challenge_progress")
        .select("user_id, current_progress, target_progress, is_completed")
        .eq("challenge_id", currentChallenge.id)
        .order("current_progress", { ascending: false })
        .limit(20);

      if (progressError) throw progressError;

      // Récupérer les profils des utilisateurs
      const userIds = progressData?.map((p) => p.user_id) || [];
      
      let profilesQuery = supabase
        .from("profiles")
        .select("id, display_name, city, avatar_url")
        .in("id", userIds);

      if (userCity) {
        profilesQuery = profilesQuery.eq("city", userCity);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;

      // Joindre les données
      const leaderboardData = progressData
        ?.map((progress) => {
          const profile = profilesData?.find((p) => p.id === progress.user_id);
          if (userCity && profile?.city !== userCity) return null;
          return {
            ...progress,
            profiles: profile ? {
              display_name: profile.display_name,
              city: profile.city,
              avatar_url: profile.avatar_url,
            } : null,
          };
        })
        .filter(Boolean) as LeaderboardEntry[];

      return leaderboardData || [];
    },
    enabled: !!currentChallenge?.id && !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Classement mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Medal className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun participant pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sois le premier à participer au challenge !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMedalColor = (position: number) => {
    if (position === 0) return "text-yellow-500";
    if (position === 1) return "text-gray-400";
    if (position === 2) return "text-orange-600";
    return "text-muted-foreground";
  };

  const userPosition = leaderboard.findIndex((entry) => entry.user_id === user?.id);

  // Déclencher confettis si top 3
  useEffect(() => {
    if (userPosition >= 0 && userPosition < 3) {
      window.dispatchEvent(new CustomEvent('top-position', {
        detail: { position: userPosition + 1 }
      }));
    }
  }, [userPosition]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Classement mensuel
          {userPosition >= 0 && (
            <Badge variant="secondary" className="ml-auto">
              #{userPosition + 1}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => {
            const isCurrentUser = entry.user_id === user?.id;
            const progressPercentage = Math.round(
              (entry.current_progress / entry.target_progress) * 100
            );

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-background/50 border border-border/50"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                  {idx < 3 ? (
                    <Medal className={`h-6 w-6 ${getMedalColor(idx)} fill-current`} />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={entry.profiles?.avatar_url || ""} />
                  <AvatarFallback>
                    {entry.profiles?.display_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-foreground truncate">
                      {entry.profiles?.display_name || "Anonyme"}
                      {isCurrentUser && (
                        <span className="text-xs text-primary ml-1">(Toi)</span>
                      )}
                    </p>
                    {entry.is_completed && (
                      <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {entry.profiles?.city && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {entry.profiles.city}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={entry.is_completed ? "default" : "secondary"}>
                    {entry.current_progress}/{entry.target_progress}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
