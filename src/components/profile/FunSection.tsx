import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Star } from "lucide-react";
import { toast } from "sonner";

const dogHoroscopes = [
  {
    sign: "🐕 Labrador",
    week: "Semaine du 27 Jan - 2 Fév",
    text: "Cette semaine, ton énergie débordante attirera de nouveaux amis ! Les balades au parc seront particulièrement favorables.",
    mood: "Énergique",
    color: "hsl(var(--brand-yellow))"
  }
];

interface FunSectionProps {
  dogSign?: string;
}

export function FunSection({ dogSign = "🐕 Labrador" }: FunSectionProps) {
  const [weeklyPhrase, setWeeklyPhrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentHoroscope = dogHoroscopes[0];

  const handlePublishPhrase = async () => {
    if (!weeklyPhrase.trim()) {
      toast.error("Écris quelque chose avant de publier ! 📝");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("✨ Phrase publiée dans le feed !", {
      description: "Ta phrase inspirante est maintenant visible par toute la communauté !",
    });
    
    setWeeklyPhrase("");
    setIsSubmitting(false);
  };

  return (
    <Card className="rounded-2xl shadow-sm p-4 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--ink))" }}>
        Section Fun
      </h2>

      {/* Astro Dog Link */}
      <Link
        to="/astro-dog"
        className="block p-4 rounded-xl transition hover:opacity-80"
        style={{ 
          backgroundColor: "hsl(var(--brand-yellow) / 0.1)",
          border: "1px solid hsl(var(--brand-yellow) / 0.3)"
        }}
      >
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6" style={{ color: "hsl(var(--brand-yellow))" }} />
          <div className="flex-1">
            <h4 className="text-base font-semibold" style={{ color: "hsl(var(--ink))" }}>
              🌟 Mon Astro Dog
            </h4>
            <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              Découvre l'horoscope de ton chien
            </p>
          </div>
        </div>
      </Link>

      {/* Weekly Phrase - Compact */}
      <div className="space-y-3">
        <h4 className="text-base font-semibold" style={{ color: "hsl(var(--ink))" }}>
          ✍️ Phrase de la semaine
        </h4>
        
        <div 
          className="p-3 rounded-xl text-center font-medium text-sm"
          style={{ 
            backgroundColor: "hsl(var(--muted) / 0.5)",
            color: "hsl(var(--brand-plum))",
            fontFamily: "Fredoka"
          }}
        >
          "Ce que j'aime le plus chez mon chien, c'est..."
        </div>
        
        <Textarea
          value={weeklyPhrase}
          onChange={(e) => setWeeklyPhrase(e.target.value)}
          placeholder="Écris ta réponse ici..."
          maxLength={200}
          rows={3}
          className="rounded-xl resize-none text-sm"
          style={{ 
            borderColor: "hsl(var(--border))",
            backgroundColor: "hsl(var(--paper))"
          }}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            {weeklyPhrase.length} / 200
          </span>
          
          <Button
            onClick={handlePublishPhrase}
            disabled={isSubmitting || !weeklyPhrase.trim()}
            className="h-10 rounded-xl font-medium text-white px-6"
            style={{ backgroundColor: "hsl(var(--brand-plum))" }}
          >
            {isSubmitting ? (
              "Publication..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publier
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
