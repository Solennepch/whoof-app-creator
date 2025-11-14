import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function GamificationAnalytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['gamification-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('gamification_analytics' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!data) return { total: 0, byFeature: [], timeline: [] };

      // Group by feature
      const byFeature = data.reduce((acc: any, event: any) => {
        const feature = event.metadata?.feature || 'other';
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {});

      // Group by day
      const byDay = data.reduce((acc: any, event: any) => {
        const day = new Date(event.created_at).toLocaleDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data.length,
        byFeature: Object.entries(byFeature).map(([name, count]) => ({ name, count })),
        timeline: Object.entries(byDay).map(([date, count]) => ({ date, count })).slice(0, 7).reverse(),
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistiques de gamification
        </CardTitle>
        <CardDescription>
          Votre engagement avec les fonctionnalités de gamification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{analytics.total}</div>
            <div className="text-sm text-muted-foreground">Interactions totales</div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{analytics.byFeature.length}</div>
            <div className="text-sm text-muted-foreground">Fonctionnalités utilisées</div>
          </div>
        </div>

        {analytics.timeline.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-4">Activité des 7 derniers jours</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
