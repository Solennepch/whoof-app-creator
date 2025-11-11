import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, Users, Briefcase, Mail, Bell, TestTube, Beaker, Shield, ShieldCheck, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AdminSidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSidebarMenu({ open, onOpenChange }: AdminSidebarMenuProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const adminSections = [
    {
      title: "🐛 Développement",
      items: [
        { to: "/debug/test-accounts", icon: Beaker, label: "Comptes Test" },
        { to: "/debug/health", icon: TestTube, label: "Debug Health" },
      ]
    },
    {
      title: "Vue d'ensemble",
      items: [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard Admin" },
      ]
    },
    {
      title: "Gestion Utilisateurs",
      items: [
        { to: "/admin/users", icon: Users, label: "Utilisateurs" },
        { to: "/admin/professionals", icon: Briefcase, label: "Professionnels" },
        { to: "/admin/moderation", icon: Shield, label: "Modération" },
        { to: "/admin/roles", icon: ShieldCheck, label: "Rôles & Permissions" },
      ]
    },
    {
      title: "Contenu & Communication",
      items: [
        { to: "/admin/astrodog-cms", icon: Star, label: "AstroDog CMS" },
        { to: "/admin/email-templates", icon: Mail, label: "Templates Email" },
        { to: "/admin/notification-dashboard", icon: Bell, label: "Notifications" },
        { to: "/admin/ab-testing", icon: TestTube, label: "A/B Testing" },
      ]
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold">
            🛠️ Admin Panel
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-8 space-y-6">
          {adminSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onOpenChange(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Se déconnecter
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
