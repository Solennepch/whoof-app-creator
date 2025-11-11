import { useState } from "react";
import { useAdminRole, usePendingVerifications, useOpenReports, useActiveAlerts } from "@/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationsQueue } from "@/components/admin/VerificationsQueue";
import { ReportsQueue } from "@/components/admin/ReportsQueue";
import { AlertsQueue } from "@/components/admin/AlertsQueue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ShieldCheck, AlertTriangle, Flag, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Moderation() {
  const { data: adminRole, isLoading: isLoadingRole } = useAdminRole();
  const { data: verifications, isLoading: isLoadingVerifications } = usePendingVerifications();
  const { data: reports, isLoading: isLoadingReports } = useOpenReports();
  const { data: alerts, isLoading: isLoadingAlerts } = useActiveAlerts();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Check if user has moderation access
  if (!isLoadingRole && !adminRole?.hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Seuls les administrateurs et modérateurs peuvent accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter function
  const applyFilters = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = dateFilter === 'all' || (() => {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            return itemDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return itemDate >= monthAgo;
          default:
            return true;
        }
      })();

      const matchesType = typeFilter === 'all' || 
        (item.type && item.type === typeFilter) ||
        (item.verification_type && item.verification_type === typeFilter);

      const matchesStatus = statusFilter === 'all' || 
        (item.status && item.status === statusFilter);

      return matchesSearch && matchesDate && matchesType && matchesStatus;
    });
  };

  const filteredVerifications = verifications ? applyFilters(verifications) : [];
  const filteredReports = reports ? applyFilters(reports) : [];
  const filteredAlerts = alerts ? applyFilters(alerts) : [];

  if (isLoadingRole) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modération</h1>
          <p className="text-muted-foreground">
            Gérer les vérifications, signalements et alertes de la plateforme
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="identity">Identité</SelectItem>
                  <SelectItem value="professional">Professionnel</SelectItem>
                  <SelectItem value="harassment">Harcèlement</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchQuery || dateFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setDateFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredVerifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {verifications?.length || 0} au total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements</CardTitle>
            <Flag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {reports?.length || 0} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts?.length || 0} au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verifications">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Vérifications ({filteredVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="signalements">
            <Flag className="h-4 w-4 mr-2" />
            Signalements ({filteredReports.length})
          </TabsTrigger>
          <TabsTrigger value="alertes">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertes ({filteredAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verifications">
          <Card>
            <CardHeader>
              <CardTitle>Vérifications en attente</CardTitle>
              <CardDescription>
                Valider ou rejeter les demandes de vérification d'identité et professionnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationsQueue 
                verifications={filteredVerifications} 
                isLoading={isLoadingVerifications}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signalements">
          <Card>
            <CardHeader>
              <CardTitle>Signalements ouverts</CardTitle>
              <CardDescription>
                Traiter les signalements de contenu inapproprié, harcèlement ou spam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsQueue 
                reports={filteredReports} 
                isLoading={isLoadingReports}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertes">
          <Card>
            <CardHeader>
              <CardTitle>Alertes actives</CardTitle>
              <CardDescription>
                Gérer les alertes système et les notifications de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsQueue 
                alerts={filteredAlerts} 
                isLoading={isLoadingAlerts}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
