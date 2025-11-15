import { useState } from "react";
import { Filter, ArrowUp, RotateCcw, Star, Heart, Send } from "lucide-react";

type DogProfile = {
  id: string;
  name: string;
  age: number;
  distanceKm?: number;
  shelterName?: string;
  photoUrl: string;
  shortDescription: string;
  badges?: string[];
};

interface DogMatchingScreenProps {
  mode: "local" | "adoption";
  dogs: DogProfile[];
}

// Custom SVG for crossed dog bones
const DogBonesCrossIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* First bone - rotated 45deg */}
    <g transform="rotate(45 12 12)">
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <rect x="9" y="11" width="6" height="2" />
    </g>
    {/* Second bone - rotated -45deg */}
    <g transform="rotate(-45 12 12)">
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <rect x="9" y="11" width="6" height="2" />
    </g>
  </svg>
);

export default function DogMatchingScreen({ mode, dogs }: DogMatchingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDog = dogs[currentIndex];
  const hasMore = currentIndex < dogs.length;

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNope = () => {
    console.log("nope");
    setCurrentIndex(currentIndex + 1);
  };

  const handleSuperLike = () => {
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
      <div className="flex items-center justify-between px-4 py-3 gradient-hero border-b flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">
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

        {/* Bottom gradient overlay with info */}
        <div className="absolute inset-x-0 bottom-0 pt-24 pb-6 px-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="text-left">
            <h2 className="text-4xl font-bold mb-2 text-white">
              {currentDog.name}, {currentDog.age} ans
            </h2>
            <p className="text-lg text-white/90 mb-3">
              {mode === "local" && currentDog.distanceKm
                ? `à ${currentDog.distanceKm} km • ${currentDog.shortDescription}`
                : `${currentDog.shelterName} • ${currentDog.shortDescription}`}
            </p>
            {currentDog.badges && (
              <div className="flex flex-wrap gap-2">
                {currentDog.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating profile button */}
        <button
          onClick={handleOpenProfile}
          className="absolute right-4 bottom-6 z-10 w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center"
        >
          <ArrowUp className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Swipe buttons - fixed at bottom above global footer */}
      <div className="flex-shrink-0 py-4 flex justify-center gap-4 px-4 gradient-hero">
        {/* Rewind */}
        <button
          onClick={handleRewind}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300"
        >
          <RotateCcw className="w-5 h-5 text-yellow-500" />
        </button>

        {/* Nope - Dog bones crossed */}
        <button
          onClick={handleNope}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center"
        >
          <DogBonesCrossIcon className="w-7 h-7 text-red-500" />
        </button>

        {/* Super-like - positioned slightly higher */}
        <button
          onClick={handleSuperLike}
          className="w-12 h-12 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center -mt-4"
        >
          <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
        </button>

        {/* Like */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center"
        >
          <Heart className="w-7 h-7 text-green-500 fill-green-500" />
        </button>

        {/* Boost / Send */}
        <button
          onClick={handleBoost}
          className="w-12 h-12 rounded-full bg-white backdrop-blur shadow-lg flex items-center justify-center"
        >
          <Send className="w-5 h-5 text-purple-500" />
        </button>
      </div>
    </div>
  );
}
