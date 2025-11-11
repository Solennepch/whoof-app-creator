/**
 * Feature Flags Configuration
 * 
 * Permet d'activer/désactiver des fonctionnalités en développement
 * sans avoir à déployer de nouvelles versions.
 * 
 * Usage:
 * ```tsx
 * import { useFeatureFlag } from '@/hooks/useFeatureFlags';
 * 
 * function MyComponent() {
 *   const showNewFeature = useFeatureFlag('new_matching_algorithm');
 *   
 *   if (showNewFeature) {
 *     return <NewMatchingUI />;
 *   }
 *   return <OldMatchingUI />;
 * }
 * ```
 */

export interface FeatureFlag {
  /** Identifiant unique du flag */
  key: string;
  /** Nom lisible */
  name: string;
  /** Description de la fonctionnalité */
  description: string;
  /** Activé par défaut */
  enabled: boolean;
  /** Environnements où le flag est disponible */
  environments?: ('development' | 'production')[];
  /** Date d'expiration (après laquelle le flag devrait être retiré) */
  expiresAt?: string;
  /** Responsable de la feature */
  owner?: string;
}

/**
 * Configuration des feature flags
 * 
 * IMPORTANT: 
 * - Toujours commenter un flag avant de le supprimer
 * - Documenter la raison de l'activation/désactivation
 * - Définir une date d'expiration pour éviter l'accumulation
 */
export const featureFlags: FeatureFlag[] = [
  // === Fonctionnalités de Matching ===
  {
    key: 'new_matching_algorithm',
    name: 'Nouvel algorithme de matching',
    description: 'Algorithme de matching amélioré basé sur IA',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-12-31',
    owner: 'equipe-matching'
  },
  {
    key: 'advanced_filters',
    name: 'Filtres avancés',
    description: 'Filtres de recherche supplémentaires (comportement, santé, etc.)',
    enabled: true,
    environments: ['development'],
    expiresAt: '2025-06-30',
  },
  {
    key: 'video_profiles',
    name: 'Profils vidéo',
    description: 'Permet d\'ajouter des vidéos aux profils de chiens',
    enabled: false,
    environments: ['development'],
    expiresAt: '2026-01-31',
  },

  // === Fonctionnalités Premium ===
  {
    key: 'super_boost',
    name: 'Super Boost',
    description: 'Fonctionnalité premium pour booster la visibilité du profil',
    enabled: false,
    environments: ['development', 'production'],
    expiresAt: '2025-09-30',
  },
  {
    key: 'unlimited_likes',
    name: 'Likes illimités',
    description: 'Suppression de la limite de likes quotidiens pour les premium',
    enabled: true,
    environments: ['development', 'production'],
  },

  // === Fonctionnalités Pro ===
  {
    key: 'pro_analytics_v2',
    name: 'Analytics Pro V2',
    description: 'Nouvelle version des statistiques pour les professionnels',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-08-31',
    owner: 'equipe-pro'
  },
  {
    key: 'pro_booking_calendar',
    name: 'Calendrier de réservation',
    description: 'Calendrier interactif pour gérer les réservations',
    enabled: true,
    environments: ['development', 'production'],
  },
  {
    key: 'pro_instant_messaging',
    name: 'Messagerie instantanée Pro',
    description: 'Chat en temps réel entre pros et clients',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-07-31',
  },

  // === Fonctionnalités Social ===
  {
    key: 'group_walks',
    name: 'Balades de groupe',
    description: 'Organisation de balades collectives',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-10-31',
  },
  {
    key: 'dog_events',
    name: 'Événements canins',
    description: 'Calendrier d\'événements pour les propriétaires de chiens',
    enabled: true,
    environments: ['development', 'production'],
  },
  {
    key: 'community_forums',
    name: 'Forums communautaires',
    description: 'Forums de discussion entre utilisateurs',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-12-31',
  },

  // === Fonctionnalités Gamification ===
  {
    key: 'achievement_system',
    name: 'Système de succès',
    description: 'Débloquer des succès en utilisant l\'app',
    enabled: true,
    environments: ['development', 'production'],
  },
  {
    key: 'leaderboards',
    name: 'Classements',
    description: 'Classements des utilisateurs les plus actifs',
    enabled: false,
    environments: ['development'],
  },

  // === Expérimentations UI/UX ===
  {
    key: 'dark_mode_auto',
    name: 'Mode sombre automatique',
    description: 'Basculement auto jour/nuit selon l\'heure',
    enabled: false,
    environments: ['development'],
  },
  {
    key: 'swipe_gestures_v2',
    name: 'Gestes de swipe V2',
    description: 'Nouveaux gestes tactiles pour le matching',
    enabled: false,
    environments: ['development'],
    expiresAt: '2025-06-30',
  },
  {
    key: 'onboarding_skip',
    name: 'Skip onboarding',
    description: 'Permet de passer l\'onboarding pour les tests',
    enabled: true,
    environments: ['development'],
  },

  // === Fonctionnalités Admin ===
  {
    key: 'admin_bulk_actions',
    name: 'Actions en masse Admin',
    description: 'Effectuer des actions sur plusieurs éléments à la fois',
    enabled: false,
    environments: ['development'],
  },
  {
    key: 'admin_advanced_search',
    name: 'Recherche avancée Admin',
    description: 'Recherche multi-critères dans le panel admin',
    enabled: true,
    environments: ['development', 'production'],
  },

  // === Intégrations ===
  {
    key: 'google_maps_integration',
    name: 'Google Maps',
    description: 'Utiliser Google Maps à la place de Mapbox',
    enabled: false,
    environments: ['development'],
  },
  {
    key: 'push_notifications',
    name: 'Notifications push',
    description: 'Notifications push web natives',
    enabled: true,
    environments: ['development', 'production'],
  },
  {
    key: 'social_sharing',
    name: 'Partage social',
    description: 'Partage sur réseaux sociaux (Instagram, Facebook, etc.)',
    enabled: true,
    environments: ['development', 'production'],
  },
];

/**
 * Obtenir un feature flag par sa clé
 */
export function getFeatureFlag(key: string): FeatureFlag | undefined {
  return featureFlags.find(flag => flag.key === key);
}

/**
 * Vérifier si un feature flag est activé
 * Prend en compte l'environnement actuel
 */
export function isFeatureEnabled(key: string): boolean {
  const flag = getFeatureFlag(key);
  
  if (!flag) {
    console.warn(`Feature flag "${key}" not found`);
    return false;
  }

  // Vérifier l'environnement
  const currentEnv = import.meta.env.DEV ? 'development' : 'production';
  if (flag.environments && !flag.environments.includes(currentEnv)) {
    return false;
  }

  // Vérifier la date d'expiration
  if (flag.expiresAt) {
    const expiryDate = new Date(flag.expiresAt);
    if (new Date() > expiryDate) {
      console.warn(`Feature flag "${key}" has expired on ${flag.expiresAt}`);
      return false;
    }
  }

  return flag.enabled;
}

/**
 * Obtenir tous les feature flags actifs
 */
export function getActiveFeatureFlags(): FeatureFlag[] {
  return featureFlags.filter(flag => isFeatureEnabled(flag.key));
}

/**
 * Obtenir tous les feature flags pour l'environnement actuel
 */
export function getEnvironmentFeatureFlags(): FeatureFlag[] {
  const currentEnv = import.meta.env.DEV ? 'development' : 'production';
  return featureFlags.filter(
    flag => !flag.environments || flag.environments.includes(currentEnv)
  );
}
