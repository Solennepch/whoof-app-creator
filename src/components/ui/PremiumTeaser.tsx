import { motion } from "framer-motion";
import { Eye, Crown, Sparkles } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

interface PremiumTeaserProps {
  blurredCount: number;
  className?: string;
}

export function PremiumTeaser({ blurredCount, className = "" }: PremiumTeaserProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 ${className}`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent via-primary to-secondary flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Likes reçus</h3>
              <p className="text-xs text-muted-foreground">Voir qui t'aime</p>
            </div>
          </div>
          <Crown className="h-6 w-6 text-accent" />
        </div>

        {/* Blurred count */}
        <div className="relative mb-4">
          <div className="text-center py-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl font-bold text-foreground relative inline-block"
            >
              <span className="blur-sm select-none">{blurredCount}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-pulse" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">
              {blurredCount > 1 ? "personnes ont" : "personne a"} liké ton profil
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate("/premium")}
          className="w-full relative overflow-hidden group"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>Devenir Premium</span>
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          ✨ Essai gratuit 24h • Sans engagement
        </p>
      </div>
    </motion.div>
  );
}
