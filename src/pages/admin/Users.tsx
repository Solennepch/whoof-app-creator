import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, UserX, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type User = {
  id: string;
  display_name: string | null;
  created_at: string;
  city: string | null;
  bio: string | null;
  is_banned?: boolean;
  banned_at?: string | null;
  ban_reason?: string | null;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, display_name, created_at, city, bio, is_banned, banned_at, ban_reason')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setUsers(profilesData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? "Débannir" : "Bannir";
    if (!confirm(`${action} cet utilisateur ?`)) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin-content', {
        body: {
          action: currentBanStatus ? 'unban_user' : 'ban_user',
          user_id: userId,
          ban_reason: currentBanStatus ? undefined : "Violation des conditions d'utilisation",
        },
      });

      if (error) throw error;

      toast({
        title: currentBanStatus ? "Utilisateur débanni" : "Utilisateur banni",
        description: "L'action a été effectuée avec succès",
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = 
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    return searchMatch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          {filteredUsers.length} utilisateur(s) • {users.filter(u => u.is_banned).length} banni(s)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, ville ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={loadUsers} variant="outline">
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Gérer les comptes particuliers et professionnels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.is_banned ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">
                        {user.display_name || "Sans nom"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.city || "Non renseignée"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {user.bio || "Aucune bio"}
                      </TableCell>
                      <TableCell>
                        {user.is_banned ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              <Ban className="h-3 w-3" />
                              Banni
                            </span>
                            {user.ban_reason && (
                              <p className="text-xs text-muted-foreground">
                                {user.ban_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Actif
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.is_banned ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handleBanUser(user.id, user.is_banned || false)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {user.is_banned ? "Débannir" : "Bannir"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
