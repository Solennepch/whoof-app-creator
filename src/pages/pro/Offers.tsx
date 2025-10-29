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
          Offres & promotions
        </h1>
        <p className="text-muted-foreground">
          Attirez de nouveaux clients grâce à vos offres spéciales
        </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Tag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune offre pour le moment</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Créez votre première offre promotionnelle pour attirer plus de clients
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Exemples d'offres:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Soin complet à -10% jusqu'à fin du mois !</li>
              <li>Offre découverte : 1re visite gratuite pour les nouveaux clients</li>
            </ul>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer une offre
          </Button>
        </CardContent>
      </Card>

      {/* Info section */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">📣</span>
            <p className="text-sm">
              Vos offres actives apparaissent automatiquement sur votre profil public Whoof.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
