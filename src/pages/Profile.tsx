import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useProfileData } from "@/hooks/useProfileData";
import { formatDogAge } from "@/utils/age";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  UserPlus,
  MapPin,
  Calendar,
  MoreVertical,
  Flag,
  Ban,
  Share2,
  EyeOff,
  Star,
  Clock,
  Trees,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Mock gallery photos (will be replaced with actual photos from database)
const mockGalleryPhotos = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

function ProfileContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dogs, profile, isLoading, error, isOwnProfile } = useProfileData(id);

  const [liked, setLiked] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-96 w-full" />
          <div className="px-4 py-8">
            <Skeleton className="h-32 w-full rounded-3xl mb-6" />
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-20 rounded-3xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
      >
        <Card className="max-w-md w-full p-8 rounded-3xl shadow-soft text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Fredoka" }}>
            Profil non trouvé
          </h2>
          <p className="text-muted-foreground mb-6">
            Ce profil n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate("/home")} className="rounded-full">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  // If own profile, redirect to /profile/me
  if (isOwnProfile) {
    navigate("/profile/me");
    return null;
  }

  const primaryDog = dogs[0];
  const dogAge = primaryDog?.birthdate ? formatDogAge(primaryDog.birthdate) : primaryDog?.age_years ? `${primaryDog.age_years} an${primaryDog.age_years > 1 ? 's' : ''}` : "N/A";
  const temperamentTags = primaryDog?.temperament ? primaryDog.temperament.split(",").map(t => t.trim()) : [];
  
  const ownerName = profile.display_name || "Utilisateur";
  const dogName = primaryDog?.name || "Chien";

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "Like retiré" : `Tu as liké ${dogName} 🤍`);
  };

  const handleMessage = () => {
    toast.info("Fonctionnalité de messagerie - à venir");
  };

  const handleInviteWalk = () => {
    toast.info("Invitation à une balade - à venir");
  };

  const handleAddFriend = () => {
    setIsFriend(!isFriend);
    toast.success(isFriend ? "Ami retiré" : `Demande d'ami envoyée à ${ownerName}`);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold" style={{ fontFamily: "Fredoka" }}>
              {dogName} & {ownerName}
            </h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Options</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 mt-6">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl"
                  onClick={() => {
                    toast.info("Partage du profil - à venir");
                  }}
                >
                  <Share2 className="w-5 h-5 mr-3" />
                  Partager ce profil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl"
                  onClick={() => {
                    toast.info("Masquer le profil - à venir");
                  }}
                >
                  <EyeOff className="w-5 h-5 mr-3" />
                  Masquer ce profil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl text-destructive"
                  onClick={() => {
                    toast.info("Signaler le profil - à venir");
                  }}
                >
                  <Flag className="w-5 h-5 mr-3" />
                  Signaler ce profil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl text-destructive"
                  onClick={() => {
                    toast.info("Bloquer l'utilisateur - à venir");
                  }}
                >
                  <Ban className="w-5 h-5 mr-3" />
                  Bloquer l'utilisateur
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Hero Photo */}
        <div 
          className="relative w-full aspect-[4/3] bg-muted animate-fade-in"
          style={{
            backgroundImage: primaryDog?.avatar_url 
              ? `url(${primaryDog.avatar_url})` 
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {!primaryDog?.avatar_url && (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-32 h-32 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Identity Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "Fredoka" }}>
                  {dogName} — {primaryDog?.breed || "Race inconnue"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {dogAge}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-muted-foreground">
                  Avec {ownerName}
                </p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                <span>À 1,4 km de toi</span>
              </div>

              {temperamentTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {temperamentTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="rounded-full px-4 py-2"
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
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="rounded-3xl shadow-soft">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="lg"
                  onClick={handleLike}
                  className="rounded-2xl flex-col h-auto py-4"
                  style={liked ? {
                    background: "var(--brand-raspberry)",
                    color: "white"
                  } : {}}
                >
                  <Heart className={`w-6 h-6 mb-1 ${liked ? "fill-current" : ""}`} />
                  <span className="text-xs">Aimer</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleMessage}
                  className="rounded-2xl flex-col h-auto py-4"
                >
                  <MessageSquare className="w-6 h-6 mb-1" />
                  <span className="text-xs">Message</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleInviteWalk}
                  className="rounded-2xl flex-col h-auto py-4"
                >
                  <MapPin className="w-6 h-6 mb-1" />
                  <span className="text-xs">Balade</span>
                </Button>
              </div>
              
              {!isFriend && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddFriend}
                  className="w-full mt-3 rounded-2xl"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Ajouter en ami
                </Button>
              )}

              {isFriend && (
                <div className="mt-3 p-3 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <span className="text-sm font-medium text-green-700">
                    ✓ Vous êtes amis
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          {mockGalleryPhotos.length > 0 && (
            <Card className="rounded-3xl shadow-soft">
              <CardHeader>
                <CardTitle>Photos de {dogName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {mockGalleryPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-2xl bg-muted overflow-hidden cursor-pointer hover:scale-105 transition-transform animate-fade-in"
                      style={{
                        backgroundImage: `url(${photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        animationDelay: `${index * 50}ms`
                      }}
                      onClick={() => toast.info("Visionneuse de photos - à venir")}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Section */}
          {primaryDog?.anecdote && (
            <Card className="rounded-3xl shadow-soft">
              <CardHeader>
                <CardTitle>À propos de {dogName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {primaryDog.anecdote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Habits & Preferences */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                Habitudes de balade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rythme</p>
                  <p className="font-semibold">Énergique</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horaires préférés</p>
                  <p className="font-semibold">Matin • Après-midi</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Trees className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lieux préférés</p>
                  <p className="font-semibold">Parc • Nature</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Sociabilité</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4" 
                        fill={i < 4 ? "var(--brand-yellow)" : "none"}
                        style={{ color: "var(--brand-yellow)" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Profile */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                Profil du propriétaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
                  style={{
                    backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {!profile.avatar_url && <User className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "Fredoka" }}>
                    {ownerName}
                  </h3>
                  <p className="text-muted-foreground">
                    Propriétaire
                  </p>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Section (Optional) */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <span className="text-sm">Balades cette semaine</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <span className="text-sm">Événements rejoints</span>
                  <span className="font-bold">2</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <span className="text-sm">Niveau</span>
                  <span className="font-bold">4 — 620 XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
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

