import { motion } from "framer-motion";
import { Trophy, TrendingUp, Gift } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function ChallengeWidget() {
  const navigate = useNavigate();
  const { currentChallenge, challengeProgress, isLoading } = useEvents();

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!currentChallenge) return null;

  const progress = challengeProgress?.currentProgress || 0;
  const target = currentChallenge.objectiveTarget;
  const percentage = Math.min((progress / target) * 100, 100);
  const isCompleted = challengeProgress?.isCompleted || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={() => navigate('/events')}
      className="cursor-pointer"
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20 hover:border-primary/40 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
              <span className="text-2xl">{currentChallenge.badge}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{currentChallenge.name}</h3>
              <p className="text-sm text-muted-foreground">{currentChallenge.objective}</p>
            </div>
          </div>
          {isCompleted ? (
            <Trophy className="h-5 w-5 text-primary fill-primary" />
          ) : (
            <TrendingUp className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold text-foreground">
              {progress} / {target}
            </span>
          </div>
          
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            {percentage > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 left-0 h-5 w-5 rounded-full bg-primary border-2 border-background"
                style={{ left: `${Math.min(percentage, 95)}%` }}
              />
            )}
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Gift className="h-4 w-4 text-accent" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Récompense : </span>
                {currentChallenge.reward}
              </p>
            </div>
          )}

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 pt-2 border-t border-primary/50 text-primary"
            >
              <Trophy className="h-4 w-4" />
              <p className="text-sm font-medium">Challenge complété ! 🎉</p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
