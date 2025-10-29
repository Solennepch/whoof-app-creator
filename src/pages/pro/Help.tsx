import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { HelpCircle, MessageSquare, Book, Mail, Phone } from "lucide-react";

export default function ProHelp() {
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
          Centre d'aide Whoof Pro
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          Une question ? On est là pour vous aider 🐾
        </p>
      </div>

      {/* FAQ rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            FAQ rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Comment devenir partenaire certifié ?</h4>
            <p className="text-sm text-muted-foreground">
              Accédez à la section "Partenariats" et cliquez sur "Devenir Partenaire Premium" pour découvrir les avantages et soumettre votre candidature.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Comment modifier mes tarifs ?</h4>
            <p className="text-sm text-muted-foreground">
              Rendez-vous dans "Mes services et tarifs" depuis le menu, puis cliquez sur l'icône de modification à côté de chaque service.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Comment supprimer un rendez-vous ?</h4>
            <p className="text-sm text-muted-foreground">
              Dans "Agenda" ou "Mes rendez-vous", sélectionnez le rendez-vous et choisissez l'option "Annuler" puis confirmez.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Moyens de contact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat en direct
            </CardTitle>
            <CardDescription>
              Discutez avec notre équipe de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Démarrer une conversation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Centre d'aide
            </CardTitle>
            <CardDescription>
              Consultez nos guides et tutoriels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Accéder aux ressources</Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact info */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Contacter le support Whoof
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">contact@whoof.app</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Téléphone</p>
              <p className="text-sm text-muted-foreground">+33 7 66 11 30 76</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Disponibles du lundi au vendredi, 9h à 18h
          </p>
          <Button className="w-full mt-4">Contacter le support</Button>
        </CardContent>
      </Card>
    </div>
  );
}
