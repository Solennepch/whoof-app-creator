import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface NotificationPrefs {
  notify_xp_gains: boolean;
  notify_level_up: boolean;
  notify_badge_earned: boolean;
  notify_challenge_available: boolean;
  notify_challenge_completed: boolean;
  notify_daily_missions: boolean;
  notify_league_promotion: boolean;
  notify_guild_activity: boolean;
  notify_secret_achievement_hint: boolean;
}

export function NotificationPreferencesGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences-gamification', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('notification_preferences_gamification' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        // Create default preferences
        const { data: newPrefs } = await supabase
          .from('notification_preferences_gamification' as any)
          .insert({
            user_id: user.id,
          })
          .select()
          .single();
        
        return newPrefs as any as NotificationPrefs;
      }

      return data as any as NotificationPrefs;
    },
    enabled: !!user?.id,
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPrefs>) => {
      if (!user?.id) return;

      await supabase
        .from('notification_preferences_gamification' as any)
        .update(updates)
        .eq('user_id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences-gamification', user?.id] });
      toast.success('Préférences mises à jour');
    },
  });

  const handleToggle = (field: keyof NotificationPrefs) => {
    if (!preferences) return;
    updatePreferenceMutation.mutate({
      [field]: !preferences[field],
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications de gamification
        </CardTitle>
        <CardDescription>
          Choisissez les notifications que vous souhaitez recevoir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-xp" className="cursor-pointer">
            Gains d'XP
          </Label>
          <Switch
            id="notify-xp"
            checked={preferences.notify_xp_gains}
            onCheckedChange={() => handleToggle('notify_xp_gains')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-level" className="cursor-pointer">
            Montée de niveau
          </Label>
          <Switch
            id="notify-level"
            checked={preferences.notify_level_up}
            onCheckedChange={() => handleToggle('notify_level_up')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-badge" className="cursor-pointer">
            Badges débloqués
          </Label>
          <Switch
            id="notify-badge"
            checked={preferences.notify_badge_earned}
            onCheckedChange={() => handleToggle('notify_badge_earned')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-challenge-available" className="cursor-pointer">
            Nouveaux challenges disponibles
          </Label>
          <Switch
            id="notify-challenge-available"
            checked={preferences.notify_challenge_available}
            onCheckedChange={() => handleToggle('notify_challenge_available')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-challenge-completed" className="cursor-pointer">
            Challenges complétés
          </Label>
          <Switch
            id="notify-challenge-completed"
            checked={preferences.notify_challenge_completed}
            onCheckedChange={() => handleToggle('notify_challenge_completed')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-missions" className="cursor-pointer">
            Missions quotidiennes
          </Label>
          <Switch
            id="notify-missions"
            checked={preferences.notify_daily_missions}
            onCheckedChange={() => handleToggle('notify_daily_missions')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-league" className="cursor-pointer">
            Promotions de ligue
          </Label>
          <Switch
            id="notify-league"
            checked={preferences.notify_league_promotion}
            onCheckedChange={() => handleToggle('notify_league_promotion')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-guild" className="cursor-pointer">
            Activité de guilde
          </Label>
          <Switch
            id="notify-guild"
            checked={preferences.notify_guild_activity}
            onCheckedChange={() => handleToggle('notify_guild_activity')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-secret" className="cursor-pointer">
            Indices de succès secrets
          </Label>
          <Switch
            id="notify-secret"
            checked={preferences.notify_secret_achievement_hint}
            onCheckedChange={() => handleToggle('notify_secret_achievement_hint')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
