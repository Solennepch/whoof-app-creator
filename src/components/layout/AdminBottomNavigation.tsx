import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Shield, Mail, TestTube } from "lucide-react";

export function AdminBottomNavigation() {
  const location = useLocation();
  
  // Only show on admin/debug routes
  if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/debug')) {
    return null;
  }

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/users", icon: Users, label: "Utilisateurs" },
    { to: "/admin/moderation", icon: Shield, label: "Modération" },
    { to: "/admin/email-templates", icon: Mail, label: "Emails" },
    { to: "/debug/test-accounts", icon: TestTube, label: "Tests" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full overflow-hidden bg-background border-t border-border" 
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        paddingTop: "8px",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="flex items-center justify-between w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex-1 min-w-0"
              style={{ flex: "1 1 20%" }}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-1 py-2 transition-all duration-300">
                  <Icon 
                    className="w-6 h-6 max-w-full transition-colors duration-300" 
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--primary))" 
                        : "hsl(var(--muted-foreground))",
                      fill: isActive ? "hsl(var(--primary))" : "none"
                    }}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  <span 
                    className="text-xs font-medium transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis text-center w-full px-1"
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--primary))" 
                        : "hsl(var(--muted-foreground))",
                      lineHeight: "1"
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
