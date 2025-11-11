import { useState, useEffect } from "react";
import { X, Heart, Info, Users, Share2, Undo2, Star } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AdoptionFollowUpDialog } from "@/components/adoption/AdoptionFollowUpDialog";
import { useAdoptionFollowUp } from "@/hooks/useAdoptionFollowUp";
import { usePremium } from "@/hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { PremiumBadge, PremiumTooltip } from "@/components/ui/PremiumBadge";
import { haptic } from "@/utils/haptic";

const adoptionProfiles = [
  {
    name: "Luna",
    breed: "Labrador croisé",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop",
    bio: "Abandonnée mais pleine de vie ! Luna cherche une famille aimante pour recommencer une nouvelle vie 🌟",
    reasons: ["Affectueuse", "Calme", "Moyen gabarit", "Compatible enfants", "Coup de cœur"],
    shelter: "SPA Paris",
  },
  {
    name: "Max",
    breed: "Berger allemand",
    age: "5 ans",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=800&fit=crop",
    bio: "Fidèle et protecteur. Max a besoin d'un jardin et d'un maître expérimenté 🐕",
    reasons: ["Loyal", "Grand gabarit", "Besoin d'espace", "Sportif", "À l'adoption"],
    shelter: "SPA Lyon",
  },
  {
    name: "Bella",
    breed: "Jack Russell",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop",
    bio: "Petite mais dynamique ! Bella adore jouer et a besoin d'activité quotidienne ⚡",
    reasons: ["Énergique", "Petit gabarit", "Joueuse", "Aime les balades", "Recommandé"],
    shelter: "SPA Marseille",
  },
  {
    name: "Rocky",
    breed: "Bouledogue français",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&h=800&fit=crop",
    bio: "Adorable compagnon d'appartement. Rocky ronronne de bonheur ! 💤",
    reasons: ["Calme", "Compact", "Sociable", "OK appartement", "SPA"],
    shelter: "SPA Bordeaux",
  },
  {
    name: "Milo",
    breed: "Golden Retriever",
    age: "6 ans",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",
    bio: "Senior plein de sagesse et d'amour à donner. Milo mérite une retraite heureuse 🧡",
    reasons: ["Doux", "Très grand", "Compatible chats", "Jardin idéal", "En sauvetage"],
    shelter: "SPA Toulouse",
  },
];

export default function DiscoverAdoption() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<string>("");
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const { pendingFollowUp, clearPendingFollowUp } = useAdoptionFollowUp();
  const navigate = useNavigate();

  const { data: isPremium } = usePremium();

  const current = adoptionProfiles[currentIndex];

  // Fetch total adoption matches counter
  useEffect(() => {
    fetchTotalMatches();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('adoption-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'adoption_stats'
        },
        (payload) => {
          if (payload.new && 'total_matches' in payload.new) {
            setTotalMatches(payload.new.total_matches as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTotalMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("adoption_stats")
        .select("total_matches")
        .single();

      if (error) throw error;
      setTotalMatches(data.total_matches);
    } catch (error) {
      console.error("Error fetching adoption stats:", error);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    // Haptic feedback for swipe
    haptic.medium();
    
    if (liked) {
      const isMatch = Math.random() > 0.5;
      if (isMatch) {
        // Strong haptic for match
        haptic.strong();
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from("adoption_matches")
              .insert({
                user_id: user.id,
                dog_name: current.name,
              });

            if (error) {
              console.error("Error saving adoption match:", error);
            }
          }
        } catch (error) {
          console.error("Error in handleSwipe:", error);
        }

        setMatchedProfile(current.name);
        setShowMatch(true);
        return;
      }
    }
    
    setHistory([...history, currentIndex]);
    setDirection(liked ? "right" : "left");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % adoptionProfiles.length);
      setDirection(null);
    }, 300);
  };

  const handleMatchComplete = () => {
    setShowMatch(false);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % adoptionProfiles.length);
      setDirection(null);
    }, 300);
  };

  const handleUndo = () => {
    if (!isPremium) {
      toast({
        title: "Premium requis",
        description: "Cette fonctionnalité est réservée aux membres Premium",
        variant: "destructive"
      });
      navigate("/premium");
      return;
    }

    if (history.length === 0) {
      toast({
        title: "Aucun profil précédent",
        description: "Il n'y a pas de profil à revoir"
      });
      return;
    }

    const previousIndex = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentIndex(previousIndex);
    toast({
      title: "Profil précédent",
      description: "Retour au profil précédent"
    });
  };

  const handleSuperLike = async () => {
    if (!isPremium) {
      toast({
        title: "Premium requis",
        description: "Cette fonctionnalité est réservée aux membres Premium",
        variant: "destructive"
      });
      navigate("/premium");
      return;
    }

    toast({
      title: "Super Like envoyé ! ⭐",
      description: "Ton super like a été envoyé"
    });
    setHistory([...history, currentIndex]);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % adoptionProfiles.length);
      setDirection(null);
    }, 300);
  };

  const handleShare = async () => {
    if (!isPremium) {
      toast({
        title: "Premium requis",
        description: "Cette fonctionnalité est réservée aux membres Premium",
        variant: "destructive"
      });
      navigate("/premium");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil d'adoption de ${current.name}`,
          text: `Découvre ${current.name}, ${current.breed} de ${current.age} disponible à l'adoption sur Whoof !`,
          url: window.location.href,
        });
        toast({
          title: "Profil partagé !",
          description: "Le profil a été partagé avec succès"
        });
      } catch (error) {
        console.error("Erreur de partage:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papier"
      });
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

      {pendingFollowUp && (
        <AdoptionFollowUpDialog
          open={true}
          onClose={clearPendingFollowUp}
          dogName={pendingFollowUp.dog_name}
          matchId={pendingFollowUp.id}
        />
      )}
      
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        {/* Header spacing to avoid overlap with sticky header */}
        <div className="h-16 shrink-0" />
        
        <div className="mx-auto max-w-2xl px-4 flex flex-col flex-1 pb-24">
          <div className="mb-2 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-foreground">
                Adoption SPA
              </h1>
              {/* Global counter */}
              <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-[#FF5DA2]" />
                  <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: "var(--ink)" }}>
                    {totalMatches.toLocaleString()} contacts
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Swipe pour découvrir ton futur compagnon</p>
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
                className="h-2/3 rounded-t-3xl bg-cover bg-center relative"
                style={{ backgroundImage: `url(${current.image})` }}
              >
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <p className="text-xs font-semibold" style={{ color: "var(--brand-raspberry)" }}>
                    {current.shelter}
                  </p>
                </div>
              </div>

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
            {currentIndex + 1} / {adoptionProfiles.length}
          </div>
        </div>
      </div>
    </>
  );
}
