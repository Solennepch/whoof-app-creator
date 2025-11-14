import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface DailyProgress {
  date: string;
  progress: number;
}

export function ChallengeStats() {
  const { user } = useAuth();

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ["challenge-weekly-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      // Simuler des données pour l'exemple - à remplacer par de vraies requêtes
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), 6 - i);
        days.push({
          date: format(date, "EEE", { locale: fr }),
          progress: Math.floor(Math.random() * 10),
          xp: Math.floor(Math.random() * 50),
        });
      }

      return days;
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["challenge-overall-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [progressData, xpData] = await Promise.all([
        supabase
          .from("challenge_progress")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("xp_events")
          .select("points")
          .eq("user_id", user.id)
          .gte("created_at", format(subDays(new Date(), 30), "yyyy-MM-dd")),
      ]);

      const totalCompleted = progressData.data?.filter((p) => p.is_completed).length || 0;
      const currentStreak = 3; // À calculer basé sur les données réelles
      const weeklyXP = xpData.data?.reduce((sum, e) => sum + e.points, 0) || 0;
      const avgProgress = progressData.data?.length 
        ? Math.round(progressData.data.reduce((sum, p) => sum + (p.current_progress / p.target_progress * 100), 0) / progressData.data.length)
        : 0;

      return {
        totalCompleted,
        currentStreak,
        weeklyXP,
        avgProgress,
      };
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
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Statistiques de progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Complétés</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.totalCompleted || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-secondary/10 border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Série</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0} j</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">XP/sem.</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.weeklyXP || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Moy.</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.avgProgress || 0}%</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Progression cette semaine</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">XP gagnés cette semaine</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="xp" 
                  fill="hsl(var(--accent))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
