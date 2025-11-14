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
    displayName: "👑 Dev Master (ALL ACCESS)",
    role: "admin",
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
    displayName: "Anthony Groubé",
    role: "user",
    isPro: false
  },
  {
    email: "test.pro@whoof.app",
    password: "TestPro123!",
    displayName: "Rodolphe Pichon",
    role: "user",
    isPro: true
  }
];

export default function TestAccounts() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<{ isAdmin: boolean; isModerator: boolean }>({ isAdmin: false, isModerator: false });
  const [isCreating, setIsCreating] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState(false);
  const [checkingAccounts, setCheckingAccounts] = useState(true);

  useEffect(() => {
    checkAuth();
    checkIfAccountsExist();
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

  const checkIfAccountsExist = async () => {
    setCheckingAccounts(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-accounts', {
        body: { action: 'list' }
      });

      if (!error && data?.accounts && data.accounts.length >= 4) {
        setAccountsCreated(true);
      }
    } catch (error) {
      console.error('Error checking accounts:', error);
    } finally {
      setCheckingAccounts(false);
    }
  };

  const createDevAccount = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dev-account');

      if (error) throw error;

      toast.success("👑 Compte DEV créé avec tous les accès ! Email: dev@whoof.app");
      setAccountsCreated(true);
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
      setAccountsCreated(true);
    } catch (error: any) {
      console.error('Error creating test accounts:', error);
      toast.error(error.message || "Erreur lors de la création des comptes");
    } finally {
      setIsCreating(false);
    }
  };

  const switchAccount = async (account: TestAccount) => {
    try {
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) throw error;

      toast.success(`Connecté en tant que ${account.displayName}`);
      
      setTimeout(() => {
        if (account.isPro) {
          navigate("/pro/home");
        } else {
          navigate("/");
        }
      }, 500);
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

      {checkingAccounts ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Vérification des comptes...</span>
            </div>
          </CardContent>
        </Card>
      ) : !accountsCreated ? (
        <Card className="mb-6 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Première utilisation
            </CardTitle>
            <CardDescription>
              ⚠️ Créez d'abord votre compte dev pour accéder à toute l'application sans restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={createDevAccount} 
              disabled={isCreating} 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Shield className={`h-4 w-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
              {isCreating ? 'Création...' : '👑 Créer mon compte DEV ultime'}
            </Button>
            <div className="text-center text-xs text-muted-foreground">ou</div>
            <Button onClick={createTestAccounts} disabled={isCreating} size="lg" variant="outline" className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
              {isCreating ? 'Création en cours...' : 'Créer les comptes de test standards'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <span className="text-lg">✅</span>
              <span className="font-medium">Comptes de test disponibles - Vous pouvez maintenant vous connecter</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {TEST_ACCOUNTS.map((account) => (
          <Card key={account.email} className={account.email === 'dev@whoof.app' ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {account.role === 'admin' && <Shield className="h-5 w-5 text-destructive" />}
                    {account.isPro && <Briefcase className="h-5 w-5 text-primary" />}
                    {!account.isPro && account.role !== 'admin' && <User className="h-5 w-5 text-muted-foreground" />}
                    {account.displayName}
                  </CardTitle>
                  <CardDescription className="mt-1">{account.email}</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {account.email === 'dev@whoof.app' && <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">👑 DEV</Badge>}
                  {account.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                  {account.isPro && <Badge variant="secondary">Pro</Badge>}
                  {!account.isPro && account.role !== 'admin' && account.email !== 'dev@whoof.app' && <Badge variant="outline">User</Badge>}
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
                  disabled={currentUser?.email === account.email || !accountsCreated}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {currentUser?.email === account.email ? 'Actuel' : !accountsCreated ? 'Créer d\'abord' : 'Se connecter'}
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
            <span className="font-bold">👑 Dev Master:</span> Compte développeur ultime avec TOUS LES ACCÈS (admin + moderator + pro + premium). Permet de tester toutes les fonctionnalités sans restriction.
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
          <div>
            <span className="font-medium">Admin:</span> Compte administrateur avec accès à la modération et toutes les fonctionnalités.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
