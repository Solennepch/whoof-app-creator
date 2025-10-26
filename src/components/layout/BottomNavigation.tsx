import { NavLink } from "react-router-dom";
import { Map, Heart, MessageCircle, Calendar, User } from "lucide-react";

export function BottomNavigation() {
  const navItems = [
    { to: "/map", icon: Map, label: "Explore" },
    { to: "/discover", icon: Heart, label: "Matche" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
    { to: "/events", icon: Calendar, label: "Agenda" },
    { to: "/profile/me", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper shadow-soft md:hidden" style={{ borderTop: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="relative group"
            >
              {({ isActive }) => (
                <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                  isActive ? '' : 'group-hover:-translate-y-0.5'
                }`}>
                  <Icon 
                    className="h-6 w-6 transition-colors duration-300" 
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--brand-raspberry))" 
                        : "hsl(var(--ink) / 0.6)",
                      fill: isActive ? "hsl(var(--brand-raspberry))" : "none"
                    }}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  <span 
                    className="text-xs font-medium transition-colors duration-300"
                    style={{ 
                      color: isActive 
                        ? "hsl(var(--brand-raspberry))" 
                        : "hsl(var(--ink) / 0.6)"
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
