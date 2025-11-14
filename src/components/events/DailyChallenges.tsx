import { motion } from "framer-motion";
import { Sparkles, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  target: number;
  progress: number;
  icon: string;
  completed: boolean;
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily_walk",
    title: "Balade matinale",
    description: "Fais une balade de 15 minutes",
    xpReward: 20,
    target: 1,
    progress: 0,
    icon: "🚶",
    completed: false,
  },
  {
    id: "daily_match",
    title: "Rencontre du jour",
    description: "Matche avec 2 nouveaux chiens",
    xpReward: 15,
    target: 2,
    progress: 0,
    icon: "💘",
    completed: false,
  },
  {
    id: "daily_photo",
    title: "Moment photo",
    description: "Partage une photo de ton chien",
    xpReward: 10,
    target: 1,
    progress: 0,
    icon: "📸",
    completed: false,
  },
];

export function DailyChallenges() {
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES);
  const today = format(new Date(), "EEEE d MMMM", { locale: fr });

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.completed ? c.xpReward : 0), 0);

  const handleComplete = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, progress: c.target, completed: true }
          : c
      )
    );
    toast.success("Mini-challenge complété ! 🎉", {
      description: `+${challenges.find((c) => c.id === challengeId)?.xpReward} XP`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Mini-challenges du jour
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {today}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{completedCount}/{challenges.length} complétés</span>
          <span>•</span>
          <span className="text-primary font-medium">{totalXP} XP gagnés</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {challenges.map((challenge, idx) => {
            const percentage = (challenge.progress / challenge.target) * 100;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  challenge.completed
                    ? "bg-primary/5 border-primary/30"
                    : "bg-background/50 border-border/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-2xl flex-shrink-0">
                    {challenge.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                      {challenge.completed ? (
                        <Badge className="flex-shrink-0 bg-primary">
                          <Check className="h-3 w-3 mr-1" />
                          +{challenge.xpReward} XP
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex-shrink-0">
                          {challenge.xpReward} XP
                        </Badge>
                      )}
                    </div>

                    {!challenge.completed && (
                      <>
                        <div className="mt-2 mb-2">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {challenge.progress}/{challenge.target}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleComplete(challenge.id)}
                            className="h-7 text-xs"
                          >
                            Marquer complété
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {completedCount === challenges.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 text-center"
          >
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">
              Tous les challenges complétés ! 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Reviens demain pour de nouveaux défis
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
