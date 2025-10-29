import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProPartners() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pro/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Partenariats</h1>
          <p className="text-muted-foreground">
            Développez votre activité avec Whoof Apps
          </p>
        </div>
      </div>

      {/* Premium Offer */}
      <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-primary" />
            <Badge variant="secondary">Premium</Badge>
          </div>
          <CardTitle>Devenez Partenaire Premium</CardTitle>
          <CardDescription>
            Bénéficiez d'une visibilité maximale dans l'annuaire Whoof Apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Mise en avant</p>
                <p className="text-sm text-muted-foreground">
                  Votre profil apparaît en tête de liste dans l'annuaire
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Badge Partenaire Officiel</p>
                <p className="text-sm text-muted-foreground">
                  Renforcez votre crédibilité auprès des utilisateurs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Campagnes promotionnelles</p>
                <p className="text-sm text-muted-foreground">
                  Créez des codes promo exclusifs pour les utilisateurs Whoof
                </p>
              </div>
            </div>
          </div>
          <Button className="w-full" size="lg">
            Devenir Partenaire Premium
          </Button>
        </CardContent>
      </Card>

      {/* Community Partnerships */}
      <Card>
        <CardHeader>
          <CardTitle>Partenariats Communauté</CardTitle>
          <CardDescription>
            Collaborez avec d'autres professionnels de l'écosystème
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Rejoignez un réseau de professionnels passionnés et créez des synergies pour mieux servir vos clients.
          </p>
          <Button variant="outline">
            Découvrir les opportunités
          </Button>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
          <CardDescription>
            Notre équipe est là pour vous accompagner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Des questions sur les partenariats ou votre compte professionnel ? Contactez-nous.
          </p>
          <Button variant="outline">
            Contacter le support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
