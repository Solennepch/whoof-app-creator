import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, EyeOff, AlertTriangle } from "lucide-react";
import { useValidateAlert } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface AlertsQueueProps {
  alerts: Alert[];
  isLoading: boolean;
}

export function AlertsQueue({ alerts, isLoading }: AlertsQueueProps) {
  const validateAlert = useValidateAlert();

  const handleAction = async (alertId: string, action: 'validate' | 'hide' | 'resolve') => {
    await validateAlert.mutateAsync({ alertId, action });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune alerte active
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Créé par</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Titre</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={alert.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {alert.profiles?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{alert.profiles?.display_name || 'Utilisateur'}</span>
            </TableCell>
            <TableCell>
              <Badge variant={alert.type === 'danger' ? 'destructive' : 'default'}>
                {alert.type === 'danger' ? 'Danger' : 'Chien perdu'}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{alert.title}</TableCell>
            <TableCell>
              {format(new Date(alert.created_at), 'dd MMM yyyy', { locale: fr })}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(alert.id, 'validate')}
                  disabled={validateAlert.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valider
                </Button>
                {alert.type === 'lost_dog' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction(alert.id, 'resolve')}
                    disabled={validateAlert.isPending}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Résolu
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAction(alert.id, 'hide')}
                  disabled={validateAlert.isPending}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Masquer
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
