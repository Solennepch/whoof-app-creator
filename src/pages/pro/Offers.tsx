import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMyProProfile } from "@/hooks/usePro";
import { Tag, Plus } from "lucide-react";

export default function ProOffers() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
            Mes offres et promotions
          </h1>
          <p className="text-muted-foreground">
            Gérez vos promotions et offres spéciales
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Tag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune offre pour l'instant</h3>
          <p className="text-muted-foreground text-center">
            Créez votre première offre promotionnelle pour attirer plus de clients
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
