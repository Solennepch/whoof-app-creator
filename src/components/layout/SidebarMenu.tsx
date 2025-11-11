import { useState, useEffect } from "react";
import { Building, Briefcase, Bug, Percent, User, Star, Gift, Crown, Shield, RefreshCw, Settings, Heart } from "lucide-react";
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
  const [isAdmin, setIsAdmin] = useState(false);
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

        // Check admin role
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!adminRole);

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

  const menuItems: Array<{ to: string; icon: any; label: string; premium?: boolean }> = [
    // Debug links at the top for quick access
    { to: "/debug/test-accounts", icon: Bug, label: "🐛 Comptes Test" },
  ];

  // Add admin debug link only for admins
  if (isAdmin) {
    menuItems.push({ to: "/debug/health", icon: Bug, label: "🔧 Debug Health" });
    menuItems.push({ to: "/admin/moderation", icon: Shield, label: "Modération" });
  }

  // Main menu items
  menuItems.push(
    { to: "/profile/me", icon: User, label: "Profil" },
    { to: "/likes", icon: Heart, label: "Mes Likes", premium: true },
    { to: "/annuaire", icon: Building, label: "Annuaire" },
    { to: "/partenariats", icon: Percent, label: "Bons plans" },
    { to: "/recompenses", icon: Gift, label: "Récompenses" },
    { to: "/astro-dog", icon: Star, label: "Mon Astro Dog" },
    { to: "/settings", icon: Settings, label: "Paramètres" }
  );

  // Add Pro Dashboard only if user is pro
  if (isPro) {
    menuItems.push({ to: "/pro/home", icon: Briefcase, label: "Espace Pro" });
  } else {
    menuItems.push({ to: "/pro/onboarding", icon: Briefcase, label: "Devenir Pro" });
  }

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
            menuItems.map((item) => (
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
