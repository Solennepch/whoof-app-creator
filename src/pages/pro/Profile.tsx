import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { User } from "lucide-react";

export default function ProProfile() {
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
          Mon Profil Pro
        </h1>
        <p className="text-muted-foreground">
          Votre profil public visible par les utilisateurs
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profil en cours de configuration</h3>
          <p className="text-muted-foreground text-center">
            Votre profil public sera bientôt disponible
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
