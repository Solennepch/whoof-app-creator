import { useState } from "react";
import { X, Heart, Info, Share2, Undo2, Star } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePremium } from "@/hooks/usePremium";
import { useNavigate } from "react-router-dom";

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
  const [history, setHistory] = useState<number[]>([]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isPremium } = usePremium();

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) return;

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = Math.abs(touchCurrent.y - touchStart.y);

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        handleSwipe(true); // Right swipe = like
      } else {
        handleSwipe(false); // Left swipe = pass
      }
    }

    setTouchStart(null);
    setTouchCurrent(null);
  };

  if (!current) return null;

  const getCardTransform = () => {
    if (!touchStart || !touchCurrent) return "";
    const deltaX = touchCurrent.x - touchStart.x;
    const rotate = deltaX / 20;
    return `translateX(${deltaX}px) rotate(${rotate}deg)`;
  };

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
      
      <div className="mx-auto max-w-2xl px-4 flex flex-col flex-1 pb-24">
        <div className="mb-2 text-center shrink-0">
          <h1 className="mb-0.5 text-xl font-bold text-foreground">
            Découvrir
          </h1>
          <p className="text-xs text-muted-foreground">Swipe pour matcher avec de nouveaux amis</p>
        </div>

        {/* Card Stack */}
        <div className="relative flex-1 min-h-0">
          <div
            className={`absolute inset-0 rounded-3xl bg-white shadow-soft ring-1 ring-black/5 ${
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
        <div className="mt-2 mb-2 flex flex-wrap justify-center gap-1.5 shrink-0">
          {current.reasons.map((reason, i) => (
            <ReasonChip key={i} label={reason} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center gap-4 mb-1 shrink-0">
          <Button
            size="lg"
            variant="outline"
            className={`h-14 w-14 rounded-full shadow-soft ${!isPremium ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={handleUndo}
            disabled={!isPremium}
          >
            <Undo2 className="h-6 w-6" style={{ color: isPremium ? "var(--ink)" : "#9CA3AF" }} />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full shadow-soft"
            onClick={() => handleSwipe(false)}
          >
            <X className="h-8 w-8" style={{ color: "var(--ink)", opacity: 0.6 }} />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className={`h-14 w-14 rounded-full shadow-soft ${!isPremium ? 'opacity-40 cursor-not-allowed' : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-0'}`}
            onClick={handleSuperLike}
            disabled={!isPremium}
          >
            <Star className="h-6 w-6" style={{ color: isPremium ? "white" : "#9CA3AF" }} fill={isPremium ? "white" : "none"} />
          </Button>

          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-soft bg-[#FF5DA2] hover:bg-[#FF5DA2]/90"
            onClick={() => handleSwipe(true)}
          >
            <Heart className="h-8 w-8 text-white fill-white" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className={`h-14 w-14 rounded-full shadow-soft ${!isPremium ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={handleShare}
            disabled={!isPremium}
          >
            <Share2 className="h-6 w-6" style={{ color: isPremium ? "var(--ink)" : "#9CA3AF" }} />
          </Button>
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
