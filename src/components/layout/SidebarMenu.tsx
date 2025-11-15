import { useState, useEffect } from "react";
import { Building, Briefcase, Bug, Percent, User, Star, Gift, Crown, RefreshCw, Settings, Heart, MapPin } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AccountSwitcher } from "./AccountSwitcher";
import { useAccounts } from "@/contexts/AccountContext";

const isDev = import.meta.env.MODE !== "production";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarMenu({ open, onOpenChange }: SidebarMenuProps) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const { accounts } = useAccounts();
  const location = useLocation();

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

  // Debug section (dev only)
  const debugItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
  }> = [
    { to: "/debug/test-accounts", icon: User, label: "Comptes Test" },
    { to: "/debug/health", icon: Bug, label: "Debug Health" },
    { to: "/debug/feature-flags", icon: RefreshCw, label: "Feature Flags" },
  ];

  // Section 1: Ton compte
  const accountItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
    premium?: boolean;
  }> = [
    { to: "/my-profile", icon: User, label: "Mon profil" },
    { to: "/likes", icon: Heart, label: "Mes likes", premium: true },
    { to: "/recompenses", icon: Gift, label: "Récompenses" },
    { to: "/astro-dog", icon: Star, label: "Astro Dog" },
  ];

  // Section 2: Découvrir & sortir
  const discoverItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
  }> = [
    { to: "/social-events", icon: MapPin, label: "Balades & événements" },
    { to: "/annuaire", icon: Building, label: "Annuaire Pro" },
    { to: "/partenariats", icon: Percent, label: "Bons plans" },
  ];

  // Section 3: Application
  const appItems: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
  }> = [
    { to: "/settings", icon: Settings, label: "Paramètres" },
  ];

  // Add Pro access dynamically
  if (isPro) {
    appItems.push({ to: "/pro/home", icon: Briefcase, label: "Espace Pro" });
  } else {
    appItems.push({ to: "/pro/onboarding", icon: Gift, label: "Devenir Pro" });
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
            <div className="flex flex-col gap-4">
              {/* Debug section (dev only) */}
              {isDev && (
                <div className="space-y-1">
                  {debugItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={() => onOpenChange(false)}
                        className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted ${
                          isActive ? 'bg-muted text-primary font-medium' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                  <div className="my-2 h-px bg-muted" />
                </div>
              )}

              {/* Section 1: Ton compte */}
              <div className="space-y-1">
                <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Ton compte
                </p>
                {accountItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => onOpenChange(false)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted ${
                        isActive ? 'bg-muted text-primary font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.premium && <Crown className="h-3 w-3 text-amber-400" />}
                    </NavLink>
                  );
                })}
              </div>

              {/* Section 2: Découvrir */}
              <div className="space-y-1">
                <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Découvrir
                </p>
                {discoverItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => onOpenChange(false)}
                      className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted ${
                        isActive ? 'bg-muted text-primary font-medium' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Section 3: Application */}
              <div className="space-y-1">
                <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Application
                </p>
                {appItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => onOpenChange(false)}
                      className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted ${
                        isActive ? 'bg-muted text-primary font-medium' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
