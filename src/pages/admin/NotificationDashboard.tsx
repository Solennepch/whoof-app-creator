import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageSquare, CheckCircle, XCircle, Eye, MousePointer } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  emailCount: number;
  smsCount: number;
}

interface NotificationLog {
  id: string;
  template_name: string;
  channel: string;
  recipient: string;
  status: string;
  error_message?: string;
  created_at: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
}

const COLORS = ['#8B2BB8', '#C71585', '#FF6B9D', '#FFB6C1'];

export default function NotificationDashboard() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all logs
      const { data: logs, error: logsError } = await supabase
        .from("notification_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Calculate statistics
      const total = logs?.length || 0;
      const sent = logs?.filter(l => l.status === 'sent' || l.status === 'delivered').length || 0;
      const delivered = logs?.filter(l => l.status === 'delivered').length || 0;
      const failed = logs?.filter(l => l.status === 'failed').length || 0;
      const opened = logs?.filter(l => l.opened_at).length || 0;
      const clicked = logs?.filter(l => l.clicked_at).length || 0;
      const emailCount = logs?.filter(l => l.channel === 'email').length || 0;
      const smsCount = logs?.filter(l => l.channel === 'sms').length || 0;

      setStats({
        total,
        sent,
        delivered,
        failed,
        opened,
        clicked,
        emailCount,
        smsCount,
      });

      setRecentLogs(logs?.slice(0, 10) || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const deliveryRate = stats ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0;
  const openRate = stats ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0;
  const clickRate = stats ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0;

  const channelData = [
    { name: 'Email', value: stats?.emailCount || 0 },
    { name: 'SMS', value: stats?.smsCount || 0 },
  ];

  const statusData = [
    { name: 'Envoyés', value: stats?.sent || 0 },
    { name: 'Livrés', value: stats?.delivered || 0 },
    { name: 'Échecs', value: stats?.failed || 0 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard des notifications</h1>
        <p className="text-muted-foreground">Statistiques d'envoi et de performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total envoyé</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total || 0} notifications créées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de livraison</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.delivered || 0} livrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.opened || 0} ouvertures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.clicked || 0} clics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par canal</CardTitle>
            <CardDescription>Email vs SMS</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statuts des notifications</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B2BB8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications récentes</CardTitle>
          <CardDescription>Les 10 dernières notifications envoyées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  {log.channel === 'email' ? (
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{log.template_name}</p>
                    <p className="text-sm text-muted-foreground">{log.recipient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {log.status === 'sent' || log.status === 'delivered' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className="text-sm capitalize">{log.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
