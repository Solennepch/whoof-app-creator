import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronLeft, Star, Sparkles } from "lucide-react";

const dogHoroscopes = [
  {
    sign: "Labrador",
    week: "Semaine du 27 Jan - 2 Fév",
    text: "Cette semaine, ton énergie débordante attirera de nouveaux amis ! Les balades au parc seront particulièrement favorables. N'hésite pas à explorer de nouveaux chemins et à rencontrer de nouvelles têtes poilues. La chance est de ton côté pour les jeux de balle et les courses effrénées.",
    mood: "Énergique",
    color: "hsl(var(--brand-yellow))"
  }
];

export default function AstroDog() {
  const currentHoroscope = dogHoroscopes[0];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)"
    }}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-40 right-20 w-5 h-5 text-white/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute top-60 left-1/4 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-32 right-10 w-7 h-7 text-white/25 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-80 left-1/3 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "2s" }} />
        <Star className="absolute top-96 right-1/4 w-5 h-5 text-white/35 animate-pulse" style={{ animationDelay: "2.5s" }} />
        <Sparkles className="absolute bottom-40 left-20 w-4 h-4 text-white/25 animate-pulse" style={{ animationDelay: "3s" }} />
        <Star className="absolute bottom-60 right-16 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "3.5s" }} />
      </div>

      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6 relative z-10">
        {/* Back Button */}
        <Link 
          to="/profile/me" 
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au profil
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: "#111827" }}>
            <Star className="w-8 h-8" style={{ color: "#7B61FF" }} fill="#7B61FF" />
            Mon Astro Dog
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Découvre l'horoscope de ton chien chaque semaine
          </p>
        </div>

        {/* Current Week Horoscope */}
        <Card className="rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--ink))" }}>
                {currentHoroscope.sign}
              </h2>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                {currentHoroscope.week}
              </p>
            </div>
            <span 
              className="text-sm font-medium px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: currentHoroscope.color,
                color: "white"
              }}
            >
              {currentHoroscope.mood}
            </span>
          </div>

          <div 
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: `${currentHoroscope.color}10`,
              border: `1px solid ${currentHoroscope.color}30`
            }}
          >
            <p className="text-base leading-relaxed" style={{ color: "hsl(var(--ink) / 0.9)" }}>
              {currentHoroscope.text}
            </p>
          </div>
        </Card>

        {/* Historical Horoscopes (Optional) */}
        <Card className="rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "hsl(var(--ink))" }}>
            <Star className="w-5 h-5 text-accent" />
            Horoscopes précédents
          </h3>
          <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            L'historique de tes horoscopes sera bientôt disponible !
          </p>
        </Card>
      </div>
    </div>
  );
}
