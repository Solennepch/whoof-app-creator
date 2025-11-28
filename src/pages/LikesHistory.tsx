import { useNavigate } from "react-router-dom";
import { Heart, Crown, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremium } from "@/hooks/usePremium";
import { motion } from "framer-motion";
import { useState } from "react";
import { mockLikedProfiles } from "@/config/profiles";
import ErrorBoundary from "@/components/ErrorBoundary";

function LikesHistoryContent() {
  const navigate = useNavigate();
  const { data: isPremium, isLoading: isPremiumLoading } = usePremium();
  const [likedProfiles] = useState(mockLikedProfiles);

  // Show max 10 likes for non-premium users
  const displayedProfiles = isPremium ? likedProfiles : likedProfiles.slice(0, 10);
  const hasMoreLikes = !isPremium && likedProfiles.length > 10;

  if (isPremiumLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4 pb-24">
        <header className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </header>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Mes Likes</h1>
        <p className="text-xs text-muted-foreground">
          Retrouve ici tous les profils que tu as likés.
        </p>
        {!isPremium && (
          <p className="flex items-center gap-1 text-xs text-amber-600">
            <Crown className="h-3 w-3" />
            L'accès complet est réservé aux membres Premium.
          </p>
        )}
      </header>

      {/* Premium Section (if not premium) */}
      {!isPremium && (
        <Card
          className="cursor-pointer rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 transition-transform hover:scale-[1.02]"
          onClick={() => navigate("/premium")}
        >
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">PAWTES Premium</p>
                <p className="text-xs text-amber-700">
                  Accède à tous tes likes, même les plus anciens.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {likedProfiles.length === 0 && (
        <Card className="rounded-2xl border-dashed border-muted">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium">Tu n'as encore liké personne 🤍</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Découvre les chiens autour de toi et envoie ton premier like !
            </p>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => navigate("/discover")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Découvrir des profils
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Likes List */}
      {likedProfiles.length > 0 && (
        <div className="space-y-3">
          {displayedProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer rounded-2xl border-none shadow-sm transition-all hover:shadow-md"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    {/* Dog Avatar */}
                    <Avatar className="h-16 w-16 rounded-xl">
                      <AvatarImage src={profile.image} alt={profile.name} />
                      <AvatarFallback>🐶</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{profile.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        {profile.breed} • {profile.age}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profile.reasons.slice(0, 3).map((reason, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Gated Content Card (if non-premium and more likes) */}
          {hasMoreLikes && (
            <Card
              className="cursor-pointer rounded-2xl border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50"
              onClick={() => navigate("/premium")}
            >
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <p className="mb-1 text-sm font-semibold text-amber-900">
                  Encore {likedProfiles.length - 10} like{likedProfiles.length - 10 > 1 ? "s" : ""} à découvrir
                </p>
                <p className="mb-4 text-xs text-amber-700">
                  Deviens Premium pour afficher tous tes likes.
                </p>
                <Button size="sm" className="rounded-full bg-amber-600 hover:bg-amber-700">
                  <Crown className="mr-2 h-4 w-4" />
                  Débloquer mes likes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function LikesHistory() {
  return (
    <ErrorBoundary>
      <LikesHistoryContent />
    </ErrorBoundary>
  );
}
