import { useState } from "react";
import { Dog, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenu } from "./SidebarMenu";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper shadow-soft" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
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
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--brand-plum)) 0%, hsl(var(--brand-raspberry)) 100%)",
                  }}
                >
                  <Dog className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: "hsl(var(--ink))" }}>
                  Whoof
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
