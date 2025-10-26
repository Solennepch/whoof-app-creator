import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

const dogHoroscopes = [
  {
    sign: "🐕 Labrador",
    week: "Semaine du 27 Jan - 2 Fév",
    text: "Cette semaine, ton énergie débordante attirera de nouveaux amis ! Les balades au parc seront particulièrement favorables. Attention à ne pas trop creuser dans le jardin... 🌱",
    mood: "Très énergique",
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Confetti effect
    const confetti = () => {
      const count = 50;
      const defaults = { origin: { y: 0.7 } };
      
      function fire(particleRatio: number, opts: any) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        
        setTimeout(() => canvas.remove(), 3000);
      }
      
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    };
    
    confetti();
    
    toast.success("✨ Phrase publiée dans le feed !", {
      description: "Ta phrase inspirante est maintenant visible par toute la communauté !",
    });
    
    setWeeklyPhrase("");
    setIsSubmitting(false);
  };

  return (
    <Card className="p-6 rounded-3xl shadow-soft space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--brand-yellow))" }} />
        <h3 className="text-xl font-bold" style={{ color: "hsl(var(--ink))", fontFamily: "Fredoka" }}>
          Section Fun
        </h3>
      </div>

      {/* Dog Horoscope */}
      <div 
        className="p-5 rounded-2xl space-y-3"
        style={{ 
          background: `linear-gradient(135deg, ${currentHoroscope.color}20 0%, ${currentHoroscope.color}10 100%)`,
          border: `2px solid ${currentHoroscope.color}40`
        }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold" style={{ color: "hsl(var(--ink))" }}>
            🔮 Horoscope de la semaine
          </h4>
          <span 
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: currentHoroscope.color,
              color: "white"
            }}
          >
            {currentHoroscope.mood}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-3xl">{currentHoroscope.sign}</span>
          <div>
            <p className="font-semibold" style={{ color: "hsl(var(--ink))" }}>
              {dogSign}
            </p>
            <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              {currentHoroscope.week}
            </p>
          </div>
        </div>
        
        <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--ink) / 0.8)" }}>
          {currentHoroscope.text}
        </p>
      </div>

      {/* Weekly Phrase */}
      <div className="p-5 rounded-2xl space-y-3" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
        <h4 className="text-lg font-bold" style={{ color: "hsl(var(--ink))" }}>
          ✍️ Phrase de la semaine
        </h4>
        
        <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.7)" }}>
          Complète cette phrase et partage-la avec la communauté :
        </p>
        
        <div 
          className="p-4 rounded-2xl text-center font-medium text-lg"
          style={{ 
            backgroundColor: "hsl(var(--paper))",
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
          className="min-h-[100px] rounded-2xl resize-none"
          style={{ 
            borderColor: "hsl(var(--border))",
            backgroundColor: "hsl(var(--paper))"
          }}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            {weeklyPhrase.length} / 200 caractères
          </span>
          
          <Button
            onClick={handlePublishPhrase}
            disabled={isSubmitting || !weeklyPhrase.trim()}
            className="rounded-2xl font-semibold text-white"
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
