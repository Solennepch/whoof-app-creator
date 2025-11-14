import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  getActiveEvent, 
  getActiveChallenge,
  getChallengeProgress,
  trackChallengeProgress,
  type ChallengeProgress 
} from '@/services/eventService';
import type { AnnualEvent } from '@/lib/events/annualEvents';
import type { MonthlyChallenge } from '@/lib/events/monthlyChallenges';

export const useEvents = () => {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<AnnualEvent | undefined>();
  const [currentChallenge, setCurrentChallenge] = useState<MonthlyChallenge | undefined>();
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEventsAndChallenges = async () => {
      setIsLoading(true);
      
      // Charger l'événement du mois
      const event = getActiveEvent();
      setCurrentEvent(event);

      // Charger le challenge du mois
      const challenge = getActiveChallenge();
      setCurrentChallenge(challenge);

      // Charger la progression du challenge si utilisateur connecté
      if (user && challenge) {
        const progress = await getChallengeProgress(user.id, challenge.id);
        setChallengeProgress(progress);
      }

      setIsLoading(false);
    };

    loadEventsAndChallenges();
  }, [user]);

  const updateChallengeProgress = async (increment: number = 1) => {
    if (!user || !currentChallenge) return;

    const updatedProgress = await trackChallengeProgress(
      user.id,
      currentChallenge.id,
      increment
    );

    if (updatedProgress) {
      setChallengeProgress(updatedProgress);
    }
  };

  const refreshProgress = async () => {
    if (!user || !currentChallenge) return;

    const progress = await getChallengeProgress(user.id, currentChallenge.id);
    setChallengeProgress(progress);
  };

  return {
    currentEvent,
    currentChallenge,
    challengeProgress,
    isLoading,
    updateChallengeProgress,
    refreshProgress,
  };
};
