import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  User,
  MapPin,
  Crown,
  Mail,
  Lock,
  Shield,
  Trash2,
  Edit,
  Plus,
  Heart,
} from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Dog {
  id: string;
  name: string;
  breed: string | null;
  age_years: number | null;
  photo: string | null;
  temperament: string | null;
}

interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  privacy: any;
}

function MyProfileContent() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: isPremium } = usePremium();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    isPublic: true,
    showDistance: true,
    acceptFriendRequests: true,
    showInDiscovery: true,
  });

  useEffect(() => {
    loadProfileData();
  }, [session]);

  const loadProfileData = async () => {
    if (!session?.user) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Set privacy from profile
      if (profileData.privacy && typeof profileData.privacy === 'object' && !Array.isArray(profileData.privacy)) {
        const privacyObj = profileData.privacy as { [key: string]: any };
        setPrivacy({
          isPublic: privacyObj.isPublic ?? true,
          showDistance: privacyObj.showDistance ?? true,
          acceptFriendRequests: privacyObj.acceptFriendRequests ?? true,
          showInDiscovery: privacyObj.showInDiscovery ?? true,
        });
      }

      // Load dogs
      const { data: dogsData, error: dogsError } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", session.user.id);

      if (dogsError) throw dogsError;
      setDogs(dogsData || []);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Erreur lors du chargement de ton profil");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySetting = async (key: string, value: boolean) => {
    if (!session?.user) return;

    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ privacy: newPrivacy })
        .eq("id", session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast.error("Erreur lors de la mise à jour de la confidentialité");
      // Revert on error
      setPrivacy(privacy);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4 pb-24">
        <header className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </header>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Mon Profil</h1>
        <p className="text-xs text-muted-foreground">
          Gère tes informations et celles de ton chien.
        </p>
      </header>

      {/* Section: Ton compte */}
      <section className="space-y-3">
        <h2 className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Ton compte
        </h2>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-16 w-16 transition-transform hover:scale-105">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.display_name || ""} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.display_name?.slice(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isPremium && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-md">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{profile?.display_name || "Nom non défini"}</p>
                {profile?.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{profile.bio}</p>
                )}
                {profile?.city && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                  </p>
                )}
              </div>
            </div>

            <Button
              size="sm"
              className="mt-4 w-full rounded-full"
              variant="outline"
              onClick={() => navigate("/settings")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier mon profil
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Section: Ton chien / Tes chiens */}
      <section className="space-y-3">
        <h2 className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {dogs.length > 1 ? "Tes chiens" : "Ton chien"}
        </h2>

        {dogs.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-amber-200 bg-amber-50">
            <CardContent className="py-6 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-amber-600" />
              <p className="mb-1 text-sm font-medium text-amber-900">
                Ton chien n'est pas encore ajouté.
              </p>
              <p className="mb-4 text-xs text-amber-700">
                Ajoute-le pour débloquer le matching, les balades et les récompenses !
              </p>
              <Button
                size="sm"
                className="rounded-full bg-amber-600 hover:bg-amber-700"
                onClick={() => navigate("/onboarding/dog")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter mon chien
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dogs.map((dog) => (
              <Card key={dog.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      {dog.photo ? (
                        <AvatarImage src={dog.photo} alt={dog.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          🐶
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{dog.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dog.breed || "Race non définie"}
                        {dog.age_years && ` — ${dog.age_years} an${dog.age_years > 1 ? "s" : ""}`}
                      </p>
                      {dog.temperament && (
                        <p className="text-xs text-muted-foreground">
                          {dog.temperament.split(",").join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full rounded-full"
                    onClick={() => navigate(`/settings`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier les infos du chien
                  </Button>
                </CardContent>
              </Card>
            ))}

            {dogs.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => navigate("/onboarding/dog")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un autre chien
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Section: Visibilité & préférences */}
      <section className="space-y-3">
        <h2 className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visibilité & préférences
        </h2>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Activer mon profil public</p>
                <p className="text-xs text-muted-foreground">
                  Les autres utilisateurs peuvent te trouver
                </p>
              </div>
              <Switch
                checked={privacy.isPublic}
                onCheckedChange={(value) => updatePrivacySetting("isPublic", value)}
              />
            </div>

            <div className="h-px bg-muted" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Afficher la distance</p>
                <p className="text-xs text-muted-foreground">
                  Distance approximative visible par les autres
                </p>
              </div>
              <Switch
                checked={privacy.showDistance}
                onCheckedChange={(value) => updatePrivacySetting("showDistance", value)}
              />
            </div>

            <div className="h-px bg-muted" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Recevoir des demandes d'amis</p>
                <p className="text-xs text-muted-foreground">
                  Autorise les autres utilisateurs à t'ajouter
                </p>
              </div>
              <Switch
                checked={privacy.acceptFriendRequests}
                onCheckedChange={(value) => updatePrivacySetting("acceptFriendRequests", value)}
              />
            </div>

            <div className="h-px bg-muted" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Me proposer des profils proches</p>
                <p className="text-xs text-muted-foreground">
                  Apparaître dans les suggestions de matching
                </p>
              </div>
              <Switch
                checked={privacy.showInDiscovery}
                onCheckedChange={(value) => updatePrivacySetting("showInDiscovery", value)}
              />
            </div>
          </CardContent>
        </Card>

        <p className="px-2 text-[11px] text-muted-foreground">
          Tu peux contrôler les informations visibles par les autres utilisateurs.
        </p>
      </section>

      {/* Section: Sécurité */}
      <section className="space-y-3">
        <h2 className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sécurité
        </h2>

        <div className="space-y-2">
          <Card
            className="rounded-2xl border-none shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Modifier mon email</span>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-none shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Modifier mon mot de passe</span>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-none shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Vérifier mon compte</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
            <CardContent className="py-4">
              <div className="mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900">Zone de danger</span>
              </div>
              <p className="mb-3 text-xs text-red-700">
                La suppression de ton compte est irréversible et entraînera la perte de toutes tes données.
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="w-full rounded-full"
                onClick={() => {
                  toast.error("Fonctionnalité en cours de développement");
                }}
              >
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function MyProfile() {
  return (
    <ErrorBoundary>
      <MyProfileContent />
    </ErrorBoundary>
  );
}
