import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Building, Briefcase, Bug, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarMenu({ open, onOpenChange }: SidebarMenuProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        const { data: proAccount } = await supabase
          .from('pro_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsPro(!!proAccount);
      } catch (error) {
        console.error('Error checking user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserRoles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const menuItems = [
    { to: "/annuaire", icon: Building, label: "Annuaire" },
    { 
      to: isPro ? "/pro/dashboard" : "/pro/onboarding", 
      icon: Briefcase, 
      label: isPro ? "Espace Pro" : "Devenir partenaire" 
    },
  ];

  // Add debug item only for admins
  const isDev = import.meta.env.DEV || window.location.hostname.includes('lovable.app');
  if (isDev && isAdmin) {
    menuItems.push({ to: "/debug/health", icon: Bug, label: "Debug" });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Menu</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : (
            menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
