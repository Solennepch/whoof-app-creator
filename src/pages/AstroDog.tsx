import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const dogHoroscopes = [
  {
    sign: "🐕 Labrador",
    week: "Semaine du 27 Jan - 2 Fév",
    text: "Cette semaine, ton énergie débordante attirera de nouveaux amis ! Les balades au parc seront particulièrement favorables. N'hésite pas à explorer de nouveaux chemins et à rencontrer de nouvelles têtes poilues. La chance est de ton côté pour les jeux de balle et les courses effrénées.",
    mood: "Énergique",
    color: "hsl(var(--brand-yellow))"
  }
];

export default function AstroDog() {
  const currentHoroscope = dogHoroscopes[0];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
        {/* Back Button */}
        <Link 
          to="/profile/me" 
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition"
          style={{ color: "hsl(var(--brand-plum))" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au profil
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--ink))" }}>
            🌟 Mon Astro Dog
          </h1>
          <p className="text-sm mt-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
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
          <h3 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--ink))" }}>
            📅 Horoscopes précédents
          </h3>
          <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            L'historique de tes horoscopes sera bientôt disponible !
          </p>
        </Card>
      </div>
    </div>
  );
}
