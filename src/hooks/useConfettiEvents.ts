import { useEffect } from 'react';
import { celebrateCompletion, celebrateMilestone, celebrateTopPosition } from '@/lib/confetti';

export function useConfettiEvents() {
  useEffect(() => {
    const handleChallengeCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Challenge completed:', customEvent.detail);
      celebrateCompletion();
    };

    const handleMilestoneReached = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Milestone reached:', customEvent.detail);
      celebrateMilestone();
    };

    const handleTopPosition = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Top position achieved:', customEvent.detail);
      celebrateTopPosition(customEvent.detail.position);
    };

    window.addEventListener('challenge-completed', handleChallengeCompleted);
    window.addEventListener('milestone-reached', handleMilestoneReached);
    window.addEventListener('top-position', handleTopPosition);

    return () => {
      window.removeEventListener('challenge-completed', handleChallengeCompleted);
      window.removeEventListener('milestone-reached', handleMilestoneReached);
      window.removeEventListener('top-position', handleTopPosition);
    };
  }, []);
}
