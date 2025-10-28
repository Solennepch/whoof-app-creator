import { useState, useEffect } from "react";
import { X, Heart, Info, Users } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";
import { MatchAnimation } from "@/components/match/MatchAnimation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AdoptionFollowUpDialog } from "@/components/adoption/AdoptionFollowUpDialog";
import { useAdoptionFollowUp } from "@/hooks/useAdoptionFollowUp";

const adoptionProfiles = [
  {
    name: "Luna",
    breed: "Labrador croisé",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop",
    bio: "Abandonnée mais pleine de vie ! Luna cherche une famille aimante pour recommencer une nouvelle vie 🌟",
    reasons: ["Affectueuse", "Calme", "Moyen gabarit"],
    shelter: "SPA Paris",
  },
  {
    name: "Max",
    breed: "Berger allemand",
    age: "5 ans",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=800&fit=crop",
    bio: "Fidèle et protecteur. Max a besoin d'un jardin et d'un maître expérimenté 🐕",
    reasons: ["Loyal", "Grand gabarit", "Éduqué"],
    shelter: "SPA Lyon",
  },
  {
    name: "Bella",
    breed: "Jack Russell",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop",
    bio: "Petite mais dynamique ! Bella adore jouer et a besoin d'activité quotidienne ⚡",
    reasons: ["Énergique", "Petit gabarit", "Joueuse"],
    shelter: "SPA Marseille",
  },
  {
    name: "Rocky",
    breed: "Bouledogue français",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&h=800&fit=crop",
    bio: "Adorable compagnon d'appartement. Rocky ronronne de bonheur ! 💤",
    reasons: ["Calme", "Compact", "Sociable"],
    shelter: "SPA Bordeaux",
  },
  {
    name: "Milo",
    breed: "Golden Retriever",
    age: "6 ans",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",
    bio: "Senior plein de sagesse et d'amour à donner. Milo mérite une retraite heureuse 🧡",
    reasons: ["Doux", "Senior", "Famille"],
    shelter: "SPA Toulouse",
  },
];

export default function DiscoverAdoption() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<string>("");
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const { pendingFollowUp, clearPendingFollowUp } = useAdoptionFollowUp();

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
    if (liked) {
      // Simulate match (higher chance for adoption)
      const isMatch = Math.random() > 0.5;
      if (isMatch) {
        // Save match to database
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

  if (!current) return null;

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
        
        {/* Global counter */}
        <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-10">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#FF5DA2]" />
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {totalMatches.toLocaleString()} matches
            </span>
          </div>
        </div>
        
        <div className="mx-auto max-w-2xl px-4 flex flex-col flex-1 pb-20">
          <div className="mb-3 text-center shrink-0">
            <h1 className="mb-1 text-2xl font-bold text-foreground">
              Adoption SPA
            </h1>
            <p className="text-sm text-muted-foreground">Swipe pour découvrir ton futur compagnon</p>
          </div>

          {/* Card Stack */}
          <div className="relative flex-1 min-h-0">
            <div
              className={`absolute inset-0 rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition-transform duration-300 ${
                direction === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" : ""
              } ${direction === "right" ? "translate-x-full rotate-[20deg] opacity-0" : ""}`}
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
          <div className="mt-3 mb-3 flex flex-wrap justify-center gap-1.5 shrink-0">
            {current.reasons.map((reason, i) => (
              <ReasonChip key={i} label={reason} />
            ))}
          </div>

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
            {currentIndex + 1} / {adoptionProfiles.length}
          </div>
        </div>
      </div>
    </>
  );
}
