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
    email: "test.user@whoof.app",
    password: "TestUser123!",
    displayName: "Test User",
    role: "user",
    isPro: false
  },
  {
    email: "test.pro@whoof.app",
    password: "TestPro123!",
    displayName: "Test Pro",
    role: "user",
    isPro: true
  },
  {
    email: "test.admin@whoof.app",
    password: "TestAdmin123!",
    displayName: "Test Admin",
    role: "admin",
    isPro: false
  }
];

export default function TestAccounts() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<{ isAdmin: boolean; isModerator: boolean }>({ isAdmin: false, isModerator: false });
  const [isCreating, setIsCreating] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState(false);

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
      // Check roles for display purposes only
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

  const createTestAccounts = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-accounts', {
        body: { action: 'create' }
      });

      if (error) throw error;

      toast.success("Comptes de test créés !");
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
      // Sign out current user
      await supabase.auth.signOut();
      
      // Sign in with test account
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) throw error;

      toast.success(`Connecté en tant que ${account.displayName}`);
      
      // Redirect based on role
      setTimeout(() => {
        if (account.isPro) {
          navigate("/pro/home");
        } else if (account.role === "admin") {
          navigate("/admin/moderation");
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
        <h1 className="text-3xl font-bold mb-2">Comptes de Test</h1>
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

      {!accountsCreated && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle>Première utilisation</CardTitle>
            <CardDescription>
              Créez les comptes de test avant de pouvoir les utiliser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createTestAccounts} disabled={isCreating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
              {isCreating ? 'Création en cours...' : 'Créer les comptes de test'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {TEST_ACCOUNTS.map((account) => (
          <Card key={account.email}>
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
                <div className="flex gap-2">
                  {account.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                  {account.isPro && <Badge variant="secondary">Pro</Badge>}
                  {!account.isPro && account.role !== 'admin' && <Badge variant="outline">User</Badge>}
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
                  {currentUser?.email === account.email ? 'Actuel' : 'Se connecter'}
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
          <div>
            <span className="font-medium">User:</span> Accès aux fonctionnalités standards (découverte, profil, etc.)
          </div>
          <div>
            <span className="font-medium">Pro:</span> Accès à l'espace Pro + fonctionnalités User
          </div>
          <div>
            <span className="font-medium">Admin:</span> Accès à la modération + toutes les fonctionnalités
          </div>
        </CardContent>
      </Card>
    </div>
  );
}