import { useState, useEffect } from "react";
import { Dog, Home, Compass, Calendar, MapPin, User, Building, Percent, Briefcase, Bug } from "lucide-react";
import { NavLink } from "react-router-dom";
import { XpProgress } from "@/components/ui/XpProgress";
import { CongratsModal } from "@/components/ui/CongratsModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [xp, setXp] = useState(850);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('pro_accounts')
            .select('id')
            .eq('user_id', user.id)
            .single();
          setIsPro(!!data);
        }
      } catch (error) {
        console.error('Error checking pro status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkProStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addXp = () => {
    const newXp = xp + 200;
    setXp(newXp);
    if (newXp >= 1200 && xp < 1200) {
      setShowCongrats(true);
    }
  };

  const baseNavItems = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/discover", icon: Compass, label: "Découvrir" },
    { to: "/annuaire", icon: Building, label: "Annuaire" },
    { to: "/partenariats", icon: Percent, label: "Partenariats" },
    { to: "/events", icon: Calendar, label: "Événements" },
    { to: "/map", icon: MapPin, label: "Carte" },
    { to: "/profile/me", icon: User, label: "Profil" },
  ];

  const proNavItem = isPro
    ? { to: "/pro/dashboard", icon: Briefcase, label: "Espace Pro" }
    : { to: "/pro/onboarding", icon: Briefcase, label: "Devenir partenaire" };

  // Debug link (visible only in dev/preview)
  const isDev = import.meta.env.DEV || window.location.hostname.includes('lovable.app');
  const debugNavItem = isDev ? { to: "/debug/health", icon: Bug, label: "Debug" } : null;

  const navItems = isLoading 
    ? baseNavItems 
    : [...baseNavItems, proNavItem, ...(debugNavItem ? [debugNavItem] : [])];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white shadow-soft">
        <div className="mx-auto max-w-7xl px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm"
                style={{
                  background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)",
                }}
              >
                <Dog className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                Whoof
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <Button
              onClick={addXp}
              size="sm"
              className="rounded-2xl"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              +XP
            </Button>
          </div>

          {/* XP Progress Bar */}
          <div className="pb-3">
            <div className="rounded-2xl bg-paper p-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold" style={{ color: "var(--ink)" }}>
                  Niveau 2
                </span>
                <span style={{ color: "var(--ink)", opacity: 0.6 }}>
                  {xp - 500}/{1200 - 500} XP
                </span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((xp - 500) / (1200 - 500)) * 100)}%`,
                    backgroundColor: "var(--brand-plum)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-white">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <CongratsModal open={showCongrats} level={2} onClose={() => setShowCongrats(false)} />
    </>
  );
}
