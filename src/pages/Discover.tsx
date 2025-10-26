import { useState } from "react";
import { X, Heart, Info } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";

const profiles = [
  {
    name: "Charlie",
    breed: "Corgi",
    age: "1 an",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&h=800&fit=crop",
    bio: "Petit mais plein d'énergie ! J'adore courir et jouer avec mes amis 🦴",
    reasons: ["Jeune", "Énergique", "Petit gabarit"],
  },
  {
    name: "Daisy",
    breed: "Beagle",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=800&fit=crop",
    bio: "Curieuse et affectueuse, toujours prête pour de nouvelles aventures ! 🌼",
    reasons: ["Affectueux", "Moyen gabarit", "Sociable"],
  },
  {
    name: "Zeus",
    breed: "Doberman",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop",
    bio: "Élégant et protecteur. Cherche des compagnons pour des balades urbaines 🏙️",
    reasons: ["Grand", "Élégant", "Urbain"],
  },
];

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const current = profiles[currentIndex];

  const handleSwipe = (liked: boolean) => {
    setDirection(liked ? "right" : "left");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 300);
  };

  if (!current) return null;

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: "var(--paper)" }}>
      {/* Header spacing to avoid overlap with sticky header */}
      <div className="h-20" />
      
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--ink)" }}>
            Découvrir
          </h1>
          <p className="text-muted-foreground">Swipe pour matcher avec de nouveaux amis</p>
        </div>

        {/* Card Stack */}
        <div className="relative aspect-[3/4] max-h-[600px]">
          <div
            className={`absolute inset-0 rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition-transform duration-300 ${
              direction === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" : ""
            } ${direction === "right" ? "translate-x-full rotate-[20deg] opacity-0" : ""}`}
          >
            <div
              className="h-2/3 rounded-t-3xl bg-cover bg-center"
              style={{ backgroundImage: `url(${current.image})` }}
            />

            <div className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
                    {current.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {current.breed} • {current.age}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm" style={{ color: "var(--ink)", opacity: 0.8 }}>
                {current.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tags with more spacing */}
        <div className="mt-6 mb-8 flex flex-wrap justify-center gap-2">
          {current.reasons.map((reason, i) => (
            <ReasonChip key={i} label={reason} />
          ))}
        </div>

        {/* Actions with better spacing */}
        <div className="flex justify-center gap-6 mb-6">
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full shadow-soft"
            onClick={() => handleSwipe(false)}
          >
            <X className="h-6 w-6" style={{ color: "var(--ink)", opacity: 0.6 }} />
          </Button>

          <Button
            size="lg"
            className="h-20 w-20 rounded-full shadow-soft"
            style={{ backgroundColor: "var(--brand-raspberry)" }}
            onClick={() => handleSwipe(true)}
          >
            <Heart className="h-7 w-7 text-white" />
          </Button>
        </div>

        {/* Progress */}
        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} / {profiles.length}
        </div>
      </div>
    </div>
  );
}
