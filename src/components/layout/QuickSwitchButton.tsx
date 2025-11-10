import { Building2, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAccounts } from "@/contexts/AccountContext";

export function QuickSwitchButton() {
  const { accounts, currentAccount, switchAccount } = useAccounts();

  // Vérifie si l'utilisateur a à la fois un compte user ET un compte pro
  const hasUserAccount = accounts.some(a => a.type === 'user');
  const hasProAccount = accounts.some(a => a.type === 'pro');
  const hasBothAccounts = hasUserAccount && hasProAccount;

  // Trouver l'autre compte (celui vers lequel on va basculer)
  const otherAccount = accounts.find(a => 
    a.type !== currentAccount?.type
  );

  const handleClick = () => {
    if (otherAccount) {
      switchAccount(otherAccount.id);
    }
  };

  // Ne pas afficher le bouton si l'utilisateur n'a pas les deux types de comptes
  if (!hasBothAccounts || !otherAccount) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="p-0 rounded-full hover:opacity-80 transition-all h-10 w-10"
      title={`Basculer vers ${otherAccount.name}`}
    >
      <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarImage src={otherAccount.avatar} alt={otherAccount.name} />
        <AvatarFallback className="bg-primary/10">
          {otherAccount.type === 'pro' ? (
            <Building2 className="h-5 w-5 text-primary" />
          ) : (
            <Dog className="h-5 w-5 text-primary" />
          )}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
}
