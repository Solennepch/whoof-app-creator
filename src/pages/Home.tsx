import { IconContainer } from "@/components/ui/IconContainer";
import { DogCard } from "@/components/feed/DogCard";
import { Sparkles, TrendingUp, Award, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const mockDogs = [
  {
    name: "Luna",
    breed: "Husky",
    age: "3 ans",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=400&h=400&fit=crop",
    description: "Adore la neige et les longues balades en forêt ! Très sociable avec les autres chiens 🐺",
    reasons: ["Même quartier", "Race similaire", "Actif"],
  },
  {
    name: "Max",
    breed: "Golden Retriever",
    age: "2 ans",
    distance: "800 m",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop",
    description: "Toujours prêt pour une partie de balle ! Cherche des amis pour le parc 🎾",
    reasons: ["À proximité", "Joueur", "Niveau similaire"],
  },
  {
    name: "Bella",
    breed: "Labrador",
    age: "4 ans",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1612536932263-2f3f3e6b3a7a?w=400&h=400&fit=crop",
    description: "Gentille et calme, parfaite pour des rencontres en douceur 🌸",
    reasons: ["Tempérament calme", "Même âge", "Vaccinée"],
  },
  {
    name: "Rocky",
    breed: "Berger Allemand",
    age: "5 ans",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop",
    description: "Protecteur et loyal, cherche des compagnons pour des aventures ! ⛰️",
    reasons: ["Grand gabarit", "Expérimenté", "Obéissant"],
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--ink)" }}>
            Fil d'actualité
          </h1>
          <p className="text-muted-foreground">Découvre les toutous près de chez toi</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
            <div className="mb-2 flex items-center gap-2">
              <IconContainer>
                <Sparkles className="h-4 w-4" />
              </IconContainer>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                Suggestions
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--brand-plum)" }}>
              12
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
            <div className="mb-2 flex items-center gap-2">
              <IconContainer>
                <TrendingUp className="h-4 w-4" />
              </IconContainer>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                Matchs
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--brand-raspberry)" }}>
              8
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
            <div className="mb-2 flex items-center gap-2">
              <IconContainer>
                <Award className="h-4 w-4" />
              </IconContainer>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                Badges
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--brand-yellow)" }}>
              5
            </p>
          </div>
        </div>

        {/* Professionnels Block */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <IconContainer>
                <Briefcase className="h-5 w-5" />
              </IconContainer>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
                  Professionnels
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vous êtes un professionnel canin ? Rejoignez notre réseau de partenaires
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/pro/onboarding')}
              className="rounded-2xl whitespace-nowrap"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              Référencer mon activité
            </Button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {mockDogs.map((dog, i) => (
            <DogCard key={i} {...dog} />
          ))}
        </div>
      </div>
    </div>
  );
}
