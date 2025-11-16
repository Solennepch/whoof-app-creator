import { useState } from "react";
import { Filter, ArrowUp, RotateCcw, Star, Heart, Send, Lock } from "lucide-react";
import bonesCrossedIcon from "@/assets/bones-crossed.png";
import { TagChip } from "@/components/ui/TagChip";
import { usePremium } from "@/hooks/usePremium";
import { PremiumDialog } from "@/components/PremiumDialog";

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
  const { data: isPremium = false } = usePremium();

  const currentDog = dogs[currentIndex];
  const hasMore = currentIndex < dogs.length;

  const handleRewind = () => {
    if (!isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNope = () => {
    console.log("nope");
    setCurrentIndex(currentIndex + 1);
  };

  const handleSuperLike = () => {
    if (!isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    console.log("super-like");
    setCurrentIndex(currentIndex + 1);
  };

  const handleLike = () => {
    console.log("like");
    setCurrentIndex(currentIndex + 1);
  };

  const handleBoost = () => {
    alert("Envoyer une invitation / contacter");
  };

  const handleOpenProfile = () => {
    alert("Open dog profile");
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
        <button className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center">
          <Filter className="w-5 h-5 text-foreground" />
        </button>
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
          disabled={!isPremium}
          className={`w-12 h-12 rounded-full backdrop-blur shadow-lg flex items-center justify-center transition-all ${
            isPremium
              ? "bg-white hover:scale-105"
              : "bg-gray-200 opacity-50 cursor-not-allowed"
          }`}
        >
          {isPremium ? (
            <RotateCcw className="w-5 h-5 text-yellow-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Nope - Dog bones crossed - Always active */}
        <button
          onClick={handleNope}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <img src={bonesCrossedIcon} alt="Nope" className="w-10 h-10" />
        </button>

        {/* Super-like - Premium only - positioned higher to bridge sections */}
        <button
          onClick={handleSuperLike}
          disabled={!isPremium}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center -mt-8 transition-all ${
            isPremium
              ? "gradient-hero hover:scale-105"
              : "bg-gray-200 opacity-50 cursor-not-allowed"
          }`}
        >
          {isPremium ? (
            <Star className="w-6 h-6 text-white fill-white" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Like - Always active */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Heart className="w-7 h-7 text-green-500 fill-green-500" />
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
    </div>
  );
}
