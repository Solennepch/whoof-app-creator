import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface League {
  id: string;
  name: string;
  tier: number;
  min_rank: number;
  max_rank: number;
  color: string;
  icon: string;
}

interface UserLeague {
  user_id: string;
  current_rank: number;
  monthly_xp: number;
  league: League;
  last_league_id?: string;
  promotion_count: number;
  relegation_count: number;
  profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export function LeagueStandings() {
  const { user } = useAuth();

  const { data: currentSeason } = useQuery({
    queryKey: ["current-season"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: userLeague } = useQuery({
    queryKey: ["user-league", user?.id, currentSeason?.id],
    enabled: !!user && !!currentSeason,
    queryFn: async () => {
      if (!user || !currentSeason) return null;

      const { data, error } = await supabase
        .from('user_leagues' as any)
        .select(`
          *,
          league:leagues(*)
        `)
        .eq('user_id', user.id)
        .eq('season_id', currentSeason.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as UserLeague | null;
    },
  });

  const { data: topPlayers } = useQuery({
    queryKey: ["league-top-players", currentSeason?.id, userLeague?.league?.id],
    enabled: !!currentSeason && !!userLeague?.league,
    queryFn: async () => {
      if (!currentSeason || !userLeague?.league) return [];

      const { data, error } = await supabase
        .from('user_leagues' as any)
        .select(`
          *,
          league:leagues(*)
        `)
        .eq('season_id', currentSeason.id)
        .eq('league_id', userLeague.league.id)
        .order('current_rank', { ascending: true })
        .limit(10);

      if (error) throw error;

      const userIds = data.map((entry: any) => entry.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      return data.map((entry: any) => ({
        ...entry,
        profile: profileMap.get(entry.user_id),
      })) as UserLeague[];
    },
  });

  if (!userLeague) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Ligues Compétitives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Gagne de l'XP pour rejoindre une ligue
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const league = userLeague.league;
  const rankInLeague = userLeague.current_rank - league.min_rank + 1;
  const leagueSize = league.max_rank - league.min_rank + 1;
  const progressInLeague = (rankInLeague / leagueSize) * 100;

  const getTrendIcon = () => {
    if (!userLeague.last_league_id) return <Minus className="h-4 w-4" />;
    if (userLeague.promotion_count > userLeague.relegation_count)
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (userLeague.relegation_count > userLeague.promotion_count)
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Ta Ligue
          </CardTitle>
          {getTrendIcon()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current League */}
        <div
          className="p-6 rounded-xl border-2"
          style={{
            background: `linear-gradient(135deg, ${league.color}20, ${league.color}10)`,
            borderColor: `${league.color}50`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{league.icon}</div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: league.color }}>
                  {league.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Rang #{userLeague.current_rank} Global
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {userLeague.monthly_xp.toLocaleString()} XP
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Position dans la ligue</span>
              <span className="font-medium">
                #{rankInLeague} / {leagueSize}
              </span>
            </div>
            <Progress value={100 - progressInLeague} className="h-2" />
          </div>

          {userLeague.promotion_count > 0 && (
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {userLeague.promotion_count} promotions
              </span>
              {userLeague.relegation_count > 0 && (
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  {userLeague.relegation_count} relégations
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top Players */}
        {topPlayers && topPlayers.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-accent" />
              Top de la ligue
            </h4>
            <div className="space-y-2">
              {topPlayers.map((player, index) => {
                const isCurrentUser = player.user_id === user?.id;

                return (
                  <motion.div
                    key={player.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      isCurrentUser
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-muted"
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {player.profile?.display_name || "Utilisateur"}
                        {isCurrentUser && (
                          <span className="text-primary ml-2">(Vous)</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rang #{player.current_rank}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{player.monthly_xp.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Les ligues sont mises à jour automatiquement chaque début de mois
        </div>
      </CardContent>
    </Card>
  );
}
