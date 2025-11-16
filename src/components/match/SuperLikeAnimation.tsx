import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface SuperLikeAnimationProps {
  show: boolean;
  onComplete: () => void;
  dogName?: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

export function SuperLikeAnimation({ show, onComplete, dogName }: SuperLikeAnimationProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate sparkles around the star
      const sparks: Sparkle[] = [];
      const numSparkles = 20;
      
      for (let i = 0; i < numSparkles; i++) {
        const angle = (i / numSparkles) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        sparks.push({
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: i * 0.05,
          size: 8 + Math.random() * 16
        });
      }
      
      setSparkles(sparks);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setSparkles([]);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Sparkles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: sparkle.x,
                y: sparkle.y,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: sparkle.delay,
                ease: "easeOut",
              }}
            >
              <Sparkles 
                className="text-yellow-400" 
                style={{ 
                  width: sparkle.size, 
                  height: sparkle.size,
                  filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))"
                }} 
              />
            </motion.div>
          ))}

          {/* Central star with glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: [0, 360, 360]
            }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
            className="relative"
          >
            {/* Glow effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: "radial-gradient(circle, rgba(250, 204, 21, 0.6) 0%, transparent 70%)",
                transform: "scale(2)"
              }}
            />

            {/* Star card */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.3
              }}
              className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl"
              style={{
                boxShadow: "0 0 60px rgba(250, 204, 21, 0.5), 0 0 100px rgba(249, 115, 22, 0.3)"
              }}
            >
              {/* Star icon with multiple layers for depth */}
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                {/* Background stars */}
                <Star className="absolute inset-0 w-24 h-24 text-yellow-200 fill-yellow-200 blur-sm opacity-50" />
                <Star className="absolute inset-0 w-24 h-24 text-white fill-white blur-md opacity-30" />
                
                {/* Main star */}
                <Star className="relative w-24 h-24 text-white fill-white drop-shadow-2xl" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Super Like text */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute bottom-32 text-center"
          >
            <motion.h2 
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="text-4xl font-bold text-white mb-2"
              style={{ 
                textShadow: "0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(249, 115, 22, 0.5)",
              }}
            >
              ⭐ Super Like! ⭐
            </motion.h2>
            {dogName && (
              <p className="text-xl text-white/90 font-medium">
                Tu as envoyé un Super Like à {dogName}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
