import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGamification } from '@/contexts/GamificationContext';

interface TooltipConfig {
  id: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showFor?: ('minimal' | 'moderate' | 'complete')[];
}

export function useContextualTooltip(config: TooltipConfig) {
  const { user } = useAuth();
  const { preferences } = useGamification();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Check if tooltip should be shown based on gamification level
  const shouldShowForLevel = !config.showFor || config.showFor.includes(preferences.level);

  // Load tooltip view history
  const { data: tooltipView } = useQuery({
    queryKey: ['tooltip-view', user?.id, config.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('tooltip_views' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('tooltip_id', config.id)
        .maybeSingle();

      return data;
    },
    enabled: !!user?.id && shouldShowForLevel,
  });

  // Track tooltip view mutation
  const trackViewMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { data: existing } = await supabase
        .from('tooltip_views' as any)
        .select('id, view_count')
        .eq('user_id', user.id)
        .eq('tooltip_id', config.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('tooltip_views' as any)
          .update({
            view_count: (existing as any).view_count + 1,
          })
          .eq('id', (existing as any).id);
      } else {
        await supabase
          .from('tooltip_views' as any)
          .insert({
            user_id: user.id,
            tooltip_id: config.id,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tooltip-view', user?.id, config.id] });
    },
  });

  // Dismiss tooltip mutation
  const dismissMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { data: existing } = await supabase
        .from('tooltip_views' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('tooltip_id', config.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('tooltip_views' as any)
          .update({
            dismissed_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tooltip-view', user?.id, config.id] });
    },
  });

  // Auto-show tooltip on first use
  useEffect(() => {
    if (!user?.id || !shouldShowForLevel) return;
    
    if (tooltipView === undefined) return;

    const view = tooltipView as any;
    
    // Show tooltip if never shown or not dismissed
    if (!view || (!view.dismissed_at && view.view_count < 3)) {
      setIsOpen(true);
      if (!view) {
        trackViewMutation.mutate();
      }
    }
  }, [tooltipView, user?.id, shouldShowForLevel]);

  const handleDismiss = () => {
    setIsOpen(false);
    dismissMutation.mutate();
  };

  return {
    isOpen,
    shouldShow: shouldShowForLevel && (!tooltipView || !(tooltipView as any)?.dismissed_at),
    handleDismiss,
    setIsOpen,
  };
}
