import { useState, useEffect } from "react";
import { X, Heart, Star, SlidersHorizontal, RotateCcw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { toast } from "sonner";
import { usePremium } from "@/hooks/usePremium";
import { useNavigate, useLocation } from "react-router-dom";
import { SwipeTutorial } from "@/components/ui/SwipeTutorial";
import { haptic } from "@/utils/haptic";
import { FiltersPanel, Filters } from "@/components/ui/FiltersPanel";
import { useAppStore } from "@/store/useAppStore";
import { regionProfiles, adoptionProfiles } from "@/config/profiles";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function Discover() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    todayMatches, 
    incrementMatches,
    hasSeenTutorial,
    setHasSeenTutorial,
    onboardingCompleted,
    discoveryMode,
    setDiscoveryMode
  } = useAppStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');
    const stateMode = (location.state as any)?.mode;
    const mode = urlMode || stateMode;
    
    if (mode && (mode === 'region' || mode === 'adoption')) {
      setDiscoveryMode(mode);
    }
  }, [location.search, location.state, setDiscoveryMode]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<string>("");
  const [history, setHistory] = useState<number[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    distance: 25,
    ages: [],
    sizes: [],
    temperaments: [],
    breeds: [],
  });

  const { session } = useAuth();
  const { data: isPremium } = usePremium();

  const profiles = discoveryMode === "region" ? regionProfiles : adoptionProfiles;
  const current = profiles[currentIndex];
  const photos = current ? [current.image, current.image, current.image] : [];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');
    const stateMode = (location.state as any)?.mode;
    
    if (urlMode || stateMode) {
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
      return;
    }
    
    if (!onboardingCompleted && !hasSeenTutorial) {
      navigate("/onboarding/welcome");
      return;
    }
    
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [navigate, hasSeenTutorial, onboardingCompleted, location.search, location.state]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const handleSwipe = async (liked: boolean, isSuperLike = false) => {
    if (!current) return;

    setHistory([...history, currentIndex]);
    
    if (liked || isSuperLike) {
      const isMatch = Math.random() > 0.5;
      
      if (isMatch) {
        setMatchedProfile(current.name);
        setShowMatch(true);
        incrementMatches();
        haptic.strong();
      } else {
        haptic.success();
      }
      
      toast.success(isSuperLike ? "✨ Super Like envoyé !" : "❤️ Like envoyé");
    } else {
      haptic.medium();
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleUndo = () => {
    if (!isPremium) {
      toast.error("Fonction réservée aux membres Premium");
      return;
    }

    if (history.length === 0) {
      toast.error("Plus rien à annuler");
      return;
    }

    const previousIndex = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentIndex(previousIndex);
    setCurrentPhotoIndex(0);
    haptic.light();
    toast.success("Profil précédent restauré");
  };

  const handleSuperLike = () => {
    if (!isPremium) {
      toast.error("Fonction réservée aux membres Premium");
      return;
    }

    setSwipeDirection("up");
    handleSwipe(true, true);
  };

  const handlePhotoTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isRightSide = x > rect.width / 2;

    if (isRightSide && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    } else if (!isRightSide && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: any) => {
    setDragOffset({ x: info.offset.x, y: info.offset.y });
    
    if (Math.abs(info.offset.x) > 50) {
      setSwipeDirection(info.offset.x > 0 ? "right" : "left");
    } else if (info.offset.y < -50) {
      setSwipeDirection("up");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    const threshold = 100;
    const velocityThreshold = 500;

    if ((info.offset.y < -threshold || info.velocity.y < -velocityThreshold) && isPremium) {
      setSwipeDirection("up");
      handleSwipe(true, true);
      return;
    }

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      setSwipeDirection("right");
      handleSwipe(true);
      return;
    }

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      setSwipeDirection("left");
      handleSwipe(false);
      return;
    }

    setSwipeDirection(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFiltersApply = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  if (!current) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">🐶</div>
          <h2 className="text-2xl font-bold text-foreground">Plus de duos proches pour le moment…</h2>
          <p className="text-muted-foreground">
            Reviens plus tard ou étends ton rayon de découverte !
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/events")} variant="default" size="lg">
              Voir les événements proches
            </Button>
            <Button onClick={() => setShowFilters(true)} variant="outline" size="lg">
              Élargir le rayon
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const rotation = dragOffset.x / 20;
  const labelOpacity = Math.min(1, Math.abs(dragOffset.x) / 100);

  return (
    <>
      <SwipeTutorial 
        show={showTutorial} 
        onClose={handleTutorialClose}
      />

      <FiltersPanel 
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersApply}
      />

      <MatchAnimation 
        show={showMatch}
        onComplete={() => setShowMatch(false)}
        matchedName={matchedProfile}
      />

      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/match")}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-sm font-medium text-foreground">
            {discoveryMode === "region" ? "Chiens près de toi" : "À adopter"}
          </div>

          <div className="flex gap-2">
            {isPremium && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pt-16 bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0 pt-16"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            exit={{ 
              x: swipeDirection === "left" ? -500 : swipeDirection === "right" ? 500 : 0,
              y: swipeDirection === "up" ? -500 : 0,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            style={{
              x: dragOffset.x,
              y: dragOffset.y,
              rotate: rotation,
            }}
          >
            <div 
              className="relative h-[calc(100vh-16rem)] w-full overflow-hidden rounded-b-3xl"
              onClick={handlePhotoTap}
            >
              <div className="absolute top-4 left-0 right-0 z-10 flex gap-2 px-4">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-1 rounded-full bg-white/30 backdrop-blur-sm overflow-hidden"
                  >
                    <div 
                      className={`h-full bg-white transition-all duration-300 ${
                        idx === currentPhotoIndex ? 'w-full' : idx < currentPhotoIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <img
                src={photos[currentPhotoIndex]}
                alt={current.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

              {swipeDirection === "right" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: labelOpacity, scale: 1 }}
                  className="absolute top-20 right-8 px-8 py-4 border-4 border-green-500 rounded-2xl rotate-12"
                >
                  <span className="text-3xl font-bold text-green-500 drop-shadow-lg">LIKE</span>
                </motion.div>
              )}
              
              {swipeDirection === "left" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: labelOpacity, scale: 1 }}
                  className="absolute top-20 left-8 px-8 py-4 border-4 border-red-500 rounded-2xl -rotate-12"
                >
                  <span className="text-3xl font-bold text-red-500 drop-shadow-lg">PASS</span>
                </motion.div>
              )}
              
              {swipeDirection === "up" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: labelOpacity, scale: 1 }}
                  className="absolute top-32 left-1/2 -translate-x-1/2 px-8 py-4 border-4 border-blue-400 rounded-2xl"
                >
                  <span className="text-3xl font-bold text-blue-400 drop-shadow-lg">⭐ SUPER LIKE</span>
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {current.name}, {current.age} ans
                </h2>
                <p className="text-sm text-muted-foreground">{current.breed}</p>
                {discoveryMode === "region" && (
                  <p className="text-sm text-muted-foreground">
                    Avec Camille (27)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>À 1,4 km</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {current.reasons.slice(0, 3).map((reason, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {reason}
                  </div>
                ))}
              </div>

              <p className="text-sm text-foreground line-clamp-2">
                {current.bio}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-50 flex items-center justify-center gap-6 px-8">
        <Button
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full bg-white shadow-xl border-2 hover:scale-110 transition-transform"
          onClick={() => {
            setSwipeDirection("left");
            handleSwipe(false);
          }}
        >
          <X className="h-7 w-7 text-red-500" />
        </Button>

        {isPremium && (
          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full bg-blue-400 shadow-xl border-2 border-blue-500 hover:scale-110 transition-transform -translate-y-2"
            onClick={handleSuperLike}
          >
            <Star className="h-6 w-6 text-white fill-white" />
          </Button>
        )}

        <Button
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full bg-white shadow-xl border-2 hover:scale-110 transition-transform"
          onClick={() => {
            setSwipeDirection("right");
            handleSwipe(true);
          }}
        >
          <Heart className="h-7 w-7 text-pink-500 fill-pink-500" />
        </Button>
      </div>
    </>
  );
}
