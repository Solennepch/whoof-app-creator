import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMyProProfile } from "@/hooks/usePro";
import { Bell } from "lucide-react";

export default function ProNotifications() {
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
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Gérez vos préférences de notification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences
          </CardTitle>
          <CardDescription>
            Choisissez comment vous souhaitez être notifié
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-messages">Nouveaux messages</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir une notification pour chaque nouveau message
              </p>
            </div>
            <Switch id="new-messages" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointments">Rendez-vous</Label>
              <p className="text-sm text-muted-foreground">
                Rappels pour vos rendez-vous à venir
              </p>
            </div>
            <Switch id="appointments" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reviews">Nouveaux avis</Label>
              <p className="text-sm text-muted-foreground">
                Être notifié des nouveaux avis clients
              </p>
            </div>
            <Switch id="reviews" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Actualités Whoof</Label>
              <p className="text-sm text-muted-foreground">
                Nouveautés, conseils et opportunités
              </p>
            </div>
            <Switch id="marketing" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
