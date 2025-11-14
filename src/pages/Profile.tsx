import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DogCarousel } from "@/components/profile/DogCarousel";
import { GamificationSection } from "@/components/profile/GamificationSection";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AlertTriangle } from "lucide-react";
import { DonationDialog } from "@/components/DonationDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PremiumSection } from "@/components/profile/PremiumSection";
import { SupportSection } from "@/components/profile/SupportSection";
import { ParrainageSection } from "@/components/profile/ParrainageSection";
import { useProfileData } from "@/hooks/useProfileData";
import { usePremium } from "@/hooks/usePremium";
import { calculateProfileCompletion } from "@/utils/profileHelpers";

function ProfileContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDonationDialog, setShowDonationDialog] = useState(false);

  const {
    dogs,
    profile,
    isLoading,
    error,
    isOwnProfile,
    isPro,
  } = useProfileData(id);

  const { data: isPremium } = usePremium();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
          <Card className="p-6 rounded-3xl shadow-soft">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </Card>

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
              onClick={() => navigate('/home')}
              variant="outline"
              className="rounded-2xl"
            >
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const completionPercentage = calculateProfileCompletion(profile, dogs);
  const primaryDog = dogs[0];

  return (
    <main className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-[700px] px-4 pt-20 pb-6 space-y-5">
        {isOwnProfile && (
          <>
            <ProfileHeader 
              primaryDog={primaryDog}
              profile={profile}
              completionPercentage={completionPercentage}
            />

            <PremiumSection isPremium={!!isPremium} />

            <SupportSection onClick={() => setShowDonationDialog(true)} />

            <ParrainageSection />
          </>
        )}

        {!isOwnProfile && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-plum)" }}>
                24
              </p>
              <p className="text-xs text-muted-foreground">Amis</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-plum)" }}>
                78
              </p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-2xl font-bold" style={{ color: "var(--brand-plum)" }}>
                12
              </p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        )}

        {/* Dogs carousel */}
        {dogs.length > 0 && <DogCarousel dogs={dogs} />}

        {/* Gamification */}
        {isOwnProfile && <GamificationSection />}
      </div>

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
