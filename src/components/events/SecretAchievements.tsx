import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, HelpCircle, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { celebrateCompletion } from "@/lib/confetti";

interface SecretAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  hint_1: string;
  hint_2: string;
  hint_3: string;
  icon: string;
  rarity: string;
  reward_xp: number;
  userProgress?: {
  hints_unlocked: number;
  is_unlocked: boolean;
  progress: any;
  unlocked_at?: string;
  };
}

const rarityColors = {
  common: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
  rare: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  epic: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  legendary: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
};

export function SecretAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["secret-achievements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('secret_achievements' as any)
        .select('*')
        .eq('is_active', true);

      if (achievementsError) throw achievementsError;

      const { data: userProgress } = await supabase
        .from('user_secret_achievements' as any)
        .select('*')
        .eq('user_id', user.id);

      const progressMap = new Map(
        userProgress?.map((p: any) => [p.achievement_id, p]) || []
      );

      return achievementsData.map((achievement: any) => ({
        ...achievement,
        userProgress: progressMap.get(achievement.id),
      })) as SecretAchievement[];
    },
  });

  const unlockHintMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user) return;

      const { data: existing } = await supabase
        .from('user_secret_achievements' as any)
        .select('hints_unlocked')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      const newHintsUnlocked = ((existing as any)?.hints_unlocked || 0) + 1;

      const { error } = await supabase
        .from('user_secret_achievements' as any)
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          hints_unlocked: newHintsUnlocked,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secret-achievements"] });
      toast.success("Nouvel indice débloqué ! 🔍");
    },
  });

  const unlockedCount = achievements?.filter((a) => a.userProgress?.is_unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  if (isLoading || !achievements?.length) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                Succès Secrets
              </CardTitle>
              <Badge variant="secondary">
                {unlockedCount}/{totalCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  {achievements.slice(0, 6).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2",
                        achievement.userProgress?.is_unlocked
                          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50"
                          : "bg-muted border-muted opacity-50"
                      )}
                    >
                      {achievement.userProgress?.is_unlocked ? achievement.icon : "🔒"}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Découvre et débloque des succès mystérieux
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Succès Secrets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <AnimatePresence mode="popLayout">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.userProgress?.is_unlocked;
              const hintsUnlocked = achievement.userProgress?.hints_unlocked || 0;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-6 rounded-xl border-2 bg-gradient-to-br",
                    isUnlocked
                      ? rarityColors[achievement.rarity as keyof typeof rarityColors]
                      : "from-muted/50 to-muted/30 border-muted"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2",
                          isUnlocked
                            ? "bg-background/50 border-primary/50"
                            : "bg-muted border-muted"
                        )}
                      >
                        {isUnlocked ? achievement.icon : <Lock className="h-8 w-8" />}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        {isUnlocked ? (
                          <>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              {achievement.name}
                              <Badge variant="outline" className="text-xs">
                                {achievement.rarity}
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-muted-foreground">
                              ???
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Succès mystérieux à découvrir...
                            </p>
                          </>
                        )}
                      </div>

                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <HelpCircle className="h-4 w-4" />
                            Indices disponibles :
                          </div>

                          <div className="space-y-2">
                            {[achievement.hint_1, achievement.hint_2, achievement.hint_3].map(
                              (hint, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    index < hintsUnlocked
                                      ? "bg-primary/5 border-primary/20"
                                      : "bg-muted/30 border-muted"
                                  )}
                                >
                                  {index < hintsUnlocked ? (
                                    <div className="flex items-start gap-2">
                                      <Eye className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                      <p className="text-sm">{hint}</p>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => unlockHintMutation.mutate(achievement.id)}
                                      disabled={unlockHintMutation.isPending}
                                    >
                                      <Lock className="h-4 w-4 mr-2" />
                                      Débloquer l'indice {index + 1}
                                    </Button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {isUnlocked && (
                        <div className="flex items-center gap-4 pt-2 border-t">
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            +{achievement.reward_xp} XP
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Débloqué le{" "}
                            {new Date(
                              achievement.userProgress?.unlocked_at || ""
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
