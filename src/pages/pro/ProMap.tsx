import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { MapPin, Navigation, Eye, Users } from "lucide-react";

export default function ProMap() {
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
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
          Carte Whoof
        </h1>
        <p className="text-muted-foreground">
          Soyez visible auprès des utilisateurs à proximité
        </p>
      </div>

      {/* Map placeholder */}
      <Card>
        <CardContent className="p-0 h-[400px] rounded-xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-semibold mb-2">Carte interactive</p>
              <p className="text-sm text-muted-foreground">
                La carte Whoof sera bientôt disponible
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ma visibilité
            </CardTitle>
            <CardDescription>
              Paramètres d'affichage sur la carte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Visible sur la carte</p>
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs peuvent vous trouver
                </p>
              </div>
              <Button variant="outline" size="sm">
                Activer
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rayon de visibilité</p>
                <p className="text-sm text-muted-foreground">
                  Zone géographique d'affichage
                </p>
              </div>
              <Button variant="outline" size="sm">
                10 km
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professionnels à proximité
            </CardTitle>
            <CardDescription>
              Collaborez avec d'autres pros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2]" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Clinique Vétérinaire</p>
                  <p className="text-xs text-muted-foreground">À 2.5 km</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC14D] to-[#FF5DA2]" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Pension canine</p>
                  <p className="text-xs text-muted-foreground">À 3.8 km</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues sur la carte</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics vers profil</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Depuis la carte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itinéraires</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Demandes ce mois
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
