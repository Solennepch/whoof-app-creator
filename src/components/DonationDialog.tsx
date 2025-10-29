import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTED_AMOUNTS = [5, 10, 20, 50];

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedSuggested, setSelectedSuggested] = useState<number | null>(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setSelectedSuggested(value);
    setCustomAmount(value.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
      // Check if the custom amount matches a suggested amount
      setSelectedSuggested(SUGGESTED_AMOUNTS.includes(numValue) ? numValue : null);
    } else {
      setSelectedSuggested(null);
    }
  };

  const handleDonate = async () => {
    if (amount < 1) {
      toast.error("Le montant doit être supérieur à 0€");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-donation`,
        {
          method: 'POST',
          headers: {
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du don');
      }

      const { url } = await response.json();
      
      if (url) {
        window.open(url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2]">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center" style={{ fontFamily: "Fredoka" }}>
            Soutenir Whoof
          </DialogTitle>
          <DialogDescription className="text-center">
            Votre don nous aide à maintenir l'infrastructure, l'hébergement de l'application 
            et à développer de nouvelles fonctionnalités et partenariats associatifs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Suggested Amounts */}
          <div className="space-y-3">
            <Label>Montant suggéré</Label>
            <div className="grid grid-cols-4 gap-2">
              {SUGGESTED_AMOUNTS.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={selectedSuggested === value ? "default" : "outline"}
                  className="rounded-xl font-semibold"
                  onClick={() => handleAmountClick(value)}
                  style={
                    selectedSuggested === value
                      ? { backgroundColor: "var(--brand-plum)", color: "white" }
                      : undefined
                  }
                >
                  {value}€
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Montant personnalisé</Label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Entrez un montant"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="rounded-xl pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
            </div>
          </div>

          {/* Current Amount Display */}
          <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-[#7B61FF]/10 to-[#FF5DA2]/10">
            <p className="text-sm text-muted-foreground mb-1">Montant du don</p>
            <p className="text-3xl font-bold" style={{ color: "var(--brand-plum)" }}>
              {amount.toFixed(2)}€
            </p>
          </div>

          {/* Donate Button */}
          <Button
            onClick={handleDonate}
            disabled={isLoading || amount < 1}
            className="w-full rounded-2xl text-white font-bold py-6 text-lg"
            style={{ backgroundColor: "var(--brand-plum)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" />
                Faire un don de {amount.toFixed(2)}€
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Vous serez redirigé vers une page de paiement sécurisée Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
