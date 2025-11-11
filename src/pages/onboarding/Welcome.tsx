import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Users, Home } from "lucide-react";
import logoWhoof from "@/assets/logo-whoof-v3.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.img
            src={logoWhoof}
            alt="Whoof Logo"
            className="h-24 w-24 mx-auto mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <h1 className="text-4xl font-bold mb-2">
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Whoof
            </span>
          </h1>
          <p className="text-muted-foreground">
            La communauté qui connecte les chiens et leurs humains
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Trouve des copains</h3>
              <p className="text-sm text-muted-foreground">
                Matche avec des chiens compatibles dans ta région
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Rejoins la communauté</h3>
              <p className="text-sm text-muted-foreground">
                Participe à des événements et rencontre d'autres propriétaires
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Home className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Adopte un chien</h3>
              <p className="text-sm text-muted-foreground">
                Découvre des chiens à adopter près de chez toi
              </p>
            </div>
          </motion.div>
        </div>

        <Button
          onClick={() => navigate("/onboarding/dog")}
          size="lg"
          className="w-full"
        >
          Commencer l'aventure
        </Button>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Plus tard
        </button>
      </motion.div>
    </div>
  );
}
