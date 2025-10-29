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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Ban, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { useResolveReport } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Report {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  reporter: {
    display_name: string | null;
    avatar_url: string | null;
  };
  created_at: string;
}

interface ReportsQueueProps {
  reports: Report[];
  isLoading: boolean;
}

export function ReportsQueue({ reports, isLoading }: ReportsQueueProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [action, setAction] = useState<string>('ignore');
  const [sanctionType, setSanctionType] = useState<'warn' | 'suspend' | 'ban'>('warn');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resolveReport = useResolveReport();

  const handleResolve = async () => {
    if (!selectedReport) return;

    const sanctionData = action === 'sanction' ? {
      type: sanctionType,
      reason: selectedReport.reason,
      end_at: sanctionType === 'suspend' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    } : undefined;

    await resolveReport.mutateAsync({
      reportId: selectedReport.id,
      status: action === 'ignore' ? 'ignored' : 'resolved',
      action,
      sanctionData
    });

    setIsDialogOpen(false);
    setSelectedReport(null);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun signalement ouvert
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Signalé par</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Raison</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={report.reporter?.avatar_url || undefined} />
                <AvatarFallback>
                  {report.reporter?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{report.reporter?.display_name || 'Utilisateur'}</span>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{report.entity_type}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
            <TableCell>
              {format(new Date(report.created_at), 'dd MMM yyyy', { locale: fr })}
            </TableCell>
            <TableCell>
              <Dialog open={isDialogOpen && selectedReport?.id === report.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedReport(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Traiter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Traiter le signalement</DialogTitle>
                    <DialogDescription>
                      Choisissez l'action à appliquer pour ce signalement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-2">
                      <p><strong>Type:</strong> {report.entity_type}</p>
                      <p><strong>Raison:</strong> {report.reason}</p>
                      <p><strong>Signalé par:</strong> {report.reporter?.display_name}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action</label>
                      <Select value={action} onValueChange={setAction}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">Ignorer</SelectItem>
                          <SelectItem value="remove">Retirer le contenu</SelectItem>
                          <SelectItem value="sanction">Sanctionner l'utilisateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {action === 'sanction' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type de sanction</label>
                        <Select value={sanctionType} onValueChange={(v) => setSanctionType(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warn">Avertissement</SelectItem>
                            <SelectItem value="suspend">Suspension (7 jours)</SelectItem>
                            <SelectItem value="ban">Bannissement définitif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleResolve}
                      disabled={resolveReport.isPending}
                      variant={action === 'sanction' ? 'destructive' : 'default'}
                    >
                      {action === 'sanction' ? (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Sanctionner
                        </>
                      ) : (
                        <>Confirmer</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
