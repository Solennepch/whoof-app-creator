import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, FileWarning, ShieldAlert, ArrowRight } from "lucide-react";
import { useAdminRole, usePendingVerifications, useOpenReports, useActiveAlerts } from "@/hooks/useAdmin";
import { VerificationsQueue } from "@/components/admin/VerificationsQueue";
import { ReportsQueue } from "@/components/admin/ReportsQueue";
import { AlertsQueue } from "@/components/admin/AlertsQueue";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Moderation() {
  const { data: roleData, isLoading: roleLoading } = useAdminRole();
  const { data: verifications, isLoading: verificationsLoading } = usePendingVerifications();
  const { data: reports, isLoading: reportsLoading } = useOpenReports();
  const { data: alerts, isLoading: alertsLoading } = useActiveAlerts();

  // Redirect if not admin/moderator
  if (!roleLoading && !roleData?.hasAccess) {
    return <Navigate to="/" replace />;
  }

  if (roleLoading) {
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
            Gérez les vérifications, signalements et alertes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/moderation-v2">
            <Button variant="outline" className="gap-2">
              Tester la v2
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Shield className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vérifications
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verificationsLoading ? "..." : verifications?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Signalements
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportsLoading ? "..." : reports?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ouverts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertes
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsLoading ? "..." : alerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Actives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queues */}
      <Tabs defaultValue="verifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verifications">
            Vérifications ({verifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Signalements ({reports?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes ({alerts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vérifications en attente</CardTitle>
              <CardDescription>
                Approuvez ou rejetez les demandes de vérification d'identité et de puce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationsQueue
                verifications={verifications || []}
                isLoading={verificationsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signalements ouverts</CardTitle>
              <CardDescription>
                Traitez les signalements de contenu inapproprié
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsQueue
                reports={reports || []}
                isLoading={reportsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes actives</CardTitle>
              <CardDescription>
                Validez les dangers et chiens perdus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsQueue
                alerts={alerts || []}
                isLoading={alertsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
