import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Clock, Trophy, Sparkles } from "lucide-react";
import { differenceInHours, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  xp_multiplier: number;
  challenges: any[];
  rewards: any[];
  theme: string;
  icon: string;
}

export function SpecialEventWidget() {
  const { user } = useAuth();

  const { data: activeEvent, isLoading } = useQuery({
    queryKey: ["active-special-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("special_events")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      return data as SpecialEvent | null;
    },
  });

  const { data: participation } = useQuery({
    queryKey: ["event-participation", activeEvent?.id],
    enabled: !!activeEvent && !!user,
    queryFn: async () => {
      if (!activeEvent || !user) return null;
      
      const { data, error } = await supabase
        .from("special_event_participation")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_id", activeEvent.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const handleJoinEvent = async () => {
    if (!activeEvent || !user) return;

    try {
      const { error } = await supabase
        .from("special_event_participation")
        .insert({
          user_id: user.id,
          event_id: activeEvent.id,
        });

      if (error) throw error;

      toast.success("Vous avez rejoint l'événement !", {
        description: `Gagnez ${activeEvent.xp_multiplier}x plus d'XP pendant l'événement 🎉`,
      });
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Erreur lors de l'inscription");
    }
  };

  if (isLoading || !activeEvent) return null;

  const now = new Date();
  const endDate = new Date(activeEvent.end_date);
  const hoursLeft = Math.max(0, differenceInHours(endDate, now));
  const completedChallenges = Array.isArray(participation?.challenges_completed) 
    ? participation.challenges_completed.length 
    : 0;
  const totalChallenges = Array.isArray(activeEvent.challenges) 
    ? activeEvent.challenges.length 
    : 0;
  const progress = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-2 border-accent bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10">
        <CardHeader className="relative pb-3">
          <div className="absolute -right-4 -top-4 text-6xl opacity-20">
            {activeEvent.icon || "⚡"}
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-accent" />
                <Badge variant="default" className="font-semibold bg-accent text-accent-foreground">
                  Événement Spécial
                </Badge>
                <Badge variant="outline" className="font-bold">
                  <Zap className="h-3 w-3 mr-1" />
                  x{activeEvent.xp_multiplier} XP
                </Badge>
              </div>
              <CardTitle className="text-2xl">{activeEvent.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {activeEvent.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!participation ? (
            <Button 
              onClick={handleJoinEvent} 
              className="w-full"
              size="lg"
            >
              Rejoindre l'événement
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Défis complétés</span>
                  <span className="font-medium">
                    {completedChallenges}/{totalChallenges}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">XP gagnés</span>
                </div>
                <span className="text-lg font-bold text-accent">
                  {participation.total_xp_earned} XP
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Se termine dans {hoursLeft}h</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(endDate, "d MMM à HH:mm", { locale: fr })}
            </span>
          </div>

          {activeEvent.rewards && activeEvent.rewards.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">🎁 Récompenses :</div>
              <div className="flex flex-wrap gap-2">
                {activeEvent.rewards.map((reward: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
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
