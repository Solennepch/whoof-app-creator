import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMyProProfile } from "@/hooks/usePro";
import { Star } from "lucide-react";

export default function ProReviews() {
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
          Vos avis clients
        </h1>
        <p className="text-muted-foreground">
          Gérez et valorisez vos retours clients
        </p>
      </div>

      {/* Statistique moyenne */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">⭐ 4.8 / 5</div>
            <p className="text-sm text-muted-foreground">Note moyenne sur 24 avis</p>
          </div>
        </CardContent>
      </Card>

      {/* Exemple d'avis */}
      <div className="space-y-4">
        {[
          { name: "Marie D.", rating: 5, message: "Excellent service, mon chien est revenu tout propre et heureux !" },
          { name: "Jean P.", rating: 5, message: "Très professionnel, je recommande vivement." },
          { name: "Sophie L.", rating: 4, message: "Bon rapport qualité/prix, personnel accueillant." },
        ].map((review, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm">Répondre</Button>
              </div>
              <p className="text-sm text-muted-foreground">{review.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conseil */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <p className="text-sm">
              Répondre aux avis montre votre engagement et inspire confiance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
