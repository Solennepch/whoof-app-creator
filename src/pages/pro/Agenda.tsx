import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { Calendar, Clock, Plus, Users } from "lucide-react";

export default function ProAgenda() {
  const { data: profile, isLoading } = useMyProProfile();

  // Redirect to pro onboarding if no profile
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
    <div className="container mx-auto p-6 space-y-6 max-w-6xl mb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fredoka" }}>
            Agenda
          </h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous, créneaux et disponibilités
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#7B61FF] to-[#FF5DA2] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rendez-vous du jour
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Example appointments */}
            <div className="flex items-center gap-4 p-4 rounded-xl border">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-semibold">10:00</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Toilettage - Max</span>
                  <Badge variant="outline">Confirmé</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Client: Sophie Martin
                </p>
              </div>
              <Button variant="outline" size="sm">
                Détails
              </Button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-semibold">14:30</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Consultation - Luna</span>
                  <Badge variant="outline" className="bg-amber-100">En attente</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Client: Thomas Dubois
                </p>
              </div>
              <Button variant="outline" size="sm">
                Détails
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly view */}
      <Card>
        <CardHeader>
          <CardTitle>Vue de la semaine</CardTitle>
          <CardDescription>
            Gérez vos disponibilités et créneaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calendrier interactif bientôt disponible</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              rendez-vous planifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              clients à servir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              demandes à confirmer
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
