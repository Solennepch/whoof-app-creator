import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoneParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
}

interface AnimatedLikeButtonProps {
  isLiked: boolean;
  isLoading: boolean;
  onLike: () => void;
  className?: string;
  disabled?: boolean;
}

export function AnimatedLikeButton({
  isLiked,
  isLoading,
  onLike,
  className,
  disabled = false,
}: AnimatedLikeButtonProps) {
  const [particles, setParticles] = useState<BoneParticle[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5, // gravity
            rotation: p.rotation + 5,
            scale: p.scale * 0.98, // fade out
          }))
          .filter((p) => p.scale > 0.1 && p.y < 200)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length]);

  const handleClick = () => {
    const now = Date.now();
    
    // Throttle: prevent clicks within 1 second
    if (now - lastClickTime < 1000) {
      return;
    }

    setLastClickTime(now);
    onLike();

    // Create bone particles animation (skip if reduced motion)
    if (!prefersReducedMotion && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const newParticles: BoneParticle[] = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 3 + Math.random() * 2;
        return {
          id: Date.now() + i,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 2,
          rotation: Math.random() * 360,
          scale: 0.8 + Math.random() * 0.4,
        };
      });

      setParticles(newParticles);

      // Clear particles after animation
      setTimeout(() => {
        setParticles([]);
      }, 2000);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="icon"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "rounded-full transition-all duration-200",
          isLiked && "bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 border-0",
          !isLiked && "border-2 hover:border-pink-500",
          className
        )}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Retirer le like" : "Aimer ce profil"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLiked ? "liked" : "unliked"}
            initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: isLoading ? [1, 1.25, 1] : 1,
                    opacity: 1,
                  }
            }
            exit={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                isLiked && "fill-current text-white",
                !isLiked && "text-pink-500"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </Button>

      {/* Bone Particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute text-2xl"
              style={{
                left: particle.x,
                top: particle.y,
                transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
                opacity: particle.scale,
              }}
            >
              🦴
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
