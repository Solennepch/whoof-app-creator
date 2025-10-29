import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountContext';
import { AccountSwitcher } from './AccountSwitcher';
import { cn } from '@/lib/utils';

interface AvatarWithSwitchProps {
  className?: string;
}

export function AvatarWithSwitch({ className }: AvatarWithSwitchProps) {
  const { accounts, currentAccount, switchAccount } = useAccounts();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTapCount(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleTap = () => {
    const now = Date.now();
    
    if (now - lastTapTime < 400) {
      // Double-tap détecté
      setTapCount(tapCount + 1);
      
      if (accounts.length === 0) {
        return;
      }

      if (accounts.length === 1) {
        return; // Un seul compte, rien à faire
      }

      if (accounts.length === 2) {
        // Switch direct entre les 2 comptes
        const otherAccount = accounts.find(a => a.id !== currentAccount?.id);
        if (otherAccount) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 300);
          switchAccount(otherAccount.id);
        }
      } else {
        // Plus de 2 comptes, ouvrir la modal
        setShowSwitcher(true);
      }
    } else {
      setTapCount(1);
    }
    
    setLastTapTime(now);
  };

  if (accounts.length === 0 || !currentAccount) {
    return null;
  }

  return (
    <>
      <div
        onClick={handleTap}
        className={cn(
          "cursor-pointer transition-transform",
          animate && "scale-90",
          className
        )}
      >
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={currentAccount.avatar} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>

      <AccountSwitcher open={showSwitcher} onOpenChange={setShowSwitcher} />
    </>
  );
}
