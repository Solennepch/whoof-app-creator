import { useState, useEffect } from "react";
import { Dog, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { XpProgress } from "@/components/ui/XpProgress";
import { CongratsModal } from "@/components/ui/CongratsModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SidebarMenu } from "./SidebarMenu";

export function Navbar() {
  const [xp, setXp] = useState(850);
  const [showCongrats, setShowCongrats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addXp = () => {
    const newXp = xp + 200;
    setXp(newXp);
    if (newXp >= 1200 && xp < 1200) {
      setShowCongrats(true);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white shadow-soft">
        <div className="mx-auto max-w-7xl px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
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

      </nav>

      <SidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <CongratsModal open={showCongrats} level={2} onClose={() => setShowCongrats(false)} />
    </>
  );
}
