import { Crown } from "lucide-react";
import { motion } from "framer-motion";

export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-accent via-primary to-secondary text-white text-xs font-bold shadow-glow ${className}`}
    >
      <Crown className="h-3 w-3" />
      Premium
    </motion.div>
  );
}

export function PremiumTooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-xs font-semibold rounded-xl shadow-soft opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Fonctionnalité Premium
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </div>
    </div>
  );
}
