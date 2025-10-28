import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import pawIcon from "@/assets/paw-icon.png";

interface MatchAnimationProps {
  show: boolean;
  onComplete: () => void;
  matchedName?: string;
}

interface PawPrint {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  side: 'left' | 'right';
}

export function MatchAnimation({ show, onComplete, matchedName = "Charlie" }: MatchAnimationProps) {
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);

  useEffect(() => {
    if (show) {
      // Generate paw prints walking pattern
      const prints: PawPrint[] = [];
      const numPaws = 8;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      for (let i = 0; i < numPaws; i++) {
        const isLeft = i % 2 === 0;
        prints.push({
          id: i,
          x: (screenWidth / numPaws) * i,
          y: screenHeight * 0.3 + (isLeft ? -20 : 20),
          rotation: isLeft ? -15 : 15,
          delay: i * 0.15,
          side: isLeft ? 'left' : 'right'
        });
      }
      
      setPawPrints(prints);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setPawPrints([]);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Paw prints walking */}
          {pawPrints.map((paw) => (
            <motion.img
              key={paw.id}
              src={pawIcon}
              alt="Paw print"
              className="absolute w-16 h-16"
              initial={{
                x: paw.x,
                y: paw.y + 100,
                opacity: 0,
                scale: 0,
                rotate: paw.rotation,
              }}
              animate={{
                x: paw.x,
                y: paw.y,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.8],
                rotate: paw.rotation,
              }}
              transition={{
                duration: 1.5,
                delay: paw.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Match card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.5 
            }}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center"
          >
            {/* Heart icon with pulse */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 0.2
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ 
                background: "linear-gradient(135deg, #FF5DA2 0%, #FF8EC7 100%)" 
              }}
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>

            {/* Match text */}
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ 
                fontFamily: "Fredoka",
                background: "linear-gradient(135deg, #FF5DA2 0%, #7B61FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              C'est un Match ! 🎉
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Toi et <span className="font-semibold text-foreground">{matchedName}</span> vous êtes likés mutuellement !
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full py-3 px-6 rounded-2xl text-white font-semibold"
              style={{ backgroundColor: "#FF5DA2" }}
            >
              Envoyer un message
            </motion.button>

            <button
              onClick={onComplete}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuer à swiper
            </button>
          </motion.div>

          {/* Confetti hearts */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              className="absolute"
              initial={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 400,
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                delay: 0.8 + Math.random() * 0.5,
                ease: "easeOut",
              }}
            >
              <Heart 
                className="w-6 h-6 text-pink-400 fill-pink-400" 
                style={{ 
                  filter: "drop-shadow(0 0 8px rgba(255, 93, 162, 0.6))" 
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
