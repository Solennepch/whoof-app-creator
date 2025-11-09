import { useState } from "react";
import { X, Heart, Info } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<string>("");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const current = profiles[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    if (!session?.user?.id) {
      toast.error("Tu dois être connecté pour swiper");
      return;
    }

    // In a real app, we would call the swipe edge function here
    // For now, simulate the behavior
    if (liked) {
      // Simulate match (30% chance)
      const isMatch = Math.random() > 0.7;
      if (isMatch) {
        setMatchedProfile(current.name);
        setShowMatch(true);
        toast.success("+30 XP - C'est un match ! 🎉");
        return;
      }
    }
    
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

  if (!current) return null;

  return (
    <>
      <MatchAnimation 
        show={showMatch} 
        onComplete={handleMatchComplete}
        matchedName={matchedProfile}
      />
      
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      {/* Header spacing to avoid overlap with sticky header */}
      <div className="h-16 shrink-0" />
      
      <div className="mx-auto max-w-2xl px-4 flex flex-col flex-1 pb-20">
        <div className="relative pt-5 pb-3 text-center shrink-0 discover-hero">
          {/* Subtle paw pattern background */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, hsl(var(--brand-violet-woof)) 0%, transparent 70%)'
            }}
          />
          
          <div className="relative mx-auto" style={{ maxWidth: '290px' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 mb-2 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ fontSize: '12px', color: 'hsl(var(--brand-violet-woof))' }}>
                🎯 Match
              </span>
            </div>
            
            {/* Title */}
            <h1 className="mb-1.5 font-bold text-foreground leading-tight" style={{ fontSize: '25px' }}>
              Découvrir
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm text-muted-foreground mb-2">
              Swipe pour matcher avec de nouveaux amis
            </p>
            
            {/* Mini label */}
            <p className="text-xs tracking-wide" style={{ fontSize: '12px', color: 'hsl(var(--brand-violet-woof))', opacity: 0.7 }}>
              Choisis une aventure 👇
            </p>
          </div>
        </div>

        {/* Card Stack */}
        <div className="relative flex-1 min-h-0 mt-3">
          <div
            className={`absolute inset-0 rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition-transform duration-300 ${
              direction === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" : ""
            } ${direction === "right" ? "translate-x-full rotate-[20deg] opacity-0" : ""}`}
          >
            <div
              className="h-2/3 rounded-t-3xl bg-cover bg-center"
              style={{ backgroundImage: `url(${current.image})` }}
            />

            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
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

              <p className="text-xs line-clamp-2" style={{ color: "var(--ink)", opacity: 0.8 }}>
                {current.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 mb-3 flex flex-wrap justify-center gap-1.5 shrink-0">
          {current.reasons.map((reason, i) => (
            <ReasonChip key={i} label={reason} />
          ))}
        </div>

        {/* CTA Label */}
        <div className="cta-label"></div>

        {/* Actions */}
        <div className="flex justify-center items-center gap-4 mb-2 shrink-0">
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full shadow-soft"
            onClick={() => handleSwipe(false)}
          >
            <X className="h-7 w-7" style={{ color: "var(--ink)", opacity: 0.6 }} />
          </Button>

          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-soft bg-[#FF5DA2] hover:bg-[#FF5DA2]/90"
            onClick={() => handleSwipe(true)}
          >
            <Heart className="h-8 w-8 text-white fill-white" />
          </Button>
        </div>

        {/* Progress */}
        <div className="text-center text-xs text-muted-foreground pb-2 shrink-0">
          {currentIndex + 1} / {profiles.length}
        </div>
      </div>
    </div>
    </>
  );
}
