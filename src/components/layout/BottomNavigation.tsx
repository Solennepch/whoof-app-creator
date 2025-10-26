import { NavLink } from "react-router-dom";

export function BottomNavigation() {
  const navItems = [
    { to: "/map", icon: "📍", label: "Carte" },
    { to: "/discover", icon: "🔍", label: "Découvrir" },
    { to: "/events", icon: "📅", label: "Événements" },
    { to: "/profile/me", icon: "👤", label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs transition ${
                isActive 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground"
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
