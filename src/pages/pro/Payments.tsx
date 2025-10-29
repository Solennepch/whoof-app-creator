import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuration à venir</h3>
          <p className="text-muted-foreground text-center">
            Les options de paiement et facturation seront bientôt disponibles
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
