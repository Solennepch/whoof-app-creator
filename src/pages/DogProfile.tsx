import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDogAge } from "@/utils/age";
import { getZodiacSign } from "@/utils/zodiac";
import {
  Dog as DogIcon,
  Cake,
  Heart,
  Scale,
  BadgeCheck,
  Pencil,
  Calendar,
  Star,
  MapPin,
  Plus,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age_years?: number;
  birthdate?: string;
  size?: string;
  temperament?: string;
  anecdote?: string;
  photo?: string;
  avatar_url?: string;
  vaccination?: any;
  vaccinations?: string[];
  zodiac_sign?: string;
  owner_id: string;
}

// Mock photos for gallery (replace with actual photos from database)
const mockGalleryPhotos = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

export default function DogProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dog, setDog] = useState<Dog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/profile/me");
      return;
    }
    fetchDogData();
  }, [id]);

  const fetchDogData = async () => {
    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setDog(data);
      setIsOwner(user?.id === data.owner_id);
    } catch (error) {
      console.error("Error fetching dog:", error);
      toast.error("Impossible de charger le profil du chien");
      navigate("/profile/me");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-64 w-full rounded-3xl mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dog) {
    return null;
  }

  const temperamentTags = dog.temperament ? dog.temperament.split(",").map(t => t.trim()) : [];
  const age = dog.birthdate ? formatDogAge(dog.birthdate) : dog.age_years ? `${dog.age_years} an${dog.age_years > 1 ? 's' : ''}` : "N/A";
  const zodiacSign = dog.birthdate ? getZodiacSign(new Date(dog.birthdate)) : dog.zodiac_sign;

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Modification du profil - à venir")}
              className="rounded-2xl"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>

        {/* Header Card with Photo */}
        <Card className="mb-8 rounded-3xl shadow-soft overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              {/* Photo */}
              <div className="relative mb-6 animate-scale-in">
                <div 
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg"
                  style={{ 
                    background: dog.avatar_url || dog.photo 
                      ? `url(${dog.avatar_url || dog.photo})` 
                      : "var(--muted)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {!dog.avatar_url && !dog.photo && (
                    <div className="w-full h-full flex items-center justify-center">
                      <DogIcon className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {zodiacSign && (
                  <Badge 
                    className="absolute bottom-0 right-0 rounded-full border-2 border-white"
                    style={{ background: "var(--brand-yellow)", color: "var(--foreground)" }}
                  >
                    {zodiacSign}
                  </Badge>
                )}
              </div>

              {/* Name */}
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                {dog.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {dog.breed || "Race inconnue"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Card */}
        <Card className="mb-8 rounded-3xl shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
              Infos rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <DogIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Race</p>
                  <p className="font-semibold">{dog.breed || "Non renseignée"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Cake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Âge</p>
                  <p className="font-semibold">{age}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taille</p>
                  <p className="font-semibold">
                    {dog.size === "small" ? "Petit" : dog.size === "medium" ? "Moyen" : dog.size === "large" ? "Grand" : "Non renseignée"}
                  </p>
                </div>
              </div>

              {dog.birthdate && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--brand-raspberry)" }}
                  >
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Anniversaire</p>
                    <p className="font-semibold">
                      {new Date(dog.birthdate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personality Section */}
        {temperamentTags.length > 0 && (
          <Card className="mb-8 rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" style={{ color: "var(--brand-yellow)" }} />
                Personnalité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {temperamentTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="rounded-full px-4 py-2 text-sm"
                    style={{
                      background: index % 3 === 0 
                        ? "#FFE4E6" 
                        : index % 3 === 1 
                        ? "#FEF3C7" 
                        : "#E0E7FF",
                      borderColor: index % 3 === 0 
                        ? "#FDA4AF" 
                        : index % 3 === 1 
                        ? "#FDE68A" 
                        : "#C7D2FE"
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anecdote Section */}
        {dog.anecdote && (
          <Card className="mb-8 rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                À propos de {dog.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{dog.anecdote}</p>
            </CardContent>
          </Card>
        )}

        {/* Health Section */}
        {dog.vaccinations && dog.vaccinations.length > 0 && (
          <Card className="mb-8 rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5" style={{ color: "#10B981" }} />
                Santé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Vaccins à jour</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dog.vaccinations.map((vacc, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="rounded-full"
                      style={{ background: "#ECFDF5", borderColor: "#10B981" }}
                    >
                      {vacc}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Gallery */}
        <Card className="mb-8 rounded-3xl shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                Photos de {dog.name}
              </CardTitle>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Ajout de photos - à venir")}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {mockGalleryPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl bg-muted overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    background: `url(${photo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  onClick={() => toast.info("Visionneuse de photos - à venir")}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit CTA */}
        {isOwner && (
          <Card 
            className="rounded-3xl shadow-soft"
            style={{ background: "var(--card)" }}
          >
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Fredoka" }}>
                Améliore le profil de {dog.name}
              </h3>
              <p className="text-muted-foreground mb-6">
                Complète son profil pour optimiser le matching et les suggestions de balade
              </p>
              <Button
                size="lg"
                onClick={() => toast.info("Modification du profil - à venir")}
                className="rounded-full px-8"
                style={{
                  background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
                  color: "white"
                }}
              >
                Modifier le profil du chien
                <Pencil className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
