import { useState, useEffect } from "react";
import { Building, Briefcase, Bug, Percent, User, Star, Gift, Crown, RefreshCw, Settings, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AccountSwitcher } from "./AccountSwitcher";
import { useAccounts } from "@/contexts/AccountContext";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarMenu({ open, onOpenChange }: SidebarMenuProps) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const { accounts } = useAccounts();

  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check pro status
        const { data: proProfile } = await supabase
          .from('pro_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsPro(!!proProfile);
      } catch (error) {
        console.error('Error checking user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      checkUserRoles();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserRoles();
    });

    return () => subscription.unsubscribe();
  }, [open]);

  // Debug section
  const debugItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
    premium?: boolean;
  }> = [
    { to: "/debug/test-accounts", icon: User, label: "🔧 Comptes Test" },
    { to: "/debug/health", icon: Bug, label: "🔧 Debug Health" },
    { to: "/debug/feature-flags", icon: RefreshCw, label: "🔧 Feature Flags" },
  ];

  // Main user menu items
  const menuItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
    premium?: boolean;
  }> = [
    { to: "/profile/me", icon: User, label: "Mon Profil" },
    { to: "/likes", icon: Heart, label: "Mes Likes", premium: true },
    { to: "/recompenses", icon: Gift, label: "Récompenses" },
    { to: "/astro-dog", icon: Star, label: "Astro Dog" },
    { to: "/annuaire", icon: Building, label: "Annuaire Pro" },
    { to: "/partenariats", icon: Percent, label: "Bons Plans" },
    { to: "/settings", icon: Settings, label: "Paramètres" },
  ];

  // Add Pro access at the end
  if (isPro) {
    menuItems.push({ to: "/pro/home", icon: Briefcase, label: "🔷 Espace Pro" });
  } else {
    menuItems.push({ to: "/pro/onboarding", icon: Briefcase, label: "Devenir Pro" });
  }

  const allItems = [...debugItems, ...menuItems];

  return (
    <>
      <AccountSwitcher open={showAccountSwitcher} onOpenChange={setShowAccountSwitcher} />
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-2">
          {accounts.length > 1 && (
            <button
              onClick={() => {
                onOpenChange(false);
                setShowAccountSwitcher(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent w-full text-left border-b mb-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="font-semibold">Changer de compte</span>
            </button>
          )}

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : (
            allItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {'premium' in item && item.premium && (
                  <Crown className="h-3 w-3 ml-auto text-accent" />
                )}
              </NavLink>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
