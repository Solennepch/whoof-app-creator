import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoWhoof from "@/assets/logo-whoof-v3.png";
import { motion } from "framer-motion";
import { ChallengeWidget } from "@/components/events/ChallengeWidget";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <section className="relative overflow-hidden px-4 py-16">
        <div className="relative mx-auto max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex">
              <img 
                src={logoWhoof} 
                alt="Whoof Logo" 
                className="h-24 w-24 sm:h-32 sm:w-32"
              />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Whoof Apps
              </span>
            </h1>
            <p className="mb-12 text-lg text-muted-foreground max-w-md mx-auto">
              Trouve des copains pour ton chien ou adopte ton futur meilleur ami
            </p>
            
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button 
                size="lg" 
                variant="like"
                className="w-full h-16 text-base"
                onClick={() => navigate('/discover', { state: { mode: 'region' } })}
              >
                <Heart className="mr-2 h-6 w-6" />
                Je cherche des copains
              </Button>
              <Button 
                size="lg" 
                variant="superlike"
                className="w-full h-16 text-base"
                onClick={() => navigate('/discover', { state: { mode: 'adoption' } })}
              >
                <Home className="mr-2 h-6 w-6" />
                Je veux adopter
              </Button>
            </div>

            {/* Challenge Widget */}
            {user && (
              <div className="max-w-sm mx-auto mt-6">
                <ChallengeWidget />
              </div>
            )}
            
            {/* Debug Access Link */}
            <div className="mt-8 pt-6 border-t border-primary/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/debug/test-accounts')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                🛠️ Comptes de test
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
