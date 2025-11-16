import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Chrome, Apple } from "lucide-react";
import { toast } from "sonner";
import logoWhoof from "@/assets/logo-whoof-v3.png";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou mot de passe incorrect");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Connexion réussie !");
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion Google");
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue sur Whoof
          </p>
        </div>

        {/* Auth Card */}
        <div 
          className="bg-card rounded-2xl p-8 shadow-soft"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Connexion..." : "Se connecter par e-mail"}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pas encore de compte ? S'inscrire
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl"
              onClick={handleGoogleAuth}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continuer avec Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl"
              disabled
            >
              <Apple className="mr-2 h-4 w-4" />
              Continuer avec Apple
            </Button>
          </div>
          
          {/* Debug Access Link - Only in dev mode */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate("/debug/test-accounts")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors block w-full"
              >
                🛠️ Accéder aux comptes de test (dev)
              </button>
              <button
                type="button"
                onClick={() => navigate("/recompenses")}
                className="text-xs text-primary hover:text-primary/80 transition-colors block w-full font-medium"
              >
                🎁 Test direct: Accéder aux Récompenses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
