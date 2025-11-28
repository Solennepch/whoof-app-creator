import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, RotateCcw, Zap } from "lucide-react";

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  const handleSubscribe = () => {
    // TODO: Navigate to premium subscription page
    window.location.href = "/premium/pricing";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-gradient">
            Passe à Pawtes Premium
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Débloque toutes les fonctionnalités pour trouver le match parfait !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Retour en arrière illimité</h4>
              <p className="text-sm text-muted-foreground">Reviens sur tes choix quand tu veux</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
            </div>
            <div>
              <h4 className="font-semibold">Super-Likes illimités</h4>
              <p className="text-sm text-muted-foreground">Montre ton intérêt aux meilleurs profils</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold">Visibilité augmentée</h4>
              <p className="text-sm text-muted-foreground">Ton profil apparaît en priorité</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSubscribe}
            className="w-full h-12 text-lg font-bold"
            style={{
              background: "var(--gradient-signature)",
            }}
          >
            Découvrir Premium
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
