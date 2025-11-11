import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DogCarousel } from "@/components/profile/DogCarousel";
import { GamificationSection } from "@/components/profile/GamificationSection";
import { Skeleton } from "@/components/ui/skeleton";
import { safeFetch } from "@/lib/safeFetch";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AlertTriangle, User, Dog as DogIcon, Edit, Crown, Zap, Heart, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DonationDialog } from "@/components/DonationDialog";
import { PremiumTeaser } from "@/components/ui/PremiumTeaser";

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

// Calculate profile completion percentage
function calculateProfileCompletion(profile: Profile | null, dogs: Dog[]): number {
  if (!profile) return 0;
  
  let completed = 0;
  let total = 10;
  
  // Profile fields (5 points)
  if (profile.display_name) completed++;
  if (profile.avatar_url) completed++;
  if (profile.bio) completed++;
  if (profile.birth_date) completed++;
  if (profile.interests && profile.interests.length > 0) completed++;
  
  // Dog fields (5 points)
  if (dogs.length > 0) {
    const dog = dogs[0];
    if (dog.name) completed++;
    if (dog.avatar_url) completed++;
    if (dog.breed) completed++;
    if (dog.birthdate || dog.age_years) completed++;
    if (dog.temperament) completed++;
  }
  
  return Math.round((completed / total) * 100);
}

function ProfileContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);

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
      // Check if this is the user's own profile
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      // Fetch profile and dogs from unified endpoint
      const data = await safeFetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile/${id}`);

      // Handle response with new structure { profile: {...}, dogs: [...] }
      if (!data?.profile) {
        setError(new Error('Profil non trouvé'));
        setIsLoading(false);
        return;
      }

      setProfile(data.profile);
      setDogs(data.dogs || []);
      setIsOwnProfile(currentUserId === id);

      // Check pro status and premium status if it's own profile
      if (currentUserId === id && user) {
        const { data: proAccount } = await supabase
          .from('pro_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsPro(!!proAccount);

        // Check premium status
        try {
          const checkResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (checkResponse.ok) {
            const { isPremium: premiumStatus } = await checkResponse.json();
            setIsPremium(premiumStatus);
          }
        } catch (error) {
          console.error('Error checking premium status:', error);
        }
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Handle 404 specifically
      if (err instanceof Error && err.message.includes('404')) {
        setError(new Error('Profil non trouvé'));
      } else {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      }
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
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
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
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
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
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
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

  const completionPercentage = calculateProfileCompletion(profile, dogs);
  const primaryDog = dogs[0];

  // Main profile view
  return (
    <main className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-[700px] px-4 pt-20 pb-6 space-y-5">
        {/* Tinder-style Header with Dog Avatar & Completion */}
        {isOwnProfile && (
          <div className="flex items-center justify-between">
            {/* Dog Avatar with Progress Circle */}
            <div className="relative">
              <div className="relative w-24 h-24">
                {/* Progress Circle Background */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#FF5DA2"
                    strokeWidth="4"
                    strokeDasharray={`${(completionPercentage / 100) * 276.46} 276.46`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                
                {/* Dog Avatar */}
                <div className="absolute inset-2 rounded-full overflow-hidden bg-white">
                  {primaryDog?.avatar_url ? (
                    <img 
                      src={primaryDog.avatar_url} 
                      alt={primaryDog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2]">
                      <DogIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>

                {/* Completion Percentage Badge */}
                <div 
                  className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                  style={{ backgroundColor: "#FF5DA2" }}
                >
                  {completionPercentage}%
                </div>
              </div>
            </div>

            {/* Dog Name & Edit Button */}
            <div className="flex-1 ml-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {primaryDog?.name || "Mon chien"}
                </h1>
                {profile.human_verified && (
                  <div className="w-6 h-6 rounded-full bg-[#7B61FF] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => navigate('/onboarding/profile')}
                variant="outline"
                className="rounded-full font-medium text-sm h-10 px-6 border-2"
                style={{ borderColor: "#111827" }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier mon profil
              </Button>
            </div>
          </div>
        )}

        {/* Premium Teaser - Only for non-premium users */}
        {isOwnProfile && !isPremium && (
          <PremiumTeaser blurredCount={12} />
        )}

        {/* Premium Badge - For premium users */}
        {isOwnProfile && isPremium && (
          <Card className="rounded-2xl shadow-soft overflow-hidden">
            <div className="bg-gradient-to-r from-[#FFC14D] to-[#FF5DA2] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6" />
                <div>
                  <p className="font-bold">Membre Premium</p>
                  <p className="text-xs opacity-90">Profite de tous les avantages</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => navigate('/premium')}
              >
                Gérer
              </Button>
            </div>
          </Card>
        )}

        {/* Support/Donation Section */}
        {isOwnProfile && (
          <Card 
            className="rounded-2xl shadow-soft overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setShowDonationDialog(true)}
          >
            <div className="bg-gradient-to-r from-[#FF5DA2] to-[#FFC14D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div>
                  <p className="font-bold">Nous soutenir</p>
                  <p className="text-xs opacity-90">Soutenez le développement de Whoof</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Card>
        )}
        {/* Parrainage Section */}
        {isOwnProfile && (
          <Card className="p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
                  Parrainage
                </h3>
                <p className="text-sm text-muted-foreground">
                  Invite tes amis et gagne des récompenses
                </p>
              </div>
              <Button
                onClick={() => navigate('/parrainage')}
                size="sm"
                className="rounded-full font-semibold"
                style={{ backgroundColor: "var(--brand-plum)" }}
              >
                Voir plus
              </Button>
            </div>

            <div 
              className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02]"
              style={{ 
                background: "linear-gradient(135deg, #7B61FF 0%, #FF5DA2 100%)"
              }}
              onClick={() => navigate('/parrainage')}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">12 amis parrainés</p>
                <p className="text-xs text-white/80">Continue comme ça !</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>
          </Card>
        )}

        {/* Stats - Only show for non-own profiles or as secondary info */}
        {!isOwnProfile && (
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
        )}
      </div>

      {/* Donation Dialog */}
      <DonationDialog 
        open={showDonationDialog} 
        onOpenChange={setShowDonationDialog}
      />
    </main>
  );
}

export default function Profile() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
