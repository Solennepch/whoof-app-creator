import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/contexts/AccountContext";
import { toast } from "sonner";

export function QuickSwitchButton() {
  const { accounts, currentAccount, switchAccount } = useAccounts();
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);

  // Vérifie si l'utilisateur a à la fois un compte user ET un compte pro
  const hasUserAccount = accounts.some(a => a.type === 'user');
  const hasProAccount = accounts.some(a => a.type === 'pro');
  const hasBothAccounts = hasUserAccount && hasProAccount;

  // Ne pas afficher le bouton si l'utilisateur n'a pas les deux types de comptes
  if (!hasBothAccounts) return null;

  const handleClick = () => {
    setTapCount(prev => prev + 1);

    // Clear le timer précédent s'il existe
    if (tapTimer) {
      clearTimeout(tapTimer);
    }

    // Nouveau timer pour réinitialiser le compteur
    const timer = setTimeout(() => {
      setTapCount(0);
    }, 400); // 400ms pour détecter le double-clic

    setTapTimer(timer);
  };

  useEffect(() => {
    // Si double-clic détecté
    if (tapCount === 2) {
      // Trouver l'autre compte (switch entre user et pro)
      const otherAccount = accounts.find(a => 
        a.type !== currentAccount?.type
      );

      if (otherAccount) {
        switchAccount(otherAccount.id);
      }

      // Réinitialiser
      setTapCount(0);
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
    }
  }, [tapCount, accounts, currentAccount, switchAccount, tapTimer]);

  // Cleanup du timer
  useEffect(() => {
    return () => {
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
    };
  }, [tapTimer]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="rounded-2xl hover:bg-muted/50 transition-all"
      title="Double-cliquez pour changer de compte"
    >
      <RefreshCw 
        className="h-5 w-5 transition-transform hover:rotate-180 duration-300" 
        style={{ color: "hsl(var(--primary))" }}
      />
    </Button>
  );
}
