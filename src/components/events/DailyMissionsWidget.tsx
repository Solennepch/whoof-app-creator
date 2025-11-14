import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Target, Clock, Check, Star, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface DailyMission {
  id: string;
  mission_id: string;
  current_progress: number;
  target_value: number;
  is_completed: boolean;
  xp_claimed: boolean;
  mission: {
    title: string;
    description: string;
    icon: string;
    xp_reward: number;
    difficulty: string;
  };
}

const difficultyColors = {
  easy: "text-green-500 border-green-500/20 bg-green-500/5",
  medium: "text-amber-500 border-amber-500/20 bg-amber-500/5",
  hard: "text-red-500 border-red-500/20 bg-red-500/5",
};

export function DailyMissionsWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: missions, isLoading, refetch } = useQuery({
    queryKey: ["daily-missions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Assign missions if needed
      await supabase.rpc('assign_daily_missions' as any, {
        p_user_id: user.id,
        p_count: 3,
      });

      const { data, error } = await supabase
        .from('user_daily_missions' as any)
        .select(`
          *,
          mission:daily_missions(*)
        `)
        .eq('user_id', user.id)
        .eq('assigned_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data as unknown as DailyMission[];
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('user_daily_missions' as any)
        .update({ xp_claimed: true })
        .eq('id', missionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-missions"] });
      toast.success("Récompense réclamée ! 🎉");
    },
  });

  // Auto-refresh at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      refetch();
      toast.info("Nouvelles missions disponibles ! 🎯");
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [refetch]);

  const completedCount = missions?.filter((m) => m.is_completed).length || 0;
  const totalCount = missions?.length || 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  if (isLoading) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Missions du Jour
          </CardTitle>
          <Badge variant="secondary">
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {missions && missions.length > 0 ? (
          <>
            <div className="space-y-3">
              {missions.map((mission, index) => {
                const progress = Math.min(
                  (mission.current_progress / mission.target_value) * 100,
                  100
                );

                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-4 rounded-lg border-2",
                      mission.is_completed
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-muted"
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl flex-shrink-0">
                        {mission.mission.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{mission.mission.title}</h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              difficultyColors[
                                mission.mission.difficulty as keyof typeof difficultyColors
                              ]
                            )}
                          >
                            {mission.mission.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mission.mission.description}
                        </p>
                      </div>
                      {mission.is_completed && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-5 w-5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">
                          {mission.current_progress} / {mission.target_value}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {mission.is_completed && !mission.xp_claimed && (
                      <Button
                        onClick={() => claimRewardMutation.mutate(mission.id)}
                        disabled={claimRewardMutation.isPending}
                        className="w-full mt-3"
                        size="sm"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Réclamer +{mission.mission.xp_reward} XP
                      </Button>
                    )}

                    {mission.xp_claimed && (
                      <div className="mt-3 text-center text-sm text-muted-foreground">
                        Récompense réclamée ✓
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/50 text-center"
              >
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-semibold text-primary">
                  Toutes les missions complétées !
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nouvelles missions à minuit
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Renouvellement à minuit</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="h-auto py-1 px-2"
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Aucune mission pour aujourd'hui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
