import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type GamificationLevel = 'minimal' | 'moderate' | 'complete';

interface GamificationPreferences {
  level: GamificationLevel;
  showXpProgress: boolean;
  showBadges: boolean;
  showLeaderboard: boolean;
  showChallenges: boolean;
  showDailyMissions: boolean;
  showGuilds: boolean;
  showCosmetics: boolean;
}

interface GamificationContextType {
  preferences: GamificationPreferences;
  focusMode: boolean;
  updatePreferences: (prefs: Partial<GamificationPreferences>) => Promise<void>;
  toggleFocusMode: () => void;
  shouldShowFeature: (feature: keyof Omit<GamificationPreferences, 'level'>) => boolean;
  trackEvent: (eventType: string, metadata?: any) => Promise<void>;
}

const defaultPreferences: GamificationPreferences = {
  level: 'complete',
  showXpProgress: true,
  showBadges: true,
  showLeaderboard: true,
  showChallenges: true,
  showDailyMissions: true,
  showGuilds: true,
  showCosmetics: true,
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<GamificationPreferences>(defaultPreferences);
  const [focusMode, setFocusMode] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (!user?.id) return;

    const loadPreferences = async () => {
      const { data } = await supabase
        .from('gamification_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          level: (data as any).level as GamificationLevel,
          showXpProgress: (data as any).show_xp_progress,
          showBadges: (data as any).show_badges,
          showLeaderboard: (data as any).show_leaderboard,
          showChallenges: (data as any).show_challenges,
          showDailyMissions: (data as any).show_daily_missions,
          showGuilds: (data as any).show_guilds,
          showCosmetics: (data as any).show_cosmetics,
        });
      } else {
        // Create default preferences
        await supabase
          .from('gamification_preferences' as any)
          .insert({
            user_id: user.id,
            level: 'complete',
            show_xp_progress: true,
            show_badges: true,
            show_leaderboard: true,
            show_challenges: true,
            show_daily_missions: true,
            show_guilds: true,
            show_cosmetics: true,
          });
      }
    };

    loadPreferences();
  }, [user?.id]);

  const updatePreferences = async (prefs: Partial<GamificationPreferences>) => {
    if (!user?.id) return;

    const newPrefs = { ...preferences, ...prefs };
    setPreferences(newPrefs);

    await supabase
      .from('gamification_preferences' as any)
      .update({
        level: newPrefs.level,
        show_xp_progress: newPrefs.showXpProgress,
        show_badges: newPrefs.showBadges,
        show_leaderboard: newPrefs.showLeaderboard,
        show_challenges: newPrefs.showChallenges,
        show_daily_missions: newPrefs.showDailyMissions,
        show_guilds: newPrefs.showGuilds,
        show_cosmetics: newPrefs.showCosmetics,
      })
      .eq('user_id', user.id);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const shouldShowFeature = (feature: keyof Omit<GamificationPreferences, 'level'>): boolean => {
    if (focusMode) return false;
    return preferences[feature];
  };

  const trackEvent = async (eventType: string, metadata?: any) => {
    if (!user?.id) return;

    await supabase
      .from('gamification_analytics' as any)
      .insert({
        user_id: user.id,
        event_type: eventType,
        metadata: metadata || {},
      });
  };

  return (
    <GamificationContext.Provider
      value={{
        preferences,
        focusMode,
        updatePreferences,
        toggleFocusMode,
        shouldShowFeature,
        trackEvent,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
