import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DogCarousel } from "@/components/profile/DogCarousel";
import { OwnerSection } from "@/components/profile/OwnerSection";
import { XpProgress } from "@/components/ui/XpProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { safeFetch } from "@/lib/safeFetch";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AlertTriangle } from "lucide-react";

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
  human_verified?: boolean;
}

// Helper function to check if a string is a valid UUID v4
function isValidUUID(str: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str);
}

function ProfileContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfileData = async () => {
    if (!id) {
      navigate('/profile/me', { replace: true });
      return;
    }

    // Validate UUID v4 - if not valid, redirect to /profile/me
    if (!isValidUUID(id)) {
      navigate('/profile/me', { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch profile and dogs in parallel
      const [profileData, dogsData] = await Promise.all([
        safeFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*`),
        safeFetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog?owner=${id}`)
      ]);

      // Handle profile response
      if (!profileData || profileData.length === 0) {
        setError(new Error('Profil non trouvé'));
        setIsLoading(false);
        return;
      }

      setProfile(profileData[0]);

      // Handle dogs response
      if (dogsData && dogsData.ok !== false) {
        setDogs(dogsData.data || dogsData || []);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, navigate]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
          {/* Dog Section Skeleton */}
          <Card className="p-6 rounded-3xl shadow-soft">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </Card>

          {/* Owner Section Skeleton */}
          <Card className="p-6 rounded-3xl shadow-soft">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ backgroundColor: "var(--paper)" }}
      >
        <Card className="max-w-md w-full p-8 rounded-3xl shadow-soft text-center">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
            style={{ backgroundColor: "var(--brand-raspberry)20" }}
          >
            <AlertTriangle 
              className="w-8 h-8" 
              style={{ color: "var(--brand-raspberry)" }} 
            />
          </div>
          
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
          >
            {error.message === 'Profil non trouvé' ? 'Profil non trouvé' : 'Impossible de charger le profil'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {error.message === 'Profil non trouvé' 
              ? 'Ce profil n\'existe pas ou n\'est plus disponible.'
              : 'Une erreur est survenue. Veuillez réessayer.'}
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="rounded-2xl"
            >
              Retour à l'accueil
            </Button>
            {error.message !== 'Profil non trouvé' && (
              <Button
                onClick={fetchProfileData}
                className="rounded-2xl text-white font-semibold"
                style={{ backgroundColor: "var(--brand-plum)" }}
              >
                Réessayer
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Profile not found (shouldn't reach here with error handling above)
  if (!profile) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ backgroundColor: "var(--paper)" }}
      >
        <Card className="max-w-md w-full p-8 rounded-3xl shadow-soft text-center">
          <div className="text-6xl mb-6">🐾</div>
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ color: "var(--ink)", fontFamily: "Fredoka" }}
          >
            Profil non trouvé
          </h2>
          <p className="text-muted-foreground mb-6">
            Impossible de charger ce profil.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="rounded-2xl"
            style={{ backgroundColor: "var(--brand-plum)" }}
          >
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  // Main profile view
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Section 1: Dog Section */}
        <div>
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ color: "var(--ink)", fontFamily: "Fredoka" }}
          >
            {dogs.length > 1 ? 'Mes chiens' : 'Mon chien'}
          </h2>
          <DogCarousel 
            dogs={dogs}
            isOwner={false}
            onLike={() => {}}
            onMessage={() => {}}
          />
        </div>

        {/* Section 2: Owner Section */}
        <div>
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ color: "var(--ink)", fontFamily: "Fredoka" }}
          >
            {profile.gender === 'female' ? 'Dog Mom' : 'Dog Dad'}
          </h2>
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

export default function Profile() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
