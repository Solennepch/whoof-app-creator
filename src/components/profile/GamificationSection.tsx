import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Heart, Star, CircleDot, Sparkles, Target, Palette, type LucideIcon } from "lucide-react";
import { XpProgress } from "@/components/ui/XpProgress";

interface Badge {
  icon: LucideIcon;
  name: string;
  desc: string;
  unlocked: boolean;
  unlockedAt?: string;
  color: string;
}

const ACHIEVEMENTS = [
  { icon: Heart, name: "Sociable", desc: "10 matchs", unlocked: true, unlockedAt: "2024-02-10", color: "text-primary" },
  { icon: Star, name: "Star", desc: "50 likes reçus", unlocked: true, unlockedAt: "2024-02-20", color: "text-accent" },
  { icon: CircleDot, name: "Joueur", desc: "5 événements", unlocked: true, unlockedAt: "2024-03-01", color: "text-secondary" },
  { icon: Trophy, name: "Champion", desc: "100 balades", unlocked: false, color: "text-secondary" },
  { icon: Sparkles, name: "Populaire", desc: "100 likes reçus", unlocked: false, color: "text-accent" },
  { icon: Target, name: "Fidèle", desc: "30 jours consécutifs", unlocked: false, color: "text-primary" },
  { icon: Heart, name: "Amoureux", desc: "10 matchs parfaits", unlocked: false, color: "text-primary" },
  { icon: Palette, name: "Créatif", desc: "Publie 20 photos", unlocked: false, color: "text-accent" },
];

interface GamificationSectionProps {
  level?: number;
  currentXP?: number;
  maxXP?: number;
  totalRecommendations?: number;
}

export function GamificationSection({ 
  level = 3, 
  currentXP = 1200, 
  maxXP = 1500,
  totalRecommendations = 12 
}: GamificationSectionProps) {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const unlockedBadges = ACHIEVEMENTS.filter(b => b.unlocked);

  return (
    <Card className="rounded-2xl shadow-sm p-4 space-y-3" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <h2 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--ink))" }}>
        Gamification & Communauté
      </h2>

      {/* XP Progress Compact */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
          <span>Niveau {level}</span>
          <span>{currentXP} / {maxXP} XP</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--muted))" }}>
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${(currentXP / maxXP) * 100}%`,
              background: "linear-gradient(90deg, hsl(var(--brand-plum)), hsl(var(--brand-raspberry)))"
            }}
          />
        </div>
      </div>

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center py-2 px-3 rounded-xl" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
          <Trophy className="w-6 h-6 mb-1 text-secondary" />
          <p className="text-lg font-bold" style={{ color: "hsl(var(--brand-plum))" }}>
            {unlockedBadges.length}
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>Badges</p>
        </div>
        
        <div className="text-center py-2 px-3 rounded-xl" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
          <div className="text-xl mb-1">🐾</div>
          <p className="text-lg font-bold" style={{ color: "hsl(var(--brand-raspberry))" }}>
            {totalRecommendations}
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>Pattes</p>
        </div>
        
        <div className="text-center py-2 px-3 rounded-xl" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
          <Star className="w-6 h-6 mb-1 text-accent" />
          <p className="text-lg font-bold" style={{ color: "hsl(var(--brand-yellow))" }}>
            #{level * 100}
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>Rang</p>
        </div>
      </div>

      {/* Badges Preview - Scrollable without scrollbar */}
      <div className="overflow-x-auto -mx-2 px-2 no-scrollbar">
        <div className="flex gap-2">
          {unlockedBadges.slice(0, 6).map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div
                key={i}
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                title={`${badge.name}: ${badge.desc}`}
              >
                <Icon className={`w-6 h-6 ${badge.color}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button - Compact */}
      <Dialog open={showAllBadges} onOpenChange={setShowAllBadges}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "hsl(var(--brand-plum))", color: "hsl(var(--brand-plum))" }}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Voir toutes mes récompenses
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "Fredoka", color: "hsl(var(--ink))" }}>
              <Trophy className="w-4 h-4 inline-block mr-1 text-secondary" />
              Toutes mes récompenses
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Unlocked Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(var(--ink))" }}>
                Badges débloqués ({unlockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {unlockedBadges.map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={i}
                      className="p-4 rounded-2xl text-center transition-transform hover:scale-105"
                      style={{ backgroundColor: "hsl(var(--paper))" }}
                    >
                      <Icon className={`w-12 h-12 mx-auto mb-2 ${badge.color}`} />
                      <p className="font-semibold text-sm mb-1" style={{ color: "hsl(var(--ink))" }}>
                        {badge.name}
                      </p>
                      <p className="text-xs mb-1" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                        {badge.desc}
                      </p>
                      {badge.unlockedAt && (
                        <p className="text-xs" style={{ color: "hsl(var(--brand-plum))" }}>
                          Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locked Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(var(--ink))" }}>
                À débloquer ({ACHIEVEMENTS.filter(b => !b.unlocked).length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ACHIEVEMENTS.filter(b => !b.unlocked).map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={i}
                      className="p-4 rounded-2xl text-center opacity-50"
                      style={{ backgroundColor: "hsl(var(--muted))" }}
                    >
                      <Icon className={`w-12 h-12 mx-auto mb-2 grayscale ${badge.color}`} />
                      <p className="font-semibold text-sm mb-1" style={{ color: "hsl(var(--ink))" }}>
                        {badge.name}
                      </p>
                      <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                        {badge.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
