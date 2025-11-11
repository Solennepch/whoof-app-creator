import { motion } from "framer-motion";
import { Heart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchCounterProps {
  count: number;
  label?: string;
  showTrending?: boolean;
}

export function MatchCounter({ count, label = "Matches aujourd'hui", showTrending = true }: MatchCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (count > displayCount) {
      const timer = setTimeout(() => {
        setDisplayCount(displayCount + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
        <Heart className="h-4 w-4 text-primary fill-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground leading-none">{label}</span>
        <div className="flex items-center gap-1">
          <motion.span
            key={displayCount}
            initial={{ scale: 1.5, color: "hsl(var(--primary))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            className="text-lg font-bold leading-none"
          >
            {displayCount}
          </motion.span>
          {showTrending && count > 0 && (
            <TrendingUp className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
