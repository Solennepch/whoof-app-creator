import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyProProfile } from "@/hooks/usePro";
import { useProTransactions } from "@/hooks/useProTransactions";
import { CreditCard, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF, downloadPDF } from "@/services/pdfService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProPayments() {
  const { data: profile, isLoading } = useMyProProfile();
  const { data: transactions, isLoading: transactionsLoading } = useProTransactions(profile?.id);

  const handleExportInvoice = async (transaction: any) => {
    try {
      const invoiceData = {
        invoiceNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
        date: format(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: fr }),
        proName: profile?.business_name || 'Professionnel',
        proAddress: profile?.city || '',
        proEmail: profile?.email || '',
        proPhone: profile?.phone || '',
        clientName: transaction.profiles?.display_name || 'Client',
        clientEmail: transaction.user_id,
        serviceName: transaction.pro_bookings?.pro_services?.name || 'Service',
        amount: parseFloat(transaction.amount),
        transactionId: transaction.stripe_payment_id || transaction.id,
        logoUrl: profile?.logo_url,
      };

      const pdfBlob = await generateInvoicePDF(invoiceData);
      downloadPDF(pdfBlob, `facture-${invoiceData.invoiceNumber}.pdf`);
      toast.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  if (!isLoading && !profile) {
    return <Navigate to="/pro/onboarding" replace />;
  }

  if (isLoading || transactionsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl mb-20">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
          Moyens de paiement & facturation
        </h1>
        <p className="text-muted-foreground">
          Gérez vos moyens de paiement et options de facturation
        </p>
      </div>

      {/* Compte Stripe */}
      <Card>
        <CardHeader>
          <CardTitle>Compte connecté</CardTitle>
          <CardDescription>
            Gérez vos paiements sécurisés via Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Compte Stripe</p>
                <p className="text-sm text-muted-foreground">Non connecté</p>
              </div>
            </div>
            <Badge variant="secondary">Inactif</Badge>
          </div>
          <Button className="w-full">Connecter mon compte Stripe</Button>
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
          <CardDescription>Historique complet de vos paiements et factures</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune transaction pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {transaction.pro_bookings?.pro_services?.name || 'Service'}
                        </p>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {transaction.status === 'completed'
                            ? 'Payé'
                            : transaction.status === 'pending'
                            ? 'En attente'
                            : 'Échoué'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.profiles?.display_name || 'Client'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(transaction.created_at), 'dd MMM yyyy - HH:mm', {
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {parseFloat(transaction.amount).toFixed(2)} €
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.currency}</p>
                    </div>
                  </div>
                  {transaction.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportInvoice(transaction)}
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message de sécurité */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-sm">
              Pawtes utilise Stripe pour garantir la sécurité de vos paiements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
