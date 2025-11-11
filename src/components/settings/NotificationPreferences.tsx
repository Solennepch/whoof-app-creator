import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface NotificationPreference {
  id?: string;
  event_type: string;
  channel: string;
  enabled: boolean;
}

const EVENT_TYPES = [
  { value: 'booking_reminder', label: 'Rappels de rendez-vous' },
  { value: 'booking_confirmed', label: 'Confirmations de réservation' },
  { value: 'booking_cancelled', label: 'Annulations de réservation' },
  { value: 'booking_followup', label: 'Demandes d\'avis après rendez-vous' },
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Convert to map for easier access
      const prefsMap: Record<string, NotificationPreference> = {};
      EVENT_TYPES.forEach(event => {
        const pref = data?.find(p => p.event_type === event.value);
        prefsMap[event.value] = pref || {
          event_type: event.value,
          channel: 'email',
          enabled: true,
        };
      });

      setPreferences(prefsMap);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (eventType: string, updates: Partial<NotificationPreference>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentPref = preferences[eventType];
      const updatedPref = { ...currentPref, ...updates };

      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          event_type: eventType,
          channel: updatedPref.channel,
          enabled: updatedPref.enabled,
        });

      if (error) throw error;

      setPreferences(prev => ({
        ...prev,
        [eventType]: updatedPref,
      }));

      toast({
        title: "Succès",
        description: "Préférences enregistrées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
        <CardDescription>
          Choisissez comment vous souhaitez recevoir vos notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {EVENT_TYPES.map((event) => {
          const pref = preferences[event.value];
          return (
            <div key={event.value} className="space-y-4 pb-4 border-b last:border-0">
              <div className="flex items-center justify-between">
                <Label htmlFor={`enabled-${event.value}`} className="text-base">
                  {event.label}
                </Label>
                <Switch
                  id={`enabled-${event.value}`}
                  checked={pref?.enabled}
                  onCheckedChange={(checked) =>
                    updatePreference(event.value, { enabled: checked })
                  }
                  disabled={saving}
                />
              </div>

              {pref?.enabled && (
                <RadioGroup
                  value={pref.channel}
                  onValueChange={(value) =>
                    updatePreference(event.value, { channel: value })
                  }
                  disabled={saving}
                  className="pl-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id={`email-${event.value}`} />
                    <Label htmlFor={`email-${event.value}`}>Email uniquement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id={`sms-${event.value}`} />
                    <Label htmlFor={`sms-${event.value}`}>SMS uniquement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id={`both-${event.value}`} />
                    <Label htmlFor={`both-${event.value}`}>Email et SMS</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
