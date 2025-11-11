import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  DollarSign, 
  Tag, 
  Star, 
  Calendar, 
  Users, 
  Gift, 
  Settings, 
  HelpCircle, 
  LogOut,
  CreditCard,
  Bell,
  QrCode,
  RefreshCw
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccountSwitcher } from "./AccountSwitcher";
import { useAccounts } from "@/contexts/AccountContext";
import { ProTierBadge } from "@/components/pro/ProTierBadge";
import { useProSubscriptionStatus } from "@/hooks/useProSubscription";

interface ProSidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProSidebarMenu({ open, onOpenChange }: ProSidebarMenuProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const { accounts } = useAccounts();
  const { data: subscription } = useProSubscriptionStatus();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: proProfile } = await supabase
          .from('pro_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfile(proProfile);
      } catch (error) {
        console.error('Error loading pro profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadProfile();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
  };

  const activitySection = [
    { to: "/pro/dashboard", icon: LayoutDashboard, label: "Tableau de bord complet" },
    { to: "/pro/stats", icon: DollarSign, label: "Statistiques & Analytics" },
    { to: "/pro/services", icon: Settings, label: "Mes services et tarifs" },
    { to: "/pro/offers", icon: Tag, label: "Mes offres et promotions" },
    { to: "/pro/reviews", icon: Star, label: "Mes avis clients" },
    { to: "/pro/appointments", icon: Calendar, label: "Mes rendez-vous" },
  ];

  const communitySection = [
    { to: "/pro/community", icon: Users, label: "Groupes / forums pros" },
    { to: "/pro/events", icon: Calendar, label: "Événements / salons canins" },
    { to: "/pro/partners", icon: Gift, label: "Offres partenaires" },
  ];

  const settingsSection = [
    { to: "/pro/settings", icon: Settings, label: "Profil et identité" },
    { to: "/pro/notifications", icon: Bell, label: "Notifications & préférences" },
    { to: "/pro/payments", icon: CreditCard, label: "Moyens de paiement" },
    { to: "/pro/help", icon: HelpCircle, label: "Aide et support" },
  ];

  return (
    <>
      <AccountSwitcher open={showAccountSwitcher} onOpenChange={setShowAccountSwitcher} />
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#FF5DA2]">
              Whoof Apps
            </span>
            <Badge 
              className="text-white font-bold"
              style={{ background: "linear-gradient(90deg, #7B61FF, #FF5DA2)" }}
            >
              PRO
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Profile Header */}
        {!isLoading && profile && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                  <AvatarImage src={profile.logo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2] text-white">
                    {profile.business_name?.[0] || 'P'}
                  </AvatarFallback>
                </Avatar>
                <Badge 
                  className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-white text-[10px] border-2 border-white"
                  style={{ background: "linear-gradient(90deg, #7B61FF, #FF5DA2)" }}
                >
                  P
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{profile.business_name}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {profile.activity}
                </p>
              </div>
            </div>
            {subscription?.tier && (
              <div className="flex justify-center">
                <ProTierBadge tier={subscription.tier} />
              </div>
            )}
          </div>
        )}

        {/* Account Switcher */}
        {accounts.length > 1 && (
          <button
            onClick={() => {
              onOpenChange(false);
              setShowAccountSwitcher(true);
            }}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent text-left border"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="font-semibold">Changer de compte</span>
          </button>
        )}

        <div className="mt-6 space-y-6">
          {/* Mon activité */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Mon activité
            </h3>
            <div className="space-y-1">
              {activitySection.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <Separator />

          {/* Communauté & partenaires */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Communauté & partenaires
            </h3>
            <div className="space-y-1">
              {communitySection.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <Separator />

          {/* Paramètres */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Paramètres
            </h3>
            <div className="space-y-1">
              {settingsSection.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
