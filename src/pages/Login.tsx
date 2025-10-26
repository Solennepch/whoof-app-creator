import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Chrome, Apple } from "lucide-react";
import { toast } from "sonner";
import logoWhoof from "@/assets/logo-whoof.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile/me`,
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Vérifiez votre e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Connexion réussie !");
        navigate("/profile/me");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile/me`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--paper)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logoWhoof} 
            alt="Whoof Logo" 
            className="w-24 h-24 mx-auto mb-4"
          />
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
              {isLoading 
                ? "Connexion..." 
                : isSignUp 
                  ? "Créer un compte" 
                  : "Se connecter par e-mail"}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp 
                ? "Déjà un compte ? Se connecter" 
                : "Pas encore de compte ? S'inscrire"}
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
        </div>
      </div>
    </div>
  );
}
