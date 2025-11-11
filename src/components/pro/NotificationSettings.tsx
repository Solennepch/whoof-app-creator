import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Badge } from "@/components/ui/badge";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    unregisterServiceWorker,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Les notifications push ne sont pas supportées sur cet appareil
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications Push
            </CardTitle>
            <CardDescription>
              Recevez des alertes en temps réel pour les nouvelles réservations
            </CardDescription>
          </div>
          {permission === 'granted' && subscription && (
            <Badge variant="default">Activées</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Activer les notifications</Label>
            <p className="text-sm text-muted-foreground">
              Vous serez alerté des nouvelles réservations
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={permission === 'granted' && !!subscription}
            onCheckedChange={(checked) => {
              if (checked) {
                requestPermission();
              } else {
                unregisterServiceWorker();
              }
            }}
          />
        </div>

        {permission === 'default' && (
          <Button onClick={requestPermission} className="w-full">
            Activer les notifications
          </Button>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.
            </p>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Types de notifications</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="booking-confirmed" className="text-sm font-normal">
                Réservations confirmées
              </Label>
              <Switch id="booking-confirmed" defaultChecked disabled={!subscription} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-message" className="text-sm font-normal">
                Nouveaux messages
              </Label>
              <Switch id="new-message" defaultChecked disabled={!subscription} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="payment-received" className="text-sm font-normal">
                Paiements reçus
              </Label>
              <Switch id="payment-received" defaultChecked disabled={!subscription} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="review-posted" className="text-sm font-normal">
                Nouveaux avis
              </Label>
              <Switch id="review-posted" defaultChecked disabled={!subscription} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
