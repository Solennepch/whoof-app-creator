import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogIn, LogOut, RefreshCw, Shield, Briefcase, User } from "lucide-react";

interface TestAccount {
  email: string;
  password: string;
  displayName: string;
  role: string;
  isPro: boolean;
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: "dev@whoof.app",
    password: "DevMaster2025!",
    displayName: "👑 Dev Master (Particulier + Pro)",
    role: "user",
    isPro: true
  },
  {
    email: "test@whoof.app",
    password: "Test123!",
    displayName: "Solenne Pichon (Perso + Pro)",
    role: "user",
    isPro: true
  },
  {
    email: "test.user@whoof.app",
    password: "TestUser123!",
    displayName: "Anthony Groubé (Particulier)",
    role: "user",
    isPro: false
  },
  {
    email: "test.pro@whoof.app",
    password: "TestPro123!",
    displayName: "Rodolphe Pichon (Pro)",
    role: "user",
    isPro: true
  }
];

export default function TestAccounts() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<{ isAdmin: boolean; isModerator: boolean }>({ isAdmin: false, isModerator: false });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user) {
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();
      
      setUserRoles({
        isAdmin: adminRole?.role === 'admin',
        isModerator: adminRole?.role === 'moderator'
      });
    }
  };

  const createDevAccount = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dev-account');

      if (error) throw error;

      toast.success("👑 Compte DEV créé avec tous les accès ! Email: dev@whoof.app");
    } catch (error: any) {
      console.error('Error creating dev account:', error);
      toast.error(error.message || "Erreur lors de la création du compte dev");
    } finally {
      setIsCreating(false);
    }
  };

  const createTestAccounts = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-accounts', {
        body: { action: 'create' }
      });

      if (error) throw error;

      toast.success("Comptes de test créés ! Vous pouvez maintenant vous connecter.");
    } catch (error: any) {
      console.error('Error creating test accounts:', error);
      toast.error(error.message || "Erreur lors de la création des comptes");
    } finally {
      setIsCreating(false);
    }
  };

  const switchAccount = async (account: TestAccount) => {
    try {
      // First sign out completely
      await supabase.auth.signOut();
      
      // Wait to ensure sign out is fully processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error(`Le compte ${account.displayName} n'existe pas encore. Créez-le avec les boutons ci-dessous.`, {
            duration: 5000,
          });
        } else {
          toast.error(error.message || "Erreur lors de la connexion");
        }
        return;
      }

      // Wait for session to be fully established before navigating
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Connecté en tant que ${account.displayName}`);
      
      // Let useAuth handle navigation automatically
      // This prevents conflicts between multiple navigation calls
    } catch (error: any) {
      console.error('Error switching account:', error);
      toast.error(error.message || "Erreur lors du changement de compte");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comptes de Test & Dev</h1>
        <p className="text-muted-foreground">
          Gérez et basculez entre les comptes de test pour tester différents rôles.
        </p>
      </div>

      {currentUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Compte Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentUser.email}</p>
                <div className="flex gap-2 mt-2">
                  {userRoles.isAdmin && <Badge variant="destructive">Admin</Badge>}
                  {userRoles.isModerator && <Badge variant="secondary">Modérateur</Badge>}
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Création de comptes (si nécessaire)</CardTitle>
          <CardDescription>
            Si la connexion échoue, créez d'abord les comptes avec ces boutons :
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={createDevAccount} 
            disabled={isCreating} 
            size="sm" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Shield className={`h-4 w-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
            {isCreating ? 'Création...' : '👑 Créer compte DEV'}
          </Button>
          <Button onClick={createTestAccounts} disabled={isCreating} size="sm" variant="outline" className="w-full">
            <RefreshCw className={`h-4 w-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
            {isCreating ? 'Création...' : 'Créer tous les comptes de test'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {TEST_ACCOUNTS.map((account) => (
          <Card key={account.email} className={account.email === 'dev@whoof.app' ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {account.email === 'dev@whoof.app' && <Shield className="h-5 w-5 text-purple-500" />}
                    {account.isPro && <Briefcase className="h-5 w-5 text-primary" />}
                    {!account.isPro && <User className="h-5 w-5 text-muted-foreground" />}
                    {account.displayName}
                  </CardTitle>
                  <CardDescription className="mt-1">{account.email}</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {account.email === 'dev@whoof.app' && <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">👑 DEV</Badge>}
                  {account.isPro && <Badge variant="secondary">Pro</Badge>}
                  {!account.isPro && <Badge variant="outline">Particulier</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Email:</span> {account.email}</p>
                  <p><span className="font-medium">Mot de passe:</span> {account.password}</p>
                </div>
                <Button 
                  onClick={() => switchAccount(account)}
                  disabled={currentUser?.email === account.email}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {currentUser?.email === account.email ? 'Compte actuel' : 'Se connecter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-muted">
        <CardHeader>
          <CardTitle className="text-sm">Accès rapides par rôle</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border-2 border-purple-300 dark:border-purple-700">
            <span className="font-bold">👑 Dev Master:</span> Navigation complète avec accès particulier + professionnel. Permet de tester toutes les fonctionnalités des deux types de comptes.
          </div>
          <div>
            <span className="font-medium">Solenne Pichon:</span> Compte combo avec profil personnel ET professionnel. Utilisez le double-tap sur l'avatar ou "Changer de compte" pour basculer entre les deux modes.
          </div>
          <div>
            <span className="font-medium">Anthony Groubé:</span> Compte utilisateur particulier uniquement.
          </div>
          <div>
            <span className="font-medium">Rodolphe Pichon:</span> Compte professionnel uniquement.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
