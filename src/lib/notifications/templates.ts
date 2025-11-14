export type NotificationCategory = 
  | 'matching'
  | 'walks'
  | 'gamification'
  | 'reactivation'
  | 'partners'
  | 'affective';

export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timing?: {
    minHour?: number;
    maxHour?: number;
  };
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // A. Matching & interactions
  {
    id: 'match_whoofed',
    category: 'matching',
    title: 'Nouveau Whoof',
    message: 'Quelqu\'un vient de Whoofer ton profil 👀🐾',
    priority: 'high',
  },
  {
    id: 'match_compatible_nearby',
    category: 'matching',
    title: 'Truffe compatible',
    message: 'Nouvelle truffe compatible près de chez toi ❤️',
    priority: 'high',
  },
  {
    id: 'match_potential',
    category: 'matching',
    title: 'Match potentiel',
    message: 'On dirait un match 🐶 + 🐶… ouvre pour vérifier !',
    priority: 'medium',
  },
  {
    id: 'match_profile_views',
    category: 'matching',
    title: 'Ton profil cartonne',
    message: 'Ton profil a été flairé 3 fois aujourd\'hui 👃✨',
    priority: 'low',
  },
  {
    id: 'match_pending_response',
    category: 'matching',
    title: 'Message en attente',
    message: 'Luna a aimé ton profil… tu lui réponds ? 😏',
    priority: 'medium',
  },
  {
    id: 'match_new_encounter',
    category: 'matching',
    title: 'Nouvelle rencontre',
    message: 'Une nouvelle rencontre potentielle vient d\'apparaître ✨',
    priority: 'medium',
  },
  {
    id: 'match_prediction',
    category: 'matching',
    title: 'Coup de coeur',
    message: 'On parie que ton chien va craquer pour ce profil ? 😍',
    priority: 'low',
  },
  {
    id: 'match_waiting',
    category: 'matching',
    title: 'Whoof en attente',
    message: 'Tu as un Whoof en attente, va jeter un œil 👀',
    priority: 'medium',
  },
  {
    id: 'match_similar_duo',
    category: 'matching',
    title: 'Duo similaire',
    message: 'Un duo humain + chien te ressemble, fonce voir !',
    priority: 'low',
  },
  {
    id: 'match_same_vibes',
    category: 'matching',
    title: 'Mêmes vibes',
    message: 'Ce profil a les mêmes vibes que ton chien 🐕💫',
    priority: 'low',
  },

  // B. Balades & geolocalisation
  {
    id: 'walk_dogs_nearby',
    category: 'walks',
    title: 'Activité locale',
    message: '3 chiens se promènent dans ton quartier maintenant 🐾',
    priority: 'high',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_park_active',
    category: 'walks',
    title: 'Parc animé',
    message: 'Ton parc préféré est animé en ce moment 🌳✨',
    priority: 'medium',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_good_weather',
    category: 'walks',
    title: 'Beau temps',
    message: 'Il fait beau… c\'est le moment parfait pour une balade ☀️🐕',
    priority: 'medium',
    timing: { minHour: 9, maxHour: 19 },
  },
  {
    id: 'walk_friend_nearby',
    category: 'walks',
    title: 'Ami proche',
    message: 'Oslo est en balade près de toi 😄 Et si vous disiez bonjour ?',
    priority: 'high',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_new_route',
    category: 'walks',
    title: 'Nouvelle balade',
    message: 'Nouvelle balade populaire repérée dans ton secteur 🗺️',
    priority: 'low',
  },
  {
    id: 'walk_favorite_duo',
    category: 'walks',
    title: 'Duo favori',
    message: 'Ton duo préféré est dehors ! À quand votre balade ? 😍',
    priority: 'medium',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_energy_boost',
    category: 'walks',
    title: 'Plein d\'énergie',
    message: 'Ton chien a de l\'énergie ? On a repéré une balade à côté de chez toi ! 💨',
    priority: 'medium',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_neighborhood_active',
    category: 'walks',
    title: 'Quartier animé',
    message: 'Il y a du monde dans ton quartier, c\'est l\'heure Whoof ! 🐾',
    priority: 'medium',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_encounter_close',
    category: 'walks',
    title: 'Rencontre proche',
    message: 'Pssst… une rencontre canine est en train de se jouer à 200 m 😏',
    priority: 'high',
    timing: { minHour: 8, maxHour: 20 },
  },
  {
    id: 'walk_group_starting',
    category: 'walks',
    title: 'Balade groupée',
    message: 'Une balade groupée commence près de toi 🎉',
    priority: 'high',
    timing: { minHour: 8, maxHour: 20 },
  },

  // C. Gamification & challenges
  {
    id: 'game_daily_streak',
    category: 'gamification',
    title: 'Série en cours',
    message: '+1 journée d\'activité ! On continue ? 🏅🐶',
    priority: 'low',
  },
  {
    id: 'game_challenge_progress',
    category: 'gamification',
    title: 'Presque là',
    message: 'Tu es à 80 % du challenge du mois… encore un effort 💪🐾',
    priority: 'medium',
  },
  {
    id: 'game_top_walker',
    category: 'gamification',
    title: 'Top marcheur',
    message: 'Ton chien marche plus que 70 % des utilisateurs aujourd\'hui 😎',
    priority: 'low',
  },
  {
    id: 'game_daily_goal',
    category: 'gamification',
    title: 'Objectif du jour',
    message: 'Objectif du jour : 20 min de balade 🌳 Ready ?',
    priority: 'medium',
    timing: { minHour: 8, maxHour: 12 },
  },
  {
    id: 'game_streak_fire',
    category: 'gamification',
    title: 'Série impressionnante',
    message: 'Ton streak Whoof est impressionnant 🔥',
    priority: 'low',
  },
  {
    id: 'game_badge_unlocked',
    category: 'gamification',
    title: 'Nouveau badge',
    message: 'Nouveau badge débloqué 🎖️ Super duo !',
    priority: 'medium',
  },
  {
    id: 'game_almost_goal',
    category: 'gamification',
    title: 'Presque fini',
    message: 'Seulement 2 km restants pour atteindre ton objectif ✨',
    priority: 'medium',
  },
  {
    id: 'game_top_local',
    category: 'gamification',
    title: 'Champion local',
    message: 'Félicitations ! Tu es dans le top des marcheurs de ta zone 🏆',
    priority: 'low',
  },
  {
    id: 'game_local_star',
    category: 'gamification',
    title: 'Star locale',
    message: 'Ton chien devient une star locale ⭐',
    priority: 'low',
  },
  {
    id: 'game_weekend_challenge',
    category: 'gamification',
    title: 'Challenge weekend',
    message: 'Le challenge \'Balade du dimanche\' commence ! Participe 🐕',
    priority: 'medium',
    timing: { minHour: 9, maxHour: 12 },
  },

  // D. Réactivation
  {
    id: 'reactive_miss_you',
    category: 'reactivation',
    title: 'Tu nous manques',
    message: 'Ton chien nous manque… ça fait un moment 🥺🐾',
    priority: 'medium',
  },
  {
    id: 'reactive_new_dogs',
    category: 'reactivation',
    title: 'Nouveaux chiens',
    message: 'Depuis ton absence, 12 nouveaux chiens ont rejoint ton quartier 🐶',
    priority: 'medium',
  },
  {
    id: 'reactive_new_profiles',
    category: 'reactivation',
    title: 'Nouveaux profils',
    message: 'Des profils qui pourraient te plaire viennent d\'arriver 👀',
    priority: 'medium',
  },
  {
    id: 'reactive_nice_walk',
    category: 'reactivation',
    title: 'Belle balade',
    message: 'On a repéré une balade sympa pour toi aujourd\'hui 🌿',
    priority: 'medium',
  },
  {
    id: 'reactive_pending_whoof',
    category: 'reactivation',
    title: 'Whoof en attente',
    message: 'Un Whoof en attente depuis 5 jours… tu le laisses mariner ? 😏',
    priority: 'high',
  },
  {
    id: 'reactive_encounter_waiting',
    category: 'reactivation',
    title: 'Rencontre en attente',
    message: 'Une rencontre t\'attend au parc, mais elle ne va pas t\'attendre longtemps 👣',
    priority: 'medium',
  },
  {
    id: 'reactive_pack_waiting',
    category: 'reactivation',
    title: 'La meute t\'attend',
    message: 'On te garde une place dans la meute 🐺💕 Reviens faire un tour !',
    priority: 'low',
  },
  {
    id: 'reactive_community_miss',
    category: 'reactivation',
    title: 'Tu manques',
    message: 'Ton duo humain + chien manque à la communauté 😌',
    priority: 'low',
  },
  {
    id: 'reactive_new_features',
    category: 'reactivation',
    title: 'Nouveautés',
    message: 'Hey ! On a des nouvelles choses à te montrer 👀✨',
    priority: 'medium',
  },
  {
    id: 'reactive_perfect_day',
    category: 'reactivation',
    title: 'Jour parfait',
    message: 'Aujourd\'hui serait un beau jour pour une balade… et une rencontre 🌞',
    priority: 'medium',
  },

  // E. Partenaires & services
  {
    id: 'partner_grooming_discount',
    category: 'partners',
    title: 'Offre toilettage',
    message: 'Offre locale : -20 % toilettage pour ton chien ✂️✨',
    priority: 'low',
  },
  {
    id: 'partner_new_vet',
    category: 'partners',
    title: 'Nouveau partenaire',
    message: 'Nouveau partenaire près de toi 🩺 Découvre-le !',
    priority: 'low',
  },
  {
    id: 'partner_shop_opening',
    category: 'partners',
    title: 'Nouvelle boutique',
    message: 'Une boutique canine ouvre à côté de chez toi 🎁🐕',
    priority: 'low',
  },
  {
    id: 'partner_treats',
    category: 'partners',
    title: 'Friandises naturelles',
    message: 'Essaye ces friandises naturelles 💚 ton chien dira merci !',
    priority: 'low',
  },
  {
    id: 'partner_activity',
    category: 'partners',
    title: 'Activité dog-friendly',
    message: 'Une nouvelle activité dog-friendly t\'attend dans ton quartier 🐶🎉',
    priority: 'low',
  },

  // F. Ton complice & affectif
  {
    id: 'affective_dog_wants_out',
    category: 'affective',
    title: 'Il te regarde',
    message: 'Ton chien te regarde. Il veut sortir. Tu ne peux pas dire non 🥺🐾',
    priority: 'medium',
    timing: { minHour: 16, maxHour: 19 },
  },
  {
    id: 'affective_mood_boost',
    category: 'affective',
    title: 'Bonne humeur',
    message: 'Aujourd\'hui : 1 balade = 1 humeur améliorée 😌',
    priority: 'low',
    timing: { minHour: 9, maxHour: 12 },
  },
  {
    id: 'affective_today_could_be',
    category: 'affective',
    title: 'Et si c\'était aujourd\'hui',
    message: 'Et si c\'était aujourd\'hui la belle rencontre ? 🐶❤️🐶',
    priority: 'low',
  },
  {
    id: 'affective_deserves_adventure',
    category: 'affective',
    title: 'Une aventure',
    message: 'Ton chien mérite une aventure… la rue n\'attend que vous ✨',
    priority: 'medium',
  },
  {
    id: 'affective_small_step',
    category: 'affective',
    title: 'Petit pas',
    message: 'Un petit pas pour toi, une grande joie pour ton chien 🐾💛',
    priority: 'low',
  },
];

export const getTemplateById = (id: string): NotificationTemplate | undefined => {
  return NOTIFICATION_TEMPLATES.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: NotificationCategory): NotificationTemplate[] => {
  return NOTIFICATION_TEMPLATES.filter(t => t.category === category);
};

export const canSendAtCurrentTime = (template: NotificationTemplate): boolean => {
  if (!template.timing) return true;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  if (template.timing.minHour !== undefined && currentHour < template.timing.minHour) {
    return false;
  }
  
  if (template.timing.maxHour !== undefined && currentHour > template.timing.maxHour) {
    return false;
  }
  
  return true;
};
