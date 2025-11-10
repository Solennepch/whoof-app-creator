import { NavLink, useLocation } from "react-router-dom";
import { Map, Heart, MessageCircle, Calendar, Trophy } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  
  // Don't show on pro routes
  if (location.pathname.startsWith('/pro')) {
    return null;
  }

  const navItems = [
    { to: "/map", icon: Map, label: "Explore" },
    { to: "/discover", icon: Heart, label: "Matche" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
    { to: "/events", icon: Calendar, label: "Agenda" },
    { to: "/ranking", icon: Trophy, label: "Classement" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full overflow-hidden" 
      style={{
        backgroundColor: "hsl(var(--paper))",
        opacity: 1,
        borderTop: "1px solid hsl(var(--border))",
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
              end
              className="flex-1 min-w-0"
              style={{ flex: "1 1 20%" }}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-1 py-2 transition-all duration-300">
                  <Icon 
                    className="w-6 h-6 max-w-full transition-colors duration-300" 
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--brand-rose-woof))" 
                        : "hsl(var(--brand-violet-woof))",
                      fill: isActive ? "hsl(var(--brand-rose-woof))" : "none"
                    }}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  <span 
                    className="text-xs font-medium transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis text-center w-full px-1"
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--brand-rose-woof))" 
                        : "hsl(var(--brand-violet-woof))",
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
