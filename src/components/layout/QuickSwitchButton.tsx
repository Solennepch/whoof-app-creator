import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/contexts/AccountContext";

export function QuickSwitchButton() {
  const { accounts, currentAccount, switchAccount } = useAccounts();

  // Vérifie si l'utilisateur a à la fois un compte user ET un compte pro
  const hasUserAccount = accounts.some(a => a.type === 'user');
  const hasProAccount = accounts.some(a => a.type === 'pro');
  const hasBothAccounts = hasUserAccount && hasProAccount;

  const handleClick = () => {
    // Trouver l'autre compte (switch entre user et pro)
    const otherAccount = accounts.find(a => 
      a.type !== currentAccount?.type
    );

    if (otherAccount) {
      switchAccount(otherAccount.id);
    }
  };

  // Ne pas afficher le bouton si l'utilisateur n'a pas les deux types de comptes
  if (!hasBothAccounts) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="rounded-2xl hover:bg-muted/50 transition-all"
      title="Cliquez pour changer de compte"
    >
      <RefreshCw 
        className="h-5 w-5 transition-transform hover:rotate-180 duration-300" 
        style={{ color: "hsl(var(--primary))" }}
      />
    </Button>
  );
}
