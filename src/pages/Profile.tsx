import { useParams } from "react-router-dom";
import { MapPin, Calendar, Award, Heart, MessageCircle, Settings } from "lucide-react";
import { IconContainer } from "@/components/ui/IconContainer";
import { XpProgress } from "@/components/ui/XpProgress";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { Button } from "@/components/ui/button";

const badges = [
  { icon: "🦴", name: "Premier pas", desc: "Créé ton profil" },
  { icon: "❤️", name: "Sociable", desc: "10 matchs" },
  { icon: "⭐", name: "Star", desc: "50 likes reçus" },
  { icon: "🎾", name: "Joueur", desc: "5 événements" },
];

export default function Profile() {
  const { id } = useParams();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div
              className="mb-4 h-24 w-24 flex-shrink-0 rounded-full bg-cover bg-center ring-4 sm:mb-0 sm:mr-6"
              style={{
                backgroundImage: "url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop)",
                borderColor: "var(--brand-plum)",
              }}
            />

            <div className="flex-1">
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
                  Buddy
                </h1>
                <ReasonChip label="Niveau 2" />
              </div>
              <p className="mb-3 text-muted-foreground">Golden Retriever • 3 ans • Paris</p>

              <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" style={{ color: "var(--brand-plum)" }} />
                  <span style={{ color: "var(--ink)", opacity: 0.8 }}>2.1 km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" style={{ color: "var(--brand-raspberry)" }} />
                  <span style={{ color: "var(--ink)", opacity: 0.8 }}>Actif depuis Mars 2024</span>
                </div>
              </div>

              <div className="flex justify-center gap-2 sm:justify-start">
                <Button className="rounded-2xl" style={{ backgroundColor: "var(--brand-raspberry)" }}>
                  <Heart className="mr-2 h-4 w-4" />
                  J'aime
                </Button>
                <Button variant="outline" className="rounded-2xl">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--ink)" }}>
            À propos
          </h2>
          <p style={{ color: "var(--ink)", opacity: 0.8 }}>
            Bonjour ! Je m'appelle Buddy et j'adore rencontrer de nouveaux amis au parc. 
            Je suis très joueur et j'aime particulièrement courir après les balles. 
            Toujours partant pour une balade ou une session de jeu ! 🎾
          </p>
        </div>

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
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
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
