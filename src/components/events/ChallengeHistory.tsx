import { motion } from "framer-motion";
import { Trophy, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MONTHLY_CHALLENGES } from "@/lib/events/monthlyChallenges";

interface CompletedChallenge {
  challenge_id: string;
  completed_at: string;
  current_progress: number;
  target_progress: number;
}

export function ChallengeHistory() {
  const { user } = useAuth();

  const { data: history, isLoading } = useQuery({
    queryKey: ["challenge-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as CompletedChallenge[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Historique des challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun challenge complété</p>
            <p className="text-sm text-muted-foreground mt-1">
              Commence à relever des challenges pour remplir ton historique !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Historique des challenges ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item, idx) => {
            const challenge = MONTHLY_CHALLENGES.find((c) => c.id === item.challenge_id);
            if (!challenge) return null;

            return (
              <motion.div
                key={item.challenge_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-background text-2xl flex-shrink-0">
                  {challenge.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{challenge.name}</h4>
                    <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {challenge.objective}
                  </p>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.current_progress} / {item.target_progress}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Complété le {format(new Date(item.completed_at), "d MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Award className="h-3 w-3 text-accent" />
                      <span className="text-muted-foreground truncate">{challenge.reward}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
