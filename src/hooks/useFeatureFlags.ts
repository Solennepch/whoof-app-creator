import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  isFeatureEnabled, 
  getFeatureFlag, 
  getActiveFeatureFlags,
  getEnvironmentFeatureFlags,
  type FeatureFlag 
} from '@/config/featureFlags';

/**
 * Hook pour vérifier si un feature flag est activé
 * 
 * @param flagKey - Clé du feature flag
 * @returns true si le flag est activé
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showNewFeature = useFeatureFlag('new_matching_algorithm');
 *   
 *   if (showNewFeature) {
 *     return <NewMatchingUI />;
 *   }
 *   
 *   return <OldMatchingUI />;
 * }
 * ```
 */
export function useFeatureFlag(flagKey: string): boolean {
  const [isEnabled, setIsEnabled] = useState(() => isFeatureEnabled(flagKey));

  useEffect(() => {
    // Permettre le hot-reload des feature flags en développement
    if (import.meta.env.DEV) {
      const checkFlag = () => {
        const enabled = isFeatureEnabled(flagKey);
        if (enabled !== isEnabled) {
          setIsEnabled(enabled);
        }
      };

      // Vérifier toutes les 5 secondes en dev
      const interval = setInterval(checkFlag, 5000);
      return () => clearInterval(interval);
    }
  }, [flagKey, isEnabled]);

  return isEnabled;
}

/**
 * Hook pour obtenir les détails d'un feature flag
 * 
 * @param flagKey - Clé du feature flag
 * @returns Détails du flag ou undefined
 * 
 * @example
 * ```tsx
 * function FeatureFlagInfo({ flagKey }: { flagKey: string }) {
 *   const flag = useFeatureFlagDetails(flagKey);
 *   
 *   if (!flag) return null;
 *   
 *   return (
 *     <div>
 *       <h3>{flag.name}</h3>
 *       <p>{flag.description}</p>
 *       <Badge>{flag.enabled ? 'Activé' : 'Désactivé'}</Badge>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlagDetails(flagKey: string): FeatureFlag | undefined {
  return getFeatureFlag(flagKey);
}

/**
 * Hook pour obtenir tous les feature flags actifs
 * 
 * @returns Liste des flags actifs
 * 
 * @example
 * ```tsx
 * function ActiveFeatures() {
 *   const activeFlags = useActiveFeatureFlags();
 *   
 *   return (
 *     <ul>
 *       {activeFlags.map(flag => (
 *         <li key={flag.key}>{flag.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useActiveFeatureFlags(): FeatureFlag[] {
  return getActiveFeatureFlags();
}

/**
 * Hook pour obtenir tous les feature flags de l'environnement actuel
 * 
 * @returns Liste des flags disponibles dans l'environnement
 */
export function useEnvironmentFeatureFlags(): FeatureFlag[] {
  return getEnvironmentFeatureFlags();
}

/**
 * Hook pour vérifier plusieurs feature flags à la fois
 * 
 * @param flagKeys - Liste des clés de feature flags
 * @returns Map des flags avec leur statut
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const flags = useMultipleFeatureFlags([
 *     'new_matching_algorithm',
 *     'video_profiles',
 *     'advanced_filters'
 *   ]);
 *   
 *   return (
 *     <div>
 *       {flags.new_matching_algorithm && <NewAlgorithm />}
 *       {flags.video_profiles && <VideoUpload />}
 *       {flags.advanced_filters && <AdvancedFilters />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleFeatureFlags(
  flagKeys: string[]
): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    return flagKeys.reduce((acc, key) => {
      acc[key] = isFeatureEnabled(key);
      return acc;
    }, {} as Record<string, boolean>);
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      const checkFlags = () => {
        const newFlags = flagKeys.reduce((acc, key) => {
          acc[key] = isFeatureEnabled(key);
          return acc;
        }, {} as Record<string, boolean>);

        // Vérifier si quelque chose a changé
        const hasChanged = Object.keys(newFlags).some(
          key => newFlags[key] !== flags[key]
        );

        if (hasChanged) {
          setFlags(newFlags);
        }
      };

      const interval = setInterval(checkFlags, 5000);
      return () => clearInterval(interval);
    }
  }, [flagKeys, flags]);

  return flags;
}

/**
 * Composant wrapper pour conditionner l'affichage selon un feature flag
 * 
 * @example
 * ```tsx
 * <FeatureGate flag="new_matching_algorithm">
 *   <NewMatchingUI />
 * </FeatureGate>
 * 
 * // Avec fallback
 * <FeatureGate flag="video_profiles" fallback={<ImageUpload />}>
 *   <VideoUpload />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);

  return isEnabled ? children : fallback;
}
