import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMyProProfile } from "@/hooks/usePro";
import { Settings, Plus, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProServices() {
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

  // Exemple de services
  const services = [
    { name: "Toilettage complet", price: "45€", duration: "2h" },
    { name: "Consultation vétérinaire", price: "30€", duration: "30min" },
    { name: "Pension canine (journée)", price: "25€", duration: "1 jour" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl mb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
            Vos services & tarifs
          </h1>
          <p className="text-muted-foreground">
            Décrivez précisément ce que vous proposez à vos clients
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un service
        </Button>
      </div>

      {/* Liste des services */}
      <div className="space-y-3">
        {services.map((service, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.duration}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-lg font-bold">
                  {service.price}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conseil */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">
              <strong>Conseil:</strong> Les services clairs et illustrés attirent 2x plus de réservations sur Whoof.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
