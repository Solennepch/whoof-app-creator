import { ReactNode, useEffect } from 'react';
import { useGamification } from '@/contexts/GamificationContext';

interface GamificationWrapperProps {
  children: ReactNode;
  feature: 'showXpProgress' | 'showBadges' | 'showLeaderboard' | 'showChallenges' | 'showDailyMissions' | 'showGuilds' | 'showCosmetics';
  trackView?: boolean;
  trackViewName?: string;
}

export function GamificationWrapper({ 
  children, 
  feature, 
  trackView = false,
  trackViewName 
}: GamificationWrapperProps) {
  const { shouldShowFeature, trackEvent } = useGamification();

  useEffect(() => {
    if (trackView && trackViewName && shouldShowFeature(feature)) {
      trackEvent('view', { feature: trackViewName });
    }
  }, [trackView, trackViewName, feature, shouldShowFeature, trackEvent]);

  if (!shouldShowFeature(feature)) {
    return null;
  }

  return (
    <div
      onClick={() => {
        if (trackViewName) {
          trackEvent('interaction', { feature: trackViewName });
        }
      }}
    >
      {children}
    </div>
  );
}
