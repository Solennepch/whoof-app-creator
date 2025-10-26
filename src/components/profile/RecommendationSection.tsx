import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";

interface RecommendationSectionProps {
  totalRecommendations?: number;
  canRecommend?: boolean;
}

export function RecommendationSection({ 
  totalRecommendations = 12,
  canRecommend = true 
}: RecommendationSectionProps) {
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendMessage, setRecommendMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRecommendation = async () => {
    if (!recommendMessage.trim()) {
      toast.error("Écris un petit message pour accompagner ta recommandation 🐾");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("🐾 Recommandation envoyée avec succès !", {
      description: "Le membre sera notifié de ta super patte !",
    });
    
    setRecommendMessage("");
    setShowRecommendModal(false);
    setIsSubmitting(false);
  };

  return (
    <Card className="rounded-2xl shadow-sm p-4 space-y-4" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--ink))" }}>
          Recommandations
        </h2>
        <span className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
          {totalRecommendations} pattes 🐾
        </span>
      </div>

      {canRecommend && (
        <Dialog open={showRecommendModal} onOpenChange={setShowRecommendModal}>
          <DialogTrigger asChild>
            <Button
              className="w-full h-12 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(to right, hsl(var(--brand-raspberry)), hsl(var(--brand-plum)))" }}
            >
              <Heart className="h-4 w-4 mr-2" />
              Mettre une 🐾 à un membre
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "Fredoka", color: "hsl(var(--ink))" }}>
                🐾 Recommander un membre
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "hsl(var(--ink))" }}>
                  Qui veux-tu recommander ?
                </label>
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  className="w-full p-3 rounded-2xl border"
                  style={{ 
                    borderColor: "hsl(var(--border))",
                    backgroundColor: "hsl(var(--paper))"
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "hsl(var(--ink))" }}>
                  Pourquoi le recommandes-tu ?
                </label>
                <Textarea
                  value={recommendMessage}
                  onChange={(e) => setRecommendMessage(e.target.value)}
                  placeholder="Partage pourquoi ce membre mérite une patte... 🐾"
                  className="min-h-[120px] rounded-2xl resize-none"
                  style={{ 
                    borderColor: "hsl(var(--border))",
                    backgroundColor: "hsl(var(--paper))"
                  }}
                />
                <p className="text-xs mt-1" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                  {recommendMessage.length} / 300 caractères
                </p>
              </div>

              <Button
                onClick={handleSubmitRecommendation}
                disabled={isSubmitting}
                className="w-full rounded-2xl font-semibold text-white"
                style={{ backgroundColor: "hsl(var(--brand-raspberry))" }}
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ma recommandation
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
