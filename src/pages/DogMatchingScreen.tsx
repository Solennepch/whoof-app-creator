import { useState } from "react";
import { Filter, RotateCcw, Star, Heart, Send } from "lucide-react";
import bonesCrossedIcon from "@/assets/bones-crossed.png";
import { TagChip } from "@/components/ui/TagChip";
import { usePremium } from "@/hooks/usePremium";
import { PremiumDialog } from "@/components/PremiumDialog";
import { FiltersPanel, Filters } from "@/components/ui/FiltersPanel";
import { SuperLikeAnimation } from "@/components/match/SuperLikeAnimation";
import { MatchCounter } from "@/components/ui/MatchCounter";
import { toast } from "sonner";

type DogProfile = {
  id: string;
  name: string;
  age: number;
  distanceKm?: number;
  shelterName?: string;
  photoUrl: string;
  shortDescription: string;
  badges?: string[];
  ownerName?: string;
};

interface DogMatchingScreenProps {
  mode: "local" | "adoption";
  dogs: DogProfile[];
}

export default function DogMatchingScreen({ mode, dogs }: DogMatchingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuperLikeAnimation, setShowSuperLikeAnimation] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [adoptionMatchCount, setAdoptionMatchCount] = useState(0);
  const [weeklySuperlikes, setWeeklySuperlikes] = useState(() => {
    const stored = localStorage.getItem('weeklySuperlikes');
    if (!stored) return { count: 0, weekStart: new Date().toISOString() };
    const data = JSON.parse(stored);
    // Reset if it's a new week
    const weekStart = new Date(data.weekStart);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceStart >= 7) {
      return { count: 0, weekStart: now.toISOString() };
    }
    return data;
  });
  const { data: isPremium = false } = usePremium();

  const currentDog = dogs[currentIndex];
  const hasMore = currentIndex < dogs.length;
  const canUseSuperlike = isPremium || weeklySuperlikes.count < 1;
  const hasHistory = history.length > 0;

  const handleRewind = () => {
    if (!isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    if (history.length === 0) {
      toast.info("Aucun profil précédent");
      return;
    }
    const previousIndex = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentIndex(previousIndex);
    toast.success("Retour au profil précédent");
  };

  const handleNope = () => {
    setHistory([...history, currentIndex]);
    setCurrentIndex(currentIndex + 1);
  };

  const handleSuperLike = () => {
    if (!canUseSuperlike) {
      setShowPremiumDialog(true);
      return;
    }
    
    // Show animation
    setShowSuperLikeAnimation(true);
    
    // Increment superlike count for non-premium users
    if (!isPremium) {
      const newData = { ...weeklySuperlikes, count: weeklySuperlikes.count + 1 };
      setWeeklySuperlikes(newData);
      localStorage.setItem('weeklySuperlikes', JSON.stringify(newData));
    }
    
    // TODO: Store super like in database
    console.log("Super Like envoyé à", currentDog.name);
    
    setHistory([...history, currentIndex]);
    setCurrentIndex(currentIndex + 1);
  };

  const handleLike = () => {
    if (mode === "adoption") {
      setAdoptionMatchCount(prev => prev + 1);
      // TODO: Rediriger vers la page SPA correspondante
      toast.success(`Tu seras bientôt redirigé vers la SPA de ${currentDog.name}`);
      console.log("Redirection vers SPA:", currentDog.shelterName);
    } else {
      toast.success(`❤️ Like envoyé à ${currentDog.name}`);
    }
    setHistory([...history, currentIndex]);
    setCurrentIndex(currentIndex + 1);
  };

  const handleBoost = () => {
    toast.info("Invitation envoyée !");
    // TODO: Implement invitation logic
  };

  const handleOpenProfile = () => {
    alert("Open dog profile");
  };

  const handleApplyFilters = (filters: Filters) => {
    console.log("Filtres appliqués:", filters);
    // TODO: Appliquer les filtres à la liste des chiens
  };

  if (!hasMore || !currentDog) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background text-foreground p-6 min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">
          {mode === "local" ? "Plus de profils près de toi 🐾" : "Tu as vu tous les profils 💚"}
        </h2>
        <p className="text-center text-muted-foreground">
          {mode === "local"
            ? "Reviens bientôt, de nouveaux chiens sortent se promener tous les jours !"
            : "Merci de soutenir l'adoption responsable. De nouveaux chiens arrivent régulièrement, repasse nous voir."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-8rem)]">
      {/* Local discover toolbar with filter */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
      >
        <h2 className="text-lg font-bold text-gradient font-poppins">
          {mode === "local" ? "Chiens près de toi" : "Adopte ton compagnon"}
        </h2>
        <div className="flex items-center gap-2">
          {mode === "adoption" && (
            <MatchCounter 
              count={adoptionMatchCount} 
              label="Mises en relation"
              showTrending={false}
            />
          )}
          <button 
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center"
          >
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Dog card area - takes remaining space */}
      <div className="relative flex-1 min-h-[400px] bg-black">
        {/* Full-width dog image */}
        <img
          src={currentDog.photoUrl}
          alt={currentDog.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Tags at the top center */}
        {currentDog.badges && (
          <div className="absolute top-4 inset-x-0 flex justify-center px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {currentDog.badges.map((badge, idx) => (
                <TagChip key={idx} label={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom gradient overlay with info */}
        <div className="absolute inset-x-0 bottom-0 pt-20 pb-6 px-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="text-left backdrop-blur-md bg-black/20 rounded-lg p-4">
            <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-2xl">
              {currentDog.name}{currentDog.ownerName && ` & ${currentDog.ownerName}`}
            </h2>
            <p className="text-lg text-white/95 drop-shadow-lg">
              {mode === "local" && currentDog.distanceKm
                ? `à ${currentDog.distanceKm} km • ${currentDog.shortDescription}`
                : `${currentDog.shelterName} • ${currentDog.shortDescription}`}
            </p>
          </div>
        </div>

      </div>

      {/* Swipe buttons - fixed at bottom above global footer */}
      <div 
        className="relative z-20 flex-shrink-0 py-4 flex justify-center gap-4 px-4 -mt-8"
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
      >
        {/* Rewind - Premium only */}
        <button
          onClick={handleRewind}
          className={`w-12 h-12 rounded-full backdrop-blur shadow-lg flex items-center justify-center transition-all ${
            isPremium
              ? "bg-white hover:scale-105 cursor-pointer"
              : "bg-gray-200 opacity-50 cursor-not-allowed"
          }`}
        >
          <RotateCcw className={`w-5 h-5 ${isPremium ? "text-yellow-500" : "text-gray-400"}`} />
        </button>

        {/* Nope - Dog bones crossed - Always active */}
        <button
          onClick={handleNope}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <img src={bonesCrossedIcon} alt="Nope" className="w-8 h-8" />
        </button>

        {/* Super-like - Only in local mode */}
        {mode === "local" && (
          <button
            onClick={handleSuperLike}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center -mt-8 transition-all ${
              canUseSuperlike
                ? "gradient-hero hover:scale-105"
                : "bg-gray-200 opacity-50 cursor-pointer"
            }`}
          >
            <Star className={`w-6 h-6 ${canUseSuperlike ? "text-white fill-white" : "text-gray-400 fill-gray-400"}`} />
          </button>
        )}

        {/* Like / SPA button */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          {mode === "adoption" ? (
            <div className="relative flex items-center justify-center">
              <Heart 
                className="w-10 h-10" 
                style={{
                  fill: '#FF1493',
                  stroke: '#FF1493'
                }}
              />
              <span className="absolute text-xs font-bold text-white">SPA</span>
            </div>
          ) : (
            <Heart 
              className="w-8 h-8" 
              style={{
                fill: '#FF1493',
                stroke: '#FF1493'
              }}
            />
          )}
        </button>

        {/* Boost / Send - Always active */}
        <button
          onClick={handleBoost}
          className="w-12 h-12 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5 text-purple-500" />
        </button>
      </div>

      <PremiumDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
      <SuperLikeAnimation 
        show={showSuperLikeAnimation} 
        onComplete={() => setShowSuperLikeAnimation(false)}
        dogName={currentDog?.name}
      />
      <FiltersPanel 
        show={showFilters} 
        onClose={() => setShowFilters(false)} 
        onApply={handleApplyFilters}
      />
    </div>
  );
}
