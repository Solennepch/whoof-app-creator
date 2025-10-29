import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useVerifyUser } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Verification {
  id: string;
  user_id: string;
  type: string;
  file_url: string;
  status: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface VerificationsQueueProps {
  verifications: Verification[];
  isLoading: boolean;
}

export function VerificationsQueue({ verifications, isLoading }: VerificationsQueueProps) {
  const [selectedVerif, setSelectedVerif] = useState<Verification | null>(null);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const verifyUser = useVerifyUser();

  const handleVerify = async (verificationId: string, status: 'approved' | 'rejected') => {
    await verifyUser.mutateAsync({ verificationId, status, notes });
    setIsDialogOpen(false);
    setNotes("");
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>;
  }

  if (verifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune vérification en attente
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {verifications.map((verif) => (
          <TableRow key={verif.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={verif.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {verif.profiles?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{verif.profiles?.display_name || 'Utilisateur'}</span>
            </TableCell>
            <TableCell>
              <Badge variant={verif.type === 'identity' ? 'default' : 'secondary'}>
                {verif.type === 'identity' ? 'Identité' : 'Puce'}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(verif.created_at), 'dd MMM yyyy', { locale: fr })}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen && selectedVerif?.id === verif.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setSelectedVerif(null);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVerif(verif)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Vérification - {verif.type === 'identity' ? 'Identité' : 'Puce'}</DialogTitle>
                      <DialogDescription>
                        Examinez le document et approuvez ou rejetez la vérification
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <img 
                          src={verif.file_url} 
                          alt="Document de vérification" 
                          className="w-full h-auto rounded"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (optionnel)</label>
                        <Textarea
                          placeholder="Ajoutez des notes sur cette vérification..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleVerify(verif.id, 'rejected')}
                        disabled={verifyUser.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => handleVerify(verif.id, 'approved')}
                        disabled={verifyUser.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
