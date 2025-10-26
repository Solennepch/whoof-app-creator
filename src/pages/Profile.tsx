import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DogCarousel } from "@/components/profile/DogCarousel";
import { OwnerSection } from "@/components/profile/OwnerSection";
import { XpProgress } from "@/components/ui/XpProgress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const badges = [
  { icon: "🦴", name: "Premier pas", desc: "Créé ton profil" },
  { icon: "❤️", name: "Sociable", desc: "10 matchs" },
  { icon: "⭐", name: "Star", desc: "50 likes reçus" },
  { icon: "🎾", name: "Joueur", desc: "5 événements" },
];

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age_years?: number;
  birthdate?: string;
  temperament?: string;
  size?: string;
  avatar_url?: string;
  vaccination?: any;
  anecdote?: string;
  zodiac_sign?: string;
}

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  birth_date?: string;
  bio?: string;
  gender?: string;
  relationship_status?: string;
  interests?: string[];
  verified?: boolean;
}

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) {
        setError("ID de profil manquant");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // Not authenticated, redirect to login
          navigate('/login');
          return;
        }

        let targetUserId: string;

        // Determine which profile to fetch
        if (id === 'me' || !isValidUUID(id)) {
          // Fetch current user's profile
          targetUserId = user.id;
          setIsOwner(true);
        } else {
          // Fetch specific user's profile by UUID
          targetUserId = id;
          setIsOwner(user.id === id);
        }

        // Fetch profile directly from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No rows returned - profile not found
            setError("Profil non trouvé");
          } else {
            throw profileError;
          }
          setIsLoading(false);
          return;
        }

        if (!profileData) {
          setError("Profil non trouvé");
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch dogs for this user via direct table query
        const { data: dogsData, error: dogsError } = await supabase
          .from('dogs')
          .select('*')
          .eq('owner_id', targetUserId);

        if (dogsError) {
          console.error('Error fetching dogs:', dogsError);
          // Don't fail the whole page if dogs fail to load
        } else {
          setDogs(dogsData || []);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            navigate('/login');
            return;
          }
          setError(error.message);
        } else {
          setError("Une erreur est survenue lors du chargement du profil");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [id, navigate]);

  const handleLike = () => {
    toast({
      title: "Like envoyé ❤️",
      description: "Votre intérêt a été envoyé avec succès",
    });
  };

  const handleMessage = () => {
    toast({
      title: "Message",
      description: "Fonctionnalité de messagerie bientôt disponible",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🐕</div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            {error}
          </h2>
          <p className="text-muted-foreground mb-6">
            Ce profil n'existe pas ou n'est plus disponible.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="rounded-2xl"
            style={{ backgroundColor: "var(--brand-plum)" }}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">🐾</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Profil non trouvé
          </h2>
          <p className="text-muted-foreground mb-6">
            Impossible de charger ce profil. Veuillez réessayer plus tard.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="rounded-2xl"
            style={{ backgroundColor: "var(--brand-plum)" }}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Dog Section - Priority */}
        <div>
          <DogCarousel 
            dogs={dogs}
            isOwner={isOwner}
            onLike={handleLike}
            onMessage={handleMessage}
          />
        </div>

        {/* Owner Section */}
        <div>
          <OwnerSection profile={profile} />
        </div>

        {/* Stats and XP */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* XP Progress */}
          <div>
            <XpProgress current={850} min={500} max={1200} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-plum)" }}>
                24
              </p>
              <p className="text-xs text-muted-foreground">Amis</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-raspberry)" }}>
                67
              </p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-yellow)" }}>
                12
              </p>
              <p className="text-xs text-muted-foreground">Événements</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--ink)" }}>
            Badges débloqués
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 text-center transition hover:scale-105"
                style={{ backgroundColor: "var(--paper)" }}
              >
                <div className="mb-2 text-4xl">{badge.icon}</div>
                <p className="mb-1 font-semibold" style={{ color: "var(--ink)" }}>
                  {badge.name}
                </p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
