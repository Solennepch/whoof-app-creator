import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdmin";
import { useUsersWithRoles, useAssignRole, useRevokeRole, useRolePermissions } from "@/hooks/useRoleManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldAlert, ShieldCheck, Search, UserPlus, UserMinus, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RolesManagement() {
  const navigate = useNavigate();
  const { data: adminRole, isLoading: isLoadingRole } = useAdminRole();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users, isLoading: isLoadingUsers } = useUsersWithRoles(searchQuery);
  const { data: rolePermissions, isLoading: isLoadingPermissions } = useRolePermissions();
  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();

  // Check if user is admin
  if (!isLoadingRole && !adminRole?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Seuls les administrateurs peuvent accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAssignRole = async (userId: string, role: string) => {
    await assignRole.mutateAsync({ userId, role });
  };

  const handleRevokeRole = async (userId: string, role: string) => {
    await revokeRole.mutateAsync({ userId, role });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'moderator':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-3 w-3" />;
      case 'moderator':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (isLoadingRole || isLoadingUsers) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rôles</h1>
          <p className="text-muted-foreground">
            Assigner et gérer les rôles administrateurs et modérateurs
          </p>
        </div>
      </div>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Permissions par Rôle
          </CardTitle>
          <CardDescription>
            Permissions assignées à chaque rôle dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPermissions ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(rolePermissions || {}).map(([role, permissions]) => (
                <Card key={role}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getRoleIcon(role)}
                      {role === 'admin' ? 'Administrateur' : role === 'moderator' ? 'Modérateur' : role}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(permissions as string[]).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Gérer les rôles des utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôles Actuels</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.display_name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.display_name || 'Utilisateur'}</div>
                          <div className="text-sm text-muted-foreground">{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Modérateur' : role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">Utilisateur</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select onValueChange={(role) => handleAssignRole(user.id, role)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assigner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin" disabled={user.roles.includes('admin')}>
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value="moderator" disabled={user.roles.includes('moderator')}>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Modérateur
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {user.roles.length > 0 && (
                          <Select onValueChange={(role) => handleRevokeRole(user.id, role)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Révoquer" />
                            </SelectTrigger>
                            <SelectContent>
                              {user.roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  Révoquer {role === 'admin' ? 'Admin' : 'Modérateur'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
