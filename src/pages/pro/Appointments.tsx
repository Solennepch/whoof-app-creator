import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMyProProfile } from "@/hooks/usePro";
import { Calendar, Plus } from "lucide-react";

export default function ProAppointments() {
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
            Mes rendez-vous
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de tous vos rendez-vous
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
          <p className="text-muted-foreground text-center">
            Vos prochains rendez-vous apparaîtront ici
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
