import { motion } from "framer-motion";
import { Users, Home } from "lucide-react";

interface ModeToggleProps {
  mode: "region" | "adoption";
  onChange: (mode: "region" | "adoption") => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center bg-muted/50 backdrop-blur-sm rounded-2xl p-1 shadow-soft">
      <button
        onClick={() => onChange("region")}
        className="relative px-6 py-2 rounded-xl transition-all"
      >
        {mode === "region" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white rounded-xl shadow-soft"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className="relative flex items-center gap-2">
          <Users className={`h-4 w-4 ${mode === "region" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-sm font-semibold ${mode === "region" ? "text-foreground" : "text-muted-foreground"}`}>
            Ma région
          </span>
        </div>
      </button>
      
      <button
        onClick={() => onChange("adoption")}
        className="relative px-6 py-2 rounded-xl transition-all"
      >
        {mode === "adoption" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white rounded-xl shadow-soft"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className="relative flex items-center gap-2">
          <Home className={`h-4 w-4 ${mode === "adoption" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-sm font-semibold ${mode === "adoption" ? "text-foreground" : "text-muted-foreground"}`}>
            Adoption
          </span>
        </div>
      </button>
    </div>
  );
}
