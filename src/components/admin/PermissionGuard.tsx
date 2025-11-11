import { ReactNode } from "react";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { data: userRole, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const hasPermission = userRole?.permissions.includes(permission);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Permission refusée</AlertTitle>
        <AlertDescription>
          Vous n'avez pas la permission nécessaire pour effectuer cette action.
          {userRole?.role === 'moderator' && (
            <span className="block mt-2 text-xs">
              En tant que modérateur, certaines actions sont restreintes aux administrateurs.
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

interface PermissionBadgeProps {
  role: 'admin' | 'moderator' | 'user';
}

export function PermissionBadge({ role }: PermissionBadgeProps) {
  const badgeConfig = {
    admin: { label: 'Admin', className: 'bg-red-500 text-white' },
    moderator: { label: 'Modérateur', className: 'bg-orange-500 text-white' },
    user: { label: 'Utilisateur', className: 'bg-gray-500 text-white' },
  };

  const config = badgeConfig[role];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
