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
          Profil professionnel
        </h1>
        <p className="text-muted-foreground">
          Gérez les informations affichées sur votre fiche publique
        </p>
      </div>

      <div className="space-y-4">
        {/* Photo et logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Photo de profil et logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <Button variant="outline">Changer la photo</Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'entreprise */}
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
              <p className="text-sm font-medium mb-1">Description courte</p>
              <p className="text-muted-foreground">{profile?.description || "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Activité</p>
              <p className="text-muted-foreground capitalize">{profile?.activity}</p>
            </div>
            <Button variant="outline" onClick={() => {}}>Modifier</Button>
          </CardContent>
        </Card>

        {/* Adresse & horaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Adresse & horaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Adresse</p>
              <p className="text-muted-foreground">{profile?.city || "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Horaires d'ouverture</p>
              <p className="text-muted-foreground">Lun-Ven: 9h-18h</p>
            </div>
            <Button variant="outline" onClick={() => {}}>Modifier</Button>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
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
            <Button variant="outline" onClick={() => {}}>Modifier</Button>
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card>
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Instagram</p>
              <p className="text-muted-foreground">Non renseigné</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Facebook</p>
              <p className="text-muted-foreground">Non renseigné</p>
            </div>
            <Button variant="outline" onClick={() => {}}>Modifier</Button>
          </CardContent>
        </Card>

        {/* Aperçu du profil public */}
        <Button className="w-full">
          Aperçu du profil public
        </Button>
      </div>
    </div>
  );
}
