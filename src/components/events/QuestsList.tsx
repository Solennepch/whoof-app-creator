import { motion } from "framer-motion";
import { Scroll, Lock, CheckCircle, Play, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface Quest {
  id: string;
  title: string;
  description: string;
  story_context: string;
  quest_order: number;
  required_challenges: any[];
  rewards: any;
  icon: string;
  is_active: boolean;
}

interface QuestProgress {
  quest_id: string;
  current_step: number;
  total_steps: number;
  is_completed: boolean;
  rewards_claimed: boolean;
}

export function QuestsList() {
  const { user } = useAuth();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ["active-quests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .eq("is_active", true)
        .order("quest_order");

      if (error) throw error;
      return data as Quest[];
    },
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["quest-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_quest_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as QuestProgress[];
    },
    enabled: !!user?.id,
  });

  const isLoading = questsLoading || progressLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5 text-primary" />
            Quêtes narratives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Scroll className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune quête disponible</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les quêtes arriveront bientôt !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getQuestProgress = (questId: string) => {
    return progress?.find((p) => p.quest_id === questId);
  };

  const isQuestUnlocked = (quest: Quest, index: number) => {
    if (index === 0) return true;
    const previousQuest = quests[index - 1];
    const previousProgress = getQuestProgress(previousQuest.id);
    return previousProgress?.is_completed || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-primary" />
          Quêtes narratives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quests.map((quest, idx) => {
            const questProgress = getQuestProgress(quest.id);
            const isUnlocked = isQuestUnlocked(quest, idx);
            const isCompleted = questProgress?.is_completed || false;
            const progressPercentage = questProgress
              ? (questProgress.current_step / questProgress.total_steps) * 100
              : 0;

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-primary/5 border-primary/30"
                          : isUnlocked
                          ? "bg-background/50 border-border/50 hover:border-primary/40"
                          : "bg-muted/30 border-border/30 opacity-60"
                      }`}
                      onClick={() => isUnlocked && setSelectedQuest(quest)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0 ${
                            isUnlocked
                              ? "bg-gradient-to-br from-primary/10 to-accent/10"
                              : "bg-muted"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-primary" />
                          ) : !isUnlocked ? (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          ) : (
                            quest.icon || "📜"
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                {quest.title}
                                {!isUnlocked && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {quest.description}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </div>

                          {isUnlocked && questProgress && !isCompleted && (
                            <div className="mt-2 space-y-1">
                              <Progress value={progressPercentage} className="h-2" />
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Étape {questProgress.current_step}/{questProgress.total_steps}
                                </span>
                                <span className="text-primary font-medium">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </div>
                          )}

                          {isCompleted && (
                            <Badge className="mt-2 bg-primary">
                              <Trophy className="h-3 w-3 mr-1" />
                              Quête terminée
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  {isUnlocked && selectedQuest && (
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-2xl">{selectedQuest.icon || "📜"}</span>
                          {selectedQuest.title}
                        </DialogTitle>
                        <DialogDescription>{selectedQuest.description}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {selectedQuest.story_context && (
                          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <p className="text-sm text-foreground italic">
                              {selectedQuest.story_context}
                            </p>
                          </div>
                        )}

                        {selectedQuest.required_challenges && selectedQuest.required_challenges.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Défis requis:</h4>
                            <div className="space-y-2">
                              {selectedQuest.required_challenges.map((challenge: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold">
                                    {idx + 1}
                                  </div>
                                  <span className="text-sm">{challenge.name || challenge}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedQuest.rewards && (
                          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Trophy className="h-4 w-4 text-accent" />
                              <span className="text-sm font-semibold">Récompenses</span>
                            </div>
                            <div className="space-y-1">
                              {selectedQuest.rewards.xp && (
                                <p className="text-sm">+ {selectedQuest.rewards.xp} XP</p>
                              )}
                              {selectedQuest.rewards.badge && (
                                <p className="text-sm">Badge: {selectedQuest.rewards.badge}</p>
                              )}
                              {selectedQuest.rewards.items &&
                                selectedQuest.rewards.items.map((item: string, idx: number) => (
                                  <p key={idx} className="text-sm">
                                    • {item}
                                  </p>
                                ))}
                            </div>
                          </div>
                        )}

                        {!questProgress && (
                          <Button className="w-full" size="lg">
                            <Play className="h-4 w-4 mr-2" />
                            Commencer la quête
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
