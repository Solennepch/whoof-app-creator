import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyProProfile } from "@/hooks/usePro";
import { CalendarDays } from "lucide-react";

export default function ProEvents() {
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
          Événements / Salons canins
        </h1>
        <p className="text-muted-foreground">
          Découvrez les événements professionnels à venir
        </p>
      </div>

      {/* Événements à venir */}
      <div className="space-y-3">
        {[
          { title: "Salon Whoof Pro - Lyon", date: "14 Juin 2025", location: "Lyon", type: "Salon" },
          { title: "Formation Bien-être animal", date: "20 Juin 2025", location: "Paris", type: "Formation" },
          { title: "Meet-up Pro France", date: "5 Juillet 2025", location: "Marseille", type: "Rencontre" },
        ].map((event, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
                  </div>
                </div>
                <Badge variant="secondary">{event.type}</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Ajouter à mon agenda
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prochain événement mis en avant */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🐾</span>
            <p className="text-sm">
              <strong>Prochain salon Whoof Pro à Lyon</strong> – 14 juin 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
