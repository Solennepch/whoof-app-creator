import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Mode d'affichage</span>
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted">
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className="rounded-xl h-8 w-8 p-0"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="rounded-xl h-8 w-8 p-0"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
