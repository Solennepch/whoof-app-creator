import { useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarMenu } from "./SidebarMenu";
import { ProSidebarMenu } from "./ProSidebarMenu";
import { QuickSwitchButton } from "./QuickSwitchButton";
import logoWhoof from "@/assets/logo-whoof-official.png";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isProRoute = location.pathname.startsWith('/pro');
  const isDebugRoute = location.pathname.startsWith('/debug');

  return (
    <>
      <header 
        className="sticky top-0 z-50 shadow-soft backdrop-blur-sm bg-background border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 h-16 items-center">
            {/* Gauche: Menu burger */}
            <div className="flex items-center justify-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </div>
            
            {/* Centre: Pawtes + badges */}
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="text-xl font-bold text-foreground whitespace-nowrap">
                Pawtes
              </span>
              {isProRoute && (
                <Badge 
                  className="text-white font-bold text-xs"
                  style={{ background: "linear-gradient(90deg, #7B61FF, #FF5DA2)" }}
                >
                  PRO
                </Badge>
              )}
              {isDebugRoute && (
                <Badge variant="destructive" className="text-xs font-bold">
                  DEBUG
                </Badge>
              )}
            </div>

            {/* Droite: Logo + QuickSwitch */}
            <div className="flex items-center justify-end gap-3">
              {!isDebugRoute && (
                <QuickSwitchButton />
              )}
              <img 
                src={logoWhoof} 
                alt="Pawtes Logo" 
                className="h-10 w-10"
              />
            </div>
          </div>
        </div>
      </header>

      {isProRoute ? (
        <ProSidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      ) : (
        <SidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      )}
    </>
  );
}
