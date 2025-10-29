import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyProProfile } from "@/hooks/usePro";
import { CreditCard } from "lucide-react";

export default function ProPayments() {
  const { data: profile, isLoading } = useMyProProfile();

  if (!isLoading && !profile) {
    return <Navigate to="/pro/onboarding" replace />;
  }

  if (isLoading) {
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune transaction pour le moment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Message de sécurité */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-sm">
              Whoof utilise Stripe pour garantir la sécurité de vos paiements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
