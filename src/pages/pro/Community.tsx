import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyProProfile } from "@/hooks/usePro";
import { Users } from "lucide-react";

export default function ProCommunity() {
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
          Groupes / Forums pros
        </h1>
        <p className="text-muted-foreground">
          Échangez avec la communauté des professionnels
        </p>
      </div>

      {/* Liste de groupes */}
      <div className="space-y-3">
        {[
          { name: "Toiletteurs France", members: "1.2k membres", activity: "Actif" },
          { name: "Vétos indépendants", members: "850 membres", activity: "Très actif" },
          { name: "Pet-sitters Europe", members: "3.4k membres", activity: "Actif" },
        ].map((group, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.members}</p>
                  </div>
                </div>
                <Badge variant="secondary">{group.activity}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full">Rejoindre un groupe</Button>

      {/* Message d'encouragement */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <p className="text-sm">
              Ici, on s'entraide, on partage, et on évolue ensemble.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
