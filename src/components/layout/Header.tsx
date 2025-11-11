import { useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarMenu } from "./SidebarMenu";
import { ProSidebarMenu } from "./ProSidebarMenu";
import { AdminSidebarMenu } from "./AdminSidebarMenu";
import { QuickSwitchButton } from "./QuickSwitchButton";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import logoWhoof from "@/assets/logo-whoof-v3.png";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isProRoute = location.pathname.startsWith('/pro');
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/debug');

  return (
    <>
      <header 
        className="sticky top-0 z-50 shadow-soft backdrop-blur-sm bg-background border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
              
              <div className="flex items-center gap-2">
                <img 
                  src={logoWhoof} 
                  alt="Whoof Apps Logo" 
                  className="h-10 w-10"
                />
                <span className="text-xl font-bold text-foreground">
                  Whoof Apps
                </span>
                {isProRoute && (
                  <Badge 
                    className="text-white font-bold text-xs"
                    style={{ background: "linear-gradient(90deg, #7B61FF, #FF5DA2)" }}
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdminRoute && <AdminNotificationBell />}
              {!isAdminRoute && <QuickSwitchButton />}
            </div>
          </div>
        </div>
      </header>

      {isAdminRoute ? (
        <AdminSidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      ) : isProRoute ? (
        <ProSidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      ) : (
        <SidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
      )}
    </>
  );
}
