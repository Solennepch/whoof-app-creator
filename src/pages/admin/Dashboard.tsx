import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Briefcase, ShieldCheck, Flag, AlertTriangle, Heart, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading, refetch } = useAdminStats();

  // Fetch trend data for charts
  const { data: userTrends } = useQuery({
    queryKey: ['user-trends'],
    queryFn: async () => {
      const days = 30;
      const trends = [];
      
      for (let i = days; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = date.toISOString().split('T')[0];
        
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString());
        
        trends.push({
          date: format(date, 'dd MMM', { locale: fr }),
          users: count || 0
        });
      }
      
      return trends;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch reports by type
  const { data: reportsByType } = useQuery({
    queryKey: ['reports-by-type'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reports')
        .select('kind');
      
      const typeCounts = (data || []).reduce((acc, report) => {
        acc[report.kind] = (acc[report.kind] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(typeCounts).map(([type, count]) => ({
        name: type,
        value: count
      }));
    },
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats?.totalUsers || 0,
      newToday: stats?.newUsersToday || 0,
      description: "Comptes particuliers actifs",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/users",
    },
    {
      title: "Professionnels",
      value: stats?.totalPros || 0,
      description: "Comptes pro actifs",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/professionals",
    },
    {
      title: "Matches",
      value: stats?.totalMatches || 0,
      description: "Connexions réussies",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/users",
    },
  ];

  const alertCards = [
    {
      title: "Vérifications en attente",
      value: stats?.pendingVerifications || 0,
      description: "Demandes à traiter",
      icon: AlertTriangle,
      color: "text-orange-600",
      link: "/admin/moderation?tab=verifications",
      urgent: (stats?.pendingVerifications || 0) > 0,
    },
    {
      title: "Signalements ouverts",
      value: stats?.openReports || 0,
      description: "À modérer",
      icon: Flag,
      color: "text-red-600",
      link: "/admin/moderation?tab=signalements",
      urgent: (stats?.openReports || 0) > 0,
    },
    {
      title: "Alertes actives",
      value: stats?.activeAlerts || 0,
      description: "Système",
      icon: AlertTriangle,
      color: "text-yellow-600",
      link: "/admin/moderation?tab=alertes",
      urgent: (stats?.activeAlerts || 0) > 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble • Mise à jour automatique toutes les 30s
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Stats en temps réel */}
      {stats && stats.newUsersToday > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-lg px-3 py-1">
                +{stats.newUsersToday}
              </Badge>
              <div>
                <p className="font-semibold">Nouveaux utilisateurs aujourd'hui</p>
                <p className="text-sm text-muted-foreground">
                  {stats.newUsersThisWeek} cette semaine
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {((stats?.pendingVerifications || 0) > 0 || (stats?.openReports || 0) > 0 || (stats?.activeAlerts || 0) > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          {alertCards.map((card) => {
            const Icon = card.icon;
            if (card.value === 0) return null;
            return (
              <Link key={card.title} to={card.link}>
                <Card className={`border-2 ${card.urgent ? 'border-destructive bg-destructive/5' : ''} hover:shadow-lg transition-shadow`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  {card.newToday !== undefined && card.newToday > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      +{card.newToday} aujourd'hui
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inscriptions - 30 derniers jours
            </CardTitle>
            <CardDescription>Évolution quotidienne des nouvelles inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {userTrends ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Nouveaux utilisateurs"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Reports by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Signalements par Type
            </CardTitle>
            <CardDescription>Distribution des signalements reçus</CardDescription>
          </CardHeader>
          <CardContent>
            {reportsByType && reportsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {reportsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucun signalement
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Peaks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activité de Modération
            </CardTitle>
            <CardDescription>Vue d'ensemble des actions de modération récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Vérifications</div>
                <div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div>
                <div className="text-xs text-muted-foreground">En attente de validation</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Signalements</div>
                <div className="text-2xl font-bold">{stats?.openReports || 0}</div>
                <div className="text-xs text-muted-foreground">À traiter</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Alertes</div>
                <div className="text-2xl font-bold">{stats?.activeAlerts || 0}</div>
                <div className="text-xs text-muted-foreground">Actives</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
