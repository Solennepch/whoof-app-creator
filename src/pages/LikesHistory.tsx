import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { motion } from "framer-motion";
import { useState, memo } from "react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { mockLikedProfiles } from "@/config/profiles";
import { formatTime } from "@/utils/profileHelpers";

const LikeCard = memo(function LikeCard({ profile, onNavigate }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        <div
          className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0 relative"
          style={{ backgroundImage: `url(${profile.image})` }}
        >
          {profile.matched && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-soft">
              <Heart className="h-3 w-3 text-white fill-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-foreground">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.breed} • {profile.age}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(profile.likedAt)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {profile.reasons.map((reason: string, i: number) => (
              <ReasonChip key={i} label={reason} />
            ))}
          </div>

          <div className="flex gap-2">
            {profile.matched && (
              <Button
                size="sm"
                variant="like"
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onNavigate(`/profile/${profile.id}`)}
            >
              Voir profil
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function LikesHistory() {
  const navigate = useNavigate();
  const { data: isPremium } = usePremium();
  const [likedProfiles] = useState(mockLikedProfiles);

  // Redirect non-premium users
  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-soft">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent via-primary to-secondary flex items-center justify-center">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Fonctionnalité Premium</h2>
          <p className="text-muted-foreground mb-6">
            L'historique des likes est réservé aux membres Premium
          </p>
          <Button
            onClick={() => navigate("/premium")}
            size="lg"
            className="w-full"
          >
            Voir les offres Premium
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return formatTime(date);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Mes Likes</h1>
              <p className="text-xs text-muted-foreground">{likedProfiles.length} profils likés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {likedProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun like pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {likedProfiles.map((profile) => (
              <LikeCard 
                key={profile.id} 
                profile={profile} 
                onNavigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
