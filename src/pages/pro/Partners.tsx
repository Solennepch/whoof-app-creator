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
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
          Offres partenaires
        </h1>
        <p className="text-muted-foreground">
          Bénéficiez d'avantages exclusifs réservés aux professionnels Pawtes
        </p>
        </div>
      </div>

      {/* Liste des offres partenaires */}
      <div className="space-y-3">
        {[
          { 
            company: "AnimoVet", 
            offer: "10% sur les produits vétérinaires",
            description: "Valable sur toute la gamme de produits de soin",
            badge: "Nouveau"
          },
          { 
            company: "Pawtes Pro+", 
            offer: "Formation 'Bien-être animal' gratuite",
            description: "Formation en ligne de 3h avec certificat",
            badge: "Populaire"
          },
          { 
            company: "PetStore Pro", 
            offer: "Livraison gratuite pour commandes pros",
            description: "Sans minimum d'achat",
            badge: ""
          },
        ].map((partner, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-lg">{partner.company}</p>
                  <p className="text-primary font-medium">{partner.offer}</p>
                  <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
                </div>
                {partner.badge && (
                  <Badge variant={partner.badge === "Nouveau" ? "default" : "secondary"}>
                    {partner.badge}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                En profiter
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full">Découvrir toutes les offres</Button>

      {/* Premium Partnership */}
      <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-primary" />
            <Badge variant="secondary">Premium</Badge>
          </div>
          <CardTitle>Devenez Partenaire Premium</CardTitle>
          <CardDescription>
            Bénéficiez d'une visibilité maximale dans l'annuaire Pawtes
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
                  Créez des codes promo exclusifs pour les utilisateurs Pawtes
                </p>
              </div>
            </div>
          </div>
          <Button className="w-full" size="lg">
            Devenir Partenaire Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
