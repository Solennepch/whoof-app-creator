import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

      {/* Exemple de rendez-vous */}
      <div className="space-y-3">
        {[
          { date: "15 Jan", time: "10:00", client: "Sophie Martin", service: "Toilettage", status: "Confirmé" },
          { date: "15 Jan", time: "14:30", client: "Marc Dubois", service: "Consultation", status: "En attente" },
          { date: "16 Jan", time: "09:00", client: "Julie Petit", service: "Pension", status: "Confirmé" },
        ].map((rdv, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{rdv.date}</p>
                    <p className="font-bold">{rdv.time}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{rdv.client}</p>
                    <p className="text-sm text-muted-foreground">{rdv.service}</p>
                  </div>
                </div>
                <Badge variant={rdv.status === "Confirmé" ? "default" : "secondary"}>
                  {rdv.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        Gérer mes disponibilités
      </Button>

      {/* État vide alternatif */}
      {/* <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <span className="text-6xl mb-4">🕓</span>
          <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous à venir</h3>
          <p className="text-muted-foreground text-center">
            Vos prochains rendez-vous apparaîtront ici
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
