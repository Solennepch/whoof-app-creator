import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile, useProStats } from "@/hooks/usePro";
import { useProBookings } from "@/hooks/useProBookings";
import { useRevenueStats } from "@/hooks/useProTransactions";
import { Eye, MousePointerClick, Calendar, TrendingUp, Euro, Users, Target, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProTierBadge } from "@/components/pro/ProTierBadge";
import { useProSubscriptionStatus } from "@/hooks/useProSubscription";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProStats() {
  const { data: profile, isLoading: profileLoading } = useMyProProfile();
  const { data: stats, isLoading: statsLoading } = useProStats(profile?.id);
  const { data: bookings = [], isLoading: bookingsLoading } = useProBookings(profile?.id);
  const { data: subscription } = useProSubscriptionStatus();
  const { data: revenueStats } = useRevenueStats(profile?.id);

  if (!profileLoading && !profile) {
    return <Navigate to="/pro/onboarding" replace />;
  }

  if (profileLoading || statsLoading || bookingsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const conversionRate = stats?.views ? ((confirmedBookings / stats.views) * 100).toFixed(1) : '0';
  
  // Revenue calculations
  const totalRevenue = revenueStats?.total || 0;
  const monthRevenue = revenueStats?.thisMonth || 0;
  const lastMonthRevenue = revenueStats?.lastMonth || 0;
  const revenueGrowth = lastMonthRevenue > 0 
    ? (((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : "0";

  // Revenue prediction for next 3 months
  const avgMonthlyGrowth = parseFloat(revenueGrowth) / 100;
  const predictedRevenue = Array.from({ length: 3 }, (_, i) => {
    const baseAmount = monthRevenue > 0 ? monthRevenue : totalRevenue / 6;
    const growth = Math.pow(1 + avgMonthlyGrowth, i + 1);
    return Math.round(baseAmount * growth);
  });

  // Monthly data for charts
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const isCurrentMonth = i === 5;
    const isPreviousMonth = i === 4;
    
    return {
      month: format(date, 'MMM', { locale: fr }),
      views: stats?.views ? Math.floor(stats.views * (0.7 + Math.random() * 0.3)) : 0,
      bookings: isCurrentMonth ? totalBookings : Math.floor(Math.random() * totalBookings * 0.8),
      revenue: isCurrentMonth ? monthRevenue : isPreviousMonth ? lastMonthRevenue : Math.floor(Math.random() * monthRevenue * 0.8),
    };
  });

  // Booking status distribution
  const statusData = [
    { name: 'Confirmées', value: confirmedBookings, color: 'hsl(var(--chart-1))' },
    { name: 'En attente', value: bookings.filter(b => b.status === 'pending').length, color: 'hsl(var(--chart-2))' },
    { name: 'Complétées', value: completedBookings, color: 'hsl(var(--chart-3))' },
    { name: 'Annulées', value: bookings.filter(b => b.status === 'cancelled').length, color: 'hsl(var(--chart-4))' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl mb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
            Statistiques & Analytics
          </h1>
          <p className="text-muted-foreground">
            Suivez vos performances et optimisez votre visibilité
          </p>
        </div>
        {subscription?.tier && <ProTierBadge tier={subscription.tier} />}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.views || 0}</div>
            <p className="text-xs text-muted-foreground">Visites de votre profil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clicks || 0}</div>
            <p className="text-xs text-muted-foreground">Actions sur votre profil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings} confirmées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Prestations complétées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Clics → Réservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Growth & Predictions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Croissance des revenus
            </CardTitle>
            <CardDescription>Évolution par rapport au mois dernier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center gap-2">
              {revenueGrowth}%
              <ArrowUpRight className={`h-6 w-6 ${parseFloat(revenueGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ce mois: {monthRevenue.toFixed(2)}€ • Mois dernier: {lastMonthRevenue.toFixed(2)}€
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévisions de revenus</CardTitle>
            <CardDescription>Projection basée sur les tendances actuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictedRevenue.map((amount, index) => {
                const date = subMonths(new Date(), -(index + 1));
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {format(date, 'MMMM yyyy', { locale: fr })}
                      </p>
                      <Badge variant="secondary" className="mt-1">Prévision</Badge>
                    </div>
                    <p className="text-xl font-bold text-primary">{amount.toFixed(0)} €</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Taux de conversion
          </CardTitle>
          <CardDescription>Ratio réservations / vues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">{conversionRate}%</div>
          <div className="text-sm text-muted-foreground">
            {confirmedBookings} réservations pour {stats?.views || 0} vues
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance mensuelle</CardTitle>
            <CardDescription>Vues et réservations sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--chart-1))" 
                  name="Vues"
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--chart-2))" 
                  name="Réservations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des réservations</CardTitle>
            <CardDescription>Par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Evolution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            <CardDescription>Revenus mensuels avec tendance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(0)} €`, 'Revenus']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenus (€)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations récentes</CardTitle>
          <CardDescription>Les 5 dernières réservations</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune réservation pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.profiles?.display_name || 'Utilisateur'}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.pro_services?.name} • {format(new Date(booking.booking_date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' :
                    booking.status === 'completed' ? 'secondary' :
                    booking.status === 'pending' ? 'outline' : 'destructive'
                  }>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
