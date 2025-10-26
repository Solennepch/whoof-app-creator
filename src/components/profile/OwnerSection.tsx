import { Shield, Heart, Calendar, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { calculateAge } from "@/utils/age";

interface OwnerSectionProps {
  profile: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    birth_date?: string;
    bio?: string;
    gender?: string;
    relationship_status?: string;
    interests?: string[];
    verified?: boolean;
  };
}

export function OwnerSection({ profile }: OwnerSectionProps) {
  const age = profile.birth_date ? calculateAge(profile.birth_date) : null;
  const title = profile.gender === 'female' 
    ? "Mon Dog Mom 🐾" 
    : profile.gender === 'male'
    ? "Mon Dog Dad 🐾"
    : "Mon Propriétaire 🐾";

  return (
    <Card className="rounded-3xl shadow-lg border-0 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "Fredoka" }}>
          {title}
        </h2>
        <p className="text-white/90 text-sm">
          La personne derrière cette adorable boule de poils
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Profile Info */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              {(profile.display_name || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
                {profile.display_name || 'Utilisateur'}
              </h3>
              {profile.verified && (
                <Badge className="bg-blue-500 text-white border-0 gap-1">
                  <Shield className="h-3 w-3" />
                  Certifié
                </Badge>
              )}
            </div>

            {age && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {age} ans
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
            <p className="text-sm text-gray-700">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Relationship Status */}
        {profile.relationship_status && (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium">{profile.relationship_status}</span>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Centres d'intérêt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
