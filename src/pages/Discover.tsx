import { useState, useEffect } from "react";
import { X, Heart, Info, Share2, Undo2, Star, SlidersHorizontal } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePremium } from "@/hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { PremiumBadge, PremiumTooltip } from "@/components/ui/PremiumBadge";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { MatchCounter } from "@/components/ui/MatchCounter";
import { SwipeTutorial } from "@/components/ui/SwipeTutorial";
import { haptic } from "@/utils/haptic";
import { FiltersPanel, Filters } from "@/components/ui/FiltersPanel";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useAppStore } from "@/store/useAppStore";
import { regionProfiles, adoptionProfiles, type RegionProfile, type AdoptionProfile } from "@/config/profiles";

export default function Discover() {
  const navigate = useNavigate();
  
  // Zustand store
  const { 
    todayMatches, 
    incrementMatches,
    hasSeenTutorial,
    setHasSeenTutorial,
    onboardingCompleted,
    discoveryMode,
    setDiscoveryMode
  } = useAppStore();
  
  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<string>("");
  const [history, setHistory] = useState<number[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    distance: 25,
    ages: [],
    sizes: [],
    temperaments: [],
    breeds: [],
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isPremium } = usePremium();

  const profiles = discoveryMode === "region" ? regionProfiles : adoptionProfiles;
  const current = profiles[currentIndex];
  
  // Swipe gestures hook
  const { 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd,
    getCardTransform,
    touchStart
  } = useSwipeGestures(
    () => handleSwipe(false), // left swipe
    () => handleSwipe(true)   // right swipe
  );

  // Show tutorial on first visit
  useEffect(() => {
    if (!onboardingCompleted && !hasSeenTutorial) {
      navigate("/onboarding/welcome");
      return;
    }
    
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [navigate, hasSeenTutorial, onboardingCompleted]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const handleModeChange = (newMode: "region" | "adoption") => {
    setDiscoveryMode(newMode);
    setCurrentIndex(0);
    setHistory([]);
    setDirection(null);
  };

  const handleFiltersApply = (newFilters: Filters) => {
    setFilters(newFilters);
    toast.success("Filtres appliqués");
    // In real app, refetch profiles with filters
  };

  const handleSwipe = async (liked: boolean) => {
    if (!session?.user?.id) {
      toast.error("Tu dois être connecté pour swiper");
      return;
    }

    // Haptic feedback for swipe
    haptic.medium();

    if (liked) {
      const isMatch = Math.random() > 0.7;
      if (isMatch) {
        setMatchedProfile(current.name);
        setShowMatch(true);
        incrementMatches();
        // Strong haptic for match
        haptic.strong();
        toast.success("+30 XP - C'est un match ! 🎉");
        return;
      }
    }
    
    setHistory([...history, currentIndex]);
    setDirection(liked ? "right" : "left");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 300);
  };

  const handleMatchComplete = () => {
    setShowMatch(false);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 300);
  };

  const handleUndo = () => {
    if (!isPremium) {
      toast.error("Cette fonctionnalité est réservée aux membres Premium");
      navigate("/premium");
      return;
    }

    if (history.length === 0) {
      toast.info("Aucun profil précédent");
      return;
    }

    const previousIndex = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentIndex(previousIndex);
    toast.success("Profil précédent");
  };

  const handleSuperLike = async () => {
    if (!isPremium) {
      toast.error("Cette fonctionnalité est réservée aux membres Premium");
      navigate("/premium");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Tu dois être connecté pour envoyer un super like");
      return;
    }

    toast.success("Super Like envoyé ! ⭐");
    setHistory([...history, currentIndex]);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 300);
  };

  const handleShare = async () => {
    if (!isPremium) {
      toast.error("Cette fonctionnalité est réservée aux membres Premium");
      navigate("/premium");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil de ${current.name}`,
          text: `Découvre ${current.name}, ${current.breed} de ${current.age} sur Whoof !`,
          url: window.location.href,
        });
        toast.success("Profil partagé !");
      } catch (error) {
        console.error("Erreur de partage:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    }
  };

  if (!current) return null;

  return (
    <>
      <SwipeTutorial show={showTutorial} onClose={handleTutorialClose} />
      <FiltersPanel show={showFilters} onClose={() => setShowFilters(false)} onApply={handleFiltersApply} />
      
      <MatchAnimation 
        show={showMatch} 
        onComplete={handleMatchComplete}
        matchedName={matchedProfile}
      />
      
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      {/* Header spacing */}
      <div className="h-16 shrink-0" />
      
      <div className="mx-auto max-w-2xl px-4 flex flex-col flex-1 pb-24">
        {/* Header with toggle and counter */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <ModeToggle mode={discoveryMode} onChange={handleModeChange} />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(true)}
              className="rounded-full h-10 w-10"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
            <MatchCounter count={todayMatches} />
          </div>
        </div>

        {/* Card Stack - Zone de swipe élargie (toute la carte) */}
        <div className="relative flex-1 min-h-0">
          <div
            className={`absolute inset-0 rounded-3xl bg-white shadow-soft ring-1 ring-black/5 cursor-grab active:cursor-grabbing ${
              direction ? "transition-transform duration-300" : ""
            } ${
              direction === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" : ""
            } ${direction === "right" ? "translate-x-full rotate-[20deg] opacity-0" : ""}`}
            style={!direction && touchStart ? { transform: getCardTransform() } : undefined}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="h-2/3 rounded-t-3xl bg-cover bg-center relative"
              style={{ backgroundImage: `url(${current.image})` }}
            >
              {discoveryMode === "adoption" && (current as AdoptionProfile).shelter && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-xs font-semibold text-foreground shadow-soft">
                  {(current as AdoptionProfile).shelter}
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {current.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {current.breed} • {current.age}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8"
                >
                  <Info className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-xs line-clamp-2 text-foreground/80">
                {current.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-2 mb-2 flex flex-wrap justify-center gap-1.5 shrink-0">
          {current.reasons.map((reason, i) => (
            <ReasonChip key={i} label={reason} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center gap-4 mb-1 shrink-0">
          {isPremium ? (
            <Button
              size="action"
              variant="ghost"
              onClick={handleUndo}
            >
              <Undo2 className="h-6 w-6" />
            </Button>
          ) : (
            <PremiumTooltip>
              <Button
                size="action"
                variant="premium"
                disabled
              >
                <Undo2 className="h-6 w-6" />
                <PremiumBadge className="absolute -top-2 -right-2 scale-75" />
              </Button>
            </PremiumTooltip>
          )}

          <Button
            size="action"
            variant="pass"
            onClick={() => handleSwipe(false)}
            className="h-16 w-16"
          >
            <X className="h-8 w-8" />
          </Button>

          {isPremium ? (
            <Button
              size="action"
              variant="superlike"
              onClick={handleSuperLike}
            >
              <Star className="h-6 w-6" fill="white" />
            </Button>
          ) : (
            <PremiumTooltip>
              <Button
                size="action"
                variant="premium"
                disabled
              >
                <Star className="h-6 w-6" />
                <PremiumBadge className="absolute -top-2 -right-2 scale-75" />
              </Button>
            </PremiumTooltip>
          )}

          <Button
            size="action"
            variant="like"
            onClick={() => handleSwipe(true)}
            className="h-16 w-16"
          >
            <Heart className="h-8 w-8" />
          </Button>

          {isPremium ? (
            <Button
              size="action"
              variant="ghost"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          ) : (
            <PremiumTooltip>
              <Button
                size="action"
                variant="premium"
                disabled
              >
                <Share2 className="h-6 w-6" />
                <PremiumBadge className="absolute -top-2 -right-2 scale-75" />
              </Button>
            </PremiumTooltip>
          )}
        </div>

        {/* Progress */}
        <div className="text-center text-xs text-muted-foreground pb-1 shrink-0">
          {currentIndex + 1} / {profiles.length}
        </div>
      </div>
    </div>
    </>
  );
}
