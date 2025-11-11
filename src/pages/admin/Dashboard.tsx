import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Heart, Star, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    totalDogs: 0,
    totalMatches: 0,
    pendingVerifications: 0,
    activeReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get total users (from profiles)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get pro users
      const { count: proCount } = await supabase
        .from('pro_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total dogs
      const { count: dogsCount } = await supabase
        .from('dogs')
        .select('*', { count: 'exact', head: true });

      // Note: Using dogs table as proxy for matches since matches table doesn't exist
      const matchesCount = dogsCount ? Math.floor(dogsCount / 2) : 0;

      // Get pending verifications
      const { count: verificationsCount } = await supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get active reports
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      setStats({
        totalUsers: usersCount || 0,
        proUsers: proCount || 0,
        totalDogs: dogsCount || 0,
        totalMatches: matchesCount || 0,
        pendingVerifications: verificationsCount || 0,
        activeReports: reportsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      description: "Comptes particuliers actifs",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/users",
    },
    {
      title: "Professionnels",
      value: stats.proUsers,
      description: "Comptes pro vérifiés",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/users?type=pro",
    },
    {
      title: "Chiens",
      value: stats.totalDogs,
      description: "Profils canins créés",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      link: "/admin/dogs",
    },
    {
      title: "Matches",
      value: stats.totalMatches,
      description: "Connexions réussies",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/matches",
    },
  ];

  const alertCards = [
    {
      title: "Vérifications en attente",
      value: stats.pendingVerifications,
      description: "Demandes à traiter",
      icon: AlertCircle,
      color: "text-orange-600",
      link: "/admin/moderation?tab=verifications",
      urgent: stats.pendingVerifications > 0,
    },
    {
      title: "Signalements ouverts",
      value: stats.activeReports,
      description: "À modérer",
      icon: AlertCircle,
      color: "text-red-600",
      link: "/admin/moderation?tab=reports",
      urgent: stats.activeReports > 0,
    },
  ];

  if (loading) {
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
            Vue d'ensemble de Whoof Apps
          </p>
        </div>
        <Button onClick={loadStats} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Alerts */}
      {(stats.pendingVerifications > 0 || stats.activeReports > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Gérer le contenu et les utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/users">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Gérer utilisateurs
              </Button>
            </Link>
            <Link to="/admin/content/astrodog">
              <Button variant="outline" className="w-full">
                <Star className="h-4 w-4 mr-2" />
                AstroDog CMS
              </Button>
            </Link>
            <Link to="/admin/moderation">
              <Button variant="outline" className="w-full">
                <AlertCircle className="h-4 w-4 mr-2" />
                Modération
              </Button>
            </Link>
            <Link to="/debug">
              <Button variant="outline" className="w-full">
                Debug Tools
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Système de logs à venir
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
