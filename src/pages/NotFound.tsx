import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import logoWhoof from "@/assets/logo-whoof-v3.png";
import { Home, Search, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* Logo */}
        <div className="mb-8 inline-flex">
          <img 
            src={logoWhoof} 
            alt="Whoof Logo" 
            className="h-24 w-24 sm:h-32 sm:w-32 opacity-50"
          />
        </div>

        {/* Error Code */}
        <motion.h1 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl sm:text-9xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
        >
          404
        </motion.h1>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
          Oups ! Cette page s'est enfuie 🐕
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          On dirait que cette page est partie courir au parc et ne reviendra pas de sitôt. 
          Mais pas de panique, on peut te ramener sur le bon chemin !
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-5 w-5" />
            Accueil
          </Button>
          
          <Button
            size="lg"
            variant="like"
            onClick={() => navigate('/discover')}
            className="w-full sm:w-auto"
          >
            <Heart className="mr-2 h-5 w-5" />
            Découvrir
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground mb-4">
            Tu cherches quelque chose en particulier ?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile/me')}
            >
              Mon Profil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
            >
              Messages
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/map')}
            >
              Carte
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/events')}
            >
              Événements
            </Button>
          </div>
          
          {/* Debug Access */}
          <div className="mt-8 pt-6 border-t border-border/20">
            <p className="text-xs text-muted-foreground mb-3">
              🛠️ Accès développeur
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/debug/test-accounts')}
              className="text-xs"
            >
              Comptes de test
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
