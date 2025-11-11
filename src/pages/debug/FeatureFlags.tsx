import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  Search,
  AlertTriangle 
} from "lucide-react";
import { featureFlags, type FeatureFlag } from "@/config/featureFlags";

/**
 * Page de gestion des Feature Flags (Dev/Debug uniquement)
 * 
 * Permet de visualiser et modifier les feature flags en temps réel
 * pour faciliter le développement et les tests.
 */
export default function FeatureFlagsDebug() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Filtrer les flags
  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = 
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'enabled' && flag.enabled) ||
      (filter === 'disabled' && !flag.enabled);

    return matchesSearch && matchesFilter;
  });

  const currentEnv = import.meta.env.DEV ? 'development' : 'production';

  const isExpired = (flag: FeatureFlag) => {
    if (!flag.expiresAt) return false;
    return new Date(flag.expiresAt) < new Date();
  };

  const isAvailableInEnv = (flag: FeatureFlag) => {
    if (!flag.environments) return true;
    return flag.environments.includes(currentEnv);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
          <p className="text-muted-foreground">
            Gérer les fonctionnalités en développement
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featureFlags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Activés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {featureFlags.filter(f => f.enabled).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400" />
                Désactivés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">
                {featureFlags.filter(f => !f.enabled).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Expirés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {featureFlags.filter(isExpired).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un feature flag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Status filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'enabled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('enabled')}
              >
                Activés
              </Button>
              <Button
                variant={filter === 'disabled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('disabled')}
              >
                Désactivés
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags List */}
        <div className="space-y-4">
          {filteredFlags.map((flag) => (
            <Card 
              key={flag.key}
              className={isExpired(flag) ? 'border-orange-500' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      {flag.enabled ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Activé
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Désactivé
                        </Badge>
                      )}
                      {isExpired(flag) && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expiré
                        </Badge>
                      )}
                      {!isAvailableInEnv(flag) && (
                        <Badge variant="secondary">
                          Autre environnement
                        </Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">{flag.key}</code>
                  </div>
                  
                  <Switch 
                    checked={flag.enabled}
                    disabled
                    className="pointer-events-none"
                  />
                </div>
                <CardDescription>{flag.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {flag.environments && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Envs:</span>
                      {flag.environments.map(env => (
                        <Badge key={env} variant="outline" className="text-xs">
                          {env}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {flag.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-semibold">Expire:</span>
                      <span className={isExpired(flag) ? 'text-orange-600' : ''}>
                        {new Date(flag.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {flag.owner && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-semibold">Owner:</span>
                      <span>{flag.owner}</span>
                    </div>
                  )}
                </div>

                {/* Warning for expired flags */}
                {isExpired(flag) && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                    ⚠️ Ce feature flag a expiré et devrait être retiré ou renouvelé.
                  </div>
                )}

                {/* Info for unavailable env */}
                {!isAvailableInEnv(flag) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    ℹ️ Ce flag n'est pas disponible dans l'environnement actuel ({currentEnv}).
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredFlags.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucun feature flag trouvé
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">📝 Note importante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Les feature flags sont configurés dans <code className="px-1 py-0.5 bg-white rounded">src/config/featureFlags.ts</code>.
            </p>
            <p>
              Pour modifier un flag, éditez le fichier de configuration et rechargez la page.
            </p>
            <p>
              En production, seuls les flags marqués pour l'environnement "production" seront actifs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
