import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // Session & User
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  
  // Match tracking
  todayMatches: number;
  incrementMatches: () => void;
  resetMatches: () => void;
  lastMatchDate: string | null;
  
  // Tutorial & Onboarding
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  
  // Discovery preferences
  discoveryMode: 'region' | 'adoption';
  setDiscoveryMode: (mode: 'region' | 'adoption') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Session & User
      isPremium: false,
      setIsPremium: (isPremium) => set({ isPremium }),
      
      // Match tracking with daily reset
      todayMatches: 0,
      lastMatchDate: null,
      incrementMatches: () => {
        const today = new Date().toDateString();
        const { lastMatchDate, todayMatches } = get();
        
        if (lastMatchDate !== today) {
          set({ todayMatches: 1, lastMatchDate: today });
        } else {
          set({ todayMatches: todayMatches + 1 });
        }
      },
      resetMatches: () => set({ todayMatches: 0, lastMatchDate: new Date().toDateString() }),
      
      // Tutorial & Onboarding
      hasSeenTutorial: false,
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),
      onboardingCompleted: false,
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      
      // Discovery preferences
      discoveryMode: 'region',
      setDiscoveryMode: (mode) => set({ discoveryMode: mode }),
    }),
    {
      name: 'pawtes-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
