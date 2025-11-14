import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./button";

interface SwipeTutorialProps {
  show: boolean;
  onClose: () => void;
}

export function SwipeTutorial({ show, onClose }: SwipeTutorialProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto max-h-[85vh] overflow-y-auto"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Comment swiper ?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Glisse la carte pour découvrir des copains
              </p>

              <div className="space-y-4 mb-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 p-3 bg-destructive/10 rounded-xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Swipe à gauche</p>
                    <p className="text-xs text-muted-foreground">Pour passer au suivant</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Swipe à droite</p>
                    <p className="text-xs text-muted-foreground">Pour liker et matcher</p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-1">
                    <X className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Passer</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Liker</span>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full"
                size="lg"
              >
                J'ai compris !
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
