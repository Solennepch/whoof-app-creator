import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCacheStats, clearAllCache, cleanupCache } from '@/services/cachedApi';
import { Database, HardDrive, RefreshCw, Trash2, Server } from 'lucide-react';
import { toast } from 'sonner';

interface CacheStats {
  indexedDB: {
    totalEntries: number;
    totalSize: number;
  };
  redis: {
    available: boolean;
  };
}

export function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getCacheStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider tout le cache ? Cette action est irréversible.')) {
      return;
    }

    try {
      await clearAllCache();
      toast.success('Cache vidé avec succès');
      await loadStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Erreur lors du vidage du cache');
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupCache();
      toast.success('Nettoyage terminé');
      await loadStats();
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
      toast.error('Erreur lors du nettoyage');
    }
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Monitoring Cache Multi-Niveau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Monitoring Cache Multi-Niveau
          </CardTitle>
          <CardDescription>
            Statistiques et gestion du cache IndexedDB (local) + Redis (serveur)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* IndexedDB Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Cache Local (IndexedDB)</h3>
                <Badge variant="outline" className="bg-primary/10">
                  {'<'}5ms
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Entrées</p>
                <p className="text-2xl font-bold">{stats?.indexedDB.totalEntries || 0}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Espace utilisé</p>
                <p className="text-2xl font-bold">
                  {stats?.indexedDB.totalSize 
                    ? `${(stats.indexedDB.totalSize / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Redis Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-accent" />
                <h3 className="font-semibold">Cache Serveur (Redis)</h3>
                <Badge variant="outline" className="bg-accent/10">
                  10-50ms
                </Badge>
              </div>
              <Badge variant={stats?.redis.available ? 'default' : 'destructive'}>
                {stats?.redis.available ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {stats?.redis.available && (
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-green-600">
                  ✓ Connecté à Upstash Redis
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={loadStats} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Button 
              onClick={handleCleanup} 
              variant="outline" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Nettoyer les entrées expirées
            </Button>

            <Button 
              onClick={handleClearAll} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider tout le cache
            </Button>
          </div>

          {/* Performance Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold mb-2">Architecture Multi-Niveau</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Niveau 1 (IndexedDB):</strong> Cache local ultra-rapide {'<'}5ms</li>
              <li>• <strong>Niveau 2 (Redis):</strong> Cache serveur partagé 10-50ms</li>
              <li>• <strong>Niveau 3 (API):</strong> Appel direct 200-800ms</li>
              <li>• <strong>Stratégie:</strong> Lecture séquentielle, écriture parallèle</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
