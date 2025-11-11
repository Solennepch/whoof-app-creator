import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Heart, Star, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch } = useAdminStats();

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
      icon: AlertCircle,
      color: "text-orange-600",
      link: "/admin/moderation?tab=verifications",
      urgent: (stats?.pendingVerifications || 0) > 0,
    },
    {
      title: "Signalements ouverts",
      value: stats?.openReports || 0,
      description: "À modérer",
      icon: AlertCircle,
      color: "text-red-600",
      link: "/admin/moderation?tab=signalements",
      urgent: (stats?.openReports || 0) > 0,
    },
    {
      title: "Alertes actives",
      value: stats?.activeAlerts || 0,
      description: "Système",
      icon: AlertCircle,
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
            <Link to="/admin/professionals">
              <Button variant="outline" className="w-full">
                <Briefcase className="h-4 w-4 mr-2" />
                Gérer pros
              </Button>
            </Link>
            <Link to="/admin/astrodog-cms">
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
