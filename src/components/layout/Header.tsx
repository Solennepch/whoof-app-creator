import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenu } from "./SidebarMenu";
import logoWhoof from "@/assets/logo-whoof-v3.png";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header 
        className="sticky top-0 z-50 shadow-soft backdrop-blur-sm" 
        style={{ 
          backgroundColor: "hsl(var(--paper))",
          borderBottom: "1px solid hsl(var(--border))"
        }}
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
                <Menu className="h-5 w-5" style={{ color: "hsl(var(--ink))" }} />
              </Button>
              
              <div className="flex items-center gap-2">
                <img 
                  src={logoWhoof} 
                  alt="Whoof Apps Logo" 
                  className="h-10 w-10"
                />
                <span className="text-xl font-bold" style={{ color: "hsl(var(--ink))" }}>
                  Whoof Apps
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
