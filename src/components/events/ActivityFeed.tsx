import { motion } from "framer-motion";
import { Activity, Trophy, Target, Flame, Heart, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "challenge_completed":
      return <Trophy className="h-4 w-4 text-primary" />;
    case "milestone_reached":
      return <Target className="h-4 w-4 text-accent" />;
    case "streak_achieved":
      return <Flame className="h-4 w-4 text-orange-500" />;
    case "badge_earned":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "top_position":
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case "quest_completed":
      return <Trophy className="h-4 w-4 text-purple-500" />;
    default:
      return <Heart className="h-4 w-4 text-pink-500" />;
  }
};

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      // Récupérer les activités
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20);

      if (activitiesError) throw activitiesError;

      // Récupérer les profils des utilisateurs
      const userIds = activitiesData?.map((a) => a.user_id) || [];
      const uniqueUserIds = [...new Set(userIds)];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", uniqueUserIds);

      if (profilesError) throw profilesError;

      // Joindre les données
      const activitiesWithProfiles = activitiesData?.map((activity) => ({
        ...activity,
        profiles: profilesData?.find((p) => p.id === activity.user_id) || null,
      }));

      return activitiesWithProfiles as ActivityItem[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activité de la communauté
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune activité récente</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les achievements de la communauté apparaîtront ici
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
          <Activity className="h-5 w-5 text-primary" />
          Activité de la communauté
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Découvre les derniers achievements de tes amis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-background/50 to-primary/5 border border-border/50 hover:border-primary/30 transition-all"
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={activity.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {activity.profiles?.display_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border flex-shrink-0">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {activity.profiles?.display_name || "Un utilisateur"}
                      </span>{" "}
                      <span className="text-muted-foreground">{activity.title}</span>
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>

                  {activity.metadata?.badge && (
                    <span className="text-lg">{activity.metadata.badge}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
