import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/contexts/AccountContext';
import { User, Plus, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AccountSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSwitcher({ open, onOpenChange }: AccountSwitcherProps) {
  const { accounts, currentAccount, switchAccount } = useAccounts();
  const navigate = useNavigate();

  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
    onOpenChange(false);
  };

  const handleAddAccount = () => {
    onOpenChange(false);
    navigate('/pro/onboarding');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    navigate('/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Changer de compte</DialogTitle>
          <DialogDescription>
            Basculez entre vos profils sans vous déconnecter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountSwitch(account.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              disabled={account.id === currentAccount?.id}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={account.avatar} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{account.name}</p>
                  {account.type === 'pro' && (
                    <Badge variant="secondary" className="text-xs">
                      PRO
                    </Badge>
                  )}
                  {account.id === currentAccount?.id && (
                    <Badge variant="default" className="text-xs">
                      Actif
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.type === 'pro' ? 'Compte professionnel' : 'Compte personnel'}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleAddAccount}
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un compte
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter de tous les comptes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
