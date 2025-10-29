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
          Aide et Support
        </h1>
        <p className="text-muted-foreground">
          Besoin d'aide ? Nous sommes là pour vous
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat en direct
            </CardTitle>
            <CardDescription>
              Discutez avec notre équipe support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Démarrer une conversation</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Centre d'aide
            </CardTitle>
            <CardDescription>
              Guides et tutoriels détaillés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Accéder au centre d'aide</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
            <CardDescription>
              Envoyez-nous un message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              support@whoofapps.com
            </p>
            <Button variant="outline" className="w-full">Envoyer un email</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Téléphone
            </CardTitle>
            <CardDescription>
              Appelez notre support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Du lundi au vendredi, 9h-18h
            </p>
            <Button variant="outline" className="w-full">Afficher le numéro</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions fréquentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-2 border-primary pl-4 py-2">
            <p className="font-medium mb-1">Comment modifier mon profil ?</p>
            <p className="text-sm text-muted-foreground">
              Rendez-vous dans la section "Profil Pro" puis cliquez sur "Modifier"
            </p>
          </div>
          <div className="border-l-2 border-primary pl-4 py-2">
            <p className="font-medium mb-1">Comment gérer mes tarifs ?</p>
            <p className="text-sm text-muted-foreground">
              Accédez à "Mes services et tarifs" depuis le menu burger
            </p>
          </div>
          <div className="border-l-2 border-primary pl-4 py-2">
            <p className="font-medium mb-1">Comment répondre aux avis clients ?</p>
            <p className="text-sm text-muted-foreground">
              Consultez la section "Mes avis clients" dans le menu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
