import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGamification } from '@/contexts/GamificationContext';
import { useAddXPEvent, useCheckBadges } from './useGamification';
import { toast } from 'sonner';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  showFor?: ('minimal' | 'moderate' | 'complete')[];
}

interface Tutorial {
  id: string;
  name: string;
  steps: TutorialStep[];
}

export function useTutorial(tutorialId: string) {
  const { user } = useAuth();
  const { preferences } = useGamification();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Hooks for XP and badges
  const addXPEvent = useAddXPEvent();
  const checkBadges = useCheckBadges();

  // Load tutorial progress
  const { data: progress } = useQuery({
    queryKey: ['tutorial-progress', user?.id, tutorialId],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('tutorial_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId)
        .maybeSingle();

      return data;
    },
    enabled: !!user?.id,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ stepIndex, completed }: { stepIndex: number; completed?: boolean }) => {
      if (!user?.id) return;

      const updateData: any = {
        step_index: stepIndex,
        updated_at: new Date().toISOString(),
      };

      if (completed) {
        updateData.completed = true;
        updateData.completed_at = new Date().toISOString();
      }

      const { data: existing } = await supabase
        .from('tutorial_progress' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('tutorial_progress' as any)
          .update(updateData)
          .eq('id', (existing as any).id);
      } else {
        await supabase
          .from('tutorial_progress' as any)
          .insert({
            user_id: user.id,
            tutorial_id: tutorialId,
            ...updateData,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-progress', user?.id, tutorialId] });
    },
  });

  // Filter steps based on gamification level
  const filterSteps = (steps: TutorialStep[]) => {
    return steps.filter(step => {
      if (!step.showFor) return true;
      return step.showFor.includes(preferences.level);
    });
  };

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    setCurrentStepIndex(prev => prev + 1);
    updateProgressMutation.mutate({ stepIndex: currentStepIndex + 1 });
  };

  const previousStep = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
    updateProgressMutation.mutate({ stepIndex: currentStepIndex - 1 });
  };

  const skipTutorial = () => {
    setIsActive(false);
    updateProgressMutation.mutate({ stepIndex: -1, completed: true });
  };

  const completeTutorial = async () => {
    setIsActive(false);
    updateProgressMutation.mutate({ stepIndex: currentStepIndex, completed: true });
    
    // Award XP for completing tutorial
    if (user?.id) {
      try {
        await addXPEvent.mutateAsync({
          userId: user.id,
          type: 'tutorial_completed',
          points: tutorialId === 'welcome' ? 100 : 150,
          metadata: { tutorial_id: tutorialId },
        });

        // Check and award badges
        await checkBadges.mutateAsync(user.id);

        // Award specific tutorial badge
        const badgeCode = tutorialId === 'welcome' ? 'TUTORIAL_WELCOME' : 'TUTORIAL_GAMIFICATION';
        await supabase
          .from('user_badges' as any)
          .insert({
            user_id: user.id,
            badge_code: badgeCode,
          })
          .select()
          .single();

        // Check for master badge
        await supabase.rpc('check_tutorial_badges' as any, { p_user_id: user.id });

        toast.success(
          '🎓 Tutoriel complété !',
          { description: `Vous avez gagné ${tutorialId === 'welcome' ? 100 : 150} XP` }
        );
      } catch (error) {
        console.error('Error awarding tutorial rewards:', error);
      }
    }
  };

  // Auto-start if not completed and not skipped
  useEffect(() => {
    if (progress === undefined) return;
    
    const progressData = progress as any;
    
    if (!progressData && user?.id) {
      // First time - auto start
      startTutorial();
    } else if (progressData && !progressData.completed && progressData.step_index >= 0) {
      // Resume from last step
      setCurrentStepIndex(progressData.step_index);
      setIsActive(true);
    }
  }, [progress, user?.id]);

  return {
    isActive,
    currentStepIndex,
    progress,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    filterSteps,
  };
}
