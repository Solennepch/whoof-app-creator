import { useState } from "react";
import { ArrowLeft, Filter, ArrowUp, RotateCcw, Star, Heart, Send } from "lucide-react";

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

  const handleSwipeLeft = () => handleNope();
  const handleSwipeRight = () => handleLike();
  const handleSwipeUp = () => handleOpenProfile();

  if (!hasMore || !currentDog) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
        <h2 className="text-2xl font-bold mb-4">Plus de profils pour le moment</h2>
        <p className="text-center text-muted-foreground">
          {mode === "local"
            ? "Reviens plus tard, de nouveaux chiens sortent bientôt se promener 🐾"
            : "Tous les profils ont été vus. Merci de soutenir l'adoption responsable 💚"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-black text-white">
      {/* Top bar */}
      <div className="safe-top flex items-center justify-between px-4 py-3 z-20">
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {mode === "local" ? "Chiens près de toi" : "Adopte ton compagnon"}
        </h1>
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Main card area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Full screen photo */}
        <img
          src={currentDog.photoUrl}
          alt={currentDog.name}
          className="w-full h-full object-cover absolute inset-0"
        />

        {/* Bottom gradient overlay with info */}
        <div className="absolute inset-x-0 bottom-0 pt-24 pb-40 px-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="text-left">
            <h2 className="text-4xl font-bold mb-2">
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
                    className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur"
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
          className="absolute right-6 bottom-48 w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center"
        >
          <ArrowUp className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Bottom buttons row (Tinder style) */}
      <div className="absolute inset-x-0 bottom-4 flex items-end justify-center gap-4 px-4">
        {/* Rewind */}
        <button
          onClick={handleRewind}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5 text-yellow-500" />
        </button>

        {/* Nope - Dog bones crossed */}
        <button
          onClick={handleNope}
          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center"
        >
          <DogBonesCrossIcon className="w-7 h-7 text-red-500" />
        </button>

        {/* Super-like - positioned slightly higher */}
        <button
          onClick={handleSuperLike}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center mb-4"
        >
          <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
        </button>

        {/* Like */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center"
        >
          <Heart className="w-7 h-7 text-green-500 fill-green-500" />
        </button>

        {/* Boost / Send */}
        <button
          onClick={handleBoost}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center"
        >
          <Send className="w-5 h-5 text-purple-500" />
        </button>
      </div>
    </div>
  );
}

// Demo wrapper with mocked data
export function DemoDogMatchingScreen() {
  const mockDogs: DogProfile[] = [
    {
      id: "1",
      name: "Ruby",
      age: 2,
      distanceKm: 1.4,
      photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      shortDescription: "chien sociable",
      badges: ["Énergique", "Sociable", "Joueur"],
    },
    {
      id: "2",
      name: "Max",
      age: 4,
      shelterName: "SPA de Paris",
      photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
      shortDescription: "prêt à être adopté",
      badges: ["Calme", "Affectueux", "Bon avec enfants"],
    },
    {
      id: "3",
      name: "Luna",
      age: 3,
      distanceKm: 2.8,
      photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
      shortDescription: "adore les balades",
      badges: ["Curieuse", "Active", "Gentille"],
    },
  ];

  return <DogMatchingScreen mode="local" dogs={mockDogs} />;
}
