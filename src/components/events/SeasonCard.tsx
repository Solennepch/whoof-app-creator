import { motion } from "framer-motion";
import { Calendar, Trophy, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";

interface Season {
  id: string;
  season_number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  theme: string;
  rewards: any[];
  is_active: boolean;
}

export function SeasonCard() {
  const { data: currentSeason, isLoading } = useQuery({
    queryKey: ["current-season"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Season | null;
    },
  });

  if (isLoading || !currentSeason) return null;

  const now = new Date();
  const endDate = new Date(currentSeason.end_date);
  const startDate = new Date(currentSeason.start_date);
  const totalDays = differenceInDays(endDate, startDate);
  const daysLeft = Math.max(0, differenceInDays(endDate, now));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 border-primary/40">
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="default" className="font-semibold">
                  Saison {currentSeason.season_number}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{currentSeason.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSeason.description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{daysLeft} jours</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression de la saison</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-1" />
              {format(startDate, "d MMM", { locale: fr })} - {format(endDate, "d MMM", { locale: fr })}
            </span>
            {currentSeason.theme && (
              <Badge variant="secondary" className="text-xs">
                Thème: {currentSeason.theme}
              </Badge>
            )}
          </div>

          {currentSeason.rewards && currentSeason.rewards.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Récompenses de fin de saison</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentSeason.rewards.map((reward: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {reward.icon} {reward.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
