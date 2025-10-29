import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { Settings, User, Building, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProSettings() {
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
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Gérez votre profil et identité professionnelle
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Nom de l'entreprise</p>
              <p className="text-muted-foreground">{profile?.business_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Activité</p>
              <p className="text-muted-foreground capitalize">{profile?.activity}</p>
            </div>
            <Button variant="outline">Modifier</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </p>
              <p className="text-muted-foreground">{profile?.phone || "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-muted-foreground">{profile?.email || "Non renseigné"}</p>
            </div>
            <Button variant="outline">Modifier</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
