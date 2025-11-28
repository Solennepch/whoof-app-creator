import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface Account {
  id: string;
  type: 'user' | 'pro';
  name: string;
  avatar?: string;
  userId: string;
}

interface AccountContextType {
  accounts: Account[];
  currentAccount: Account | null;
  switchAccount: (accountId: string) => void;
  loadAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const navigate = useNavigate();

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const accountsList: Account[] = [];

    // Charger le profil personnel
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      accountsList.push({
        id: `user_${user.id}`,
        type: 'user',
        name: profile.display_name || 'Mon profil',
        avatar: profile.avatar_url || undefined,
        userId: user.id,
      });
    }

    // Charger les profils pro
    const { data: proProfiles } = await supabase
      .from('pro_profiles')
      .select('*')
      .eq('user_id', user.id);

    if (proProfiles) {
      proProfiles.forEach((pro) => {
        accountsList.push({
          id: `pro_${pro.id}`,
          type: 'pro',
          name: pro.business_name,
          avatar: pro.logo_url || undefined,
          userId: user.id,
        });
      });
    }

    setAccounts(accountsList);

    // Récupérer le compte actif depuis localStorage ou utiliser le premier
    const savedAccountId = localStorage.getItem('currentAccountId');
    const currentAcc = savedAccountId 
      ? accountsList.find(a => a.id === savedAccountId) || accountsList[0]
      : accountsList[0];

    if (currentAcc) {
      setCurrentAccount(currentAcc);
      localStorage.setItem('currentAccountId', currentAcc.id);
    }
  };

  const switchAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    setCurrentAccount(account);
    localStorage.setItem('currentAccountId', accountId);

    // Navigation vers la page appropriée
    if (account.type === 'pro') {
      navigate('/pro/home');
    } else {
      navigate('/home');
    }

    toast.success(`Vous utilisez Pawtes en tant que ${account.name}`);
  };

  useEffect(() => {
    loadAccounts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAccounts();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AccountContext.Provider value={{ accounts, currentAccount, switchAccount, loadAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
