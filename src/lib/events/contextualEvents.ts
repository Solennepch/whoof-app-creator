export interface ContextualEvent {
  id: string;
  type: 'activity_wave' | 'weather' | 'neighborhood' | 'dog_lost' | 'partner_offer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  icon: string;
  condition?: () => boolean;
}

export const CONTEXTUAL_EVENTS: ContextualEvent[] = [
  {
    id: 'activity_wave',
    type: 'activity_wave',
    priority: 'high',
    title: 'Vague d\'activité',
    message: '12 chiens actifs près de toi maintenant ! Meute en approche 🐺🎉',
    icon: '🔥',
  },
  {
    id: 'perfect_weather',
    type: 'weather',
    priority: 'medium',
    title: 'Météo idéale',
    message: 'Soleil + 20°C = balade parfaite ☀️🐾',
    icon: '🌤️',
  },
  {
    id: 'rainy_weather',
    type: 'weather',
    priority: 'low',
    title: 'Temps de pluie',
    message: 'Un peu de pluie ne fait pas peur aux vrais aventuriers 🌧️🐕',
    icon: '🌧️',
  },
  {
    id: 'neighborhood_active',
    type: 'neighborhood',
    priority: 'medium',
    title: 'Quartier animé',
    message: 'Ton quartier s\'anime : 5 nouvelles rencontres potentielles !',
    icon: '🏘️',
  },
  {
    id: 'new_park_popular',
    type: 'neighborhood',
    priority: 'low',
    title: 'Nouveau parc populaire',
    message: 'Un parc devient tendance dans ta zone 🌳✨',
    icon: '🗺️',
  },
  {
    id: 'dog_lost_alert',
    type: 'dog_lost',
    priority: 'urgent',
    title: 'Alerte chien perdu',
    message: 'Alerte : un chien perdu a été signalé dans ta zone ⚠️🐕',
    icon: '🚨',
  },
  {
    id: 'dog_found_alert',
    type: 'dog_lost',
    priority: 'high',
    title: 'Chien retrouvé',
    message: 'Bonne nouvelle ! Le chien perdu a été retrouvé 🎉❤️',
    icon: '✅',
  },
  {
    id: 'partner_weekend_offer',
    type: 'partner_offer',
    priority: 'low',
    title: 'Offre partenaire',
    message: 'Week-end spécial : une friandise offerte en boutique partenaire 🎁🐶',
    icon: '🎁',
  },
  {
    id: 'partner_grooming_offer',
    type: 'partner_offer',
    priority: 'low',
    title: 'Offre toilettage',
    message: 'Offre spéciale toilettage ce week-end ✂️✨',
    icon: '✂️',
  },
  {
    id: 'partner_vet_offer',
    type: 'partner_offer',
    priority: 'low',
    title: 'Offre vétérinaire',
    message: 'Consultation gratuite chez notre partenaire vétérinaire 🩺',
    icon: '🩺',
  },
];

export const shouldTriggerContextualEvent = (
  eventType: ContextualEvent['type'],
  context: {
    nearbyDogs?: number;
    temperature?: number;
    weather?: string;
    newProfiles?: number;
    isDogLost?: boolean;
    isDogFound?: boolean;
    hasPartnerOffer?: boolean;
  }
): boolean => {
  switch (eventType) {
    case 'activity_wave':
      return (context.nearbyDogs || 0) >= 10;
    
    case 'weather':
      return context.temperature !== undefined && 
             context.temperature >= 18 && 
             context.temperature <= 25;
    
    case 'neighborhood':
      return (context.newProfiles || 0) >= 5;
    
    case 'dog_lost':
      return context.isDogLost === true || context.isDogFound === true;
    
    case 'partner_offer':
      return context.hasPartnerOffer === true;
    
    default:
      return false;
  }
};

export const getContextualEventById = (id: string): ContextualEvent | undefined => {
  return CONTEXTUAL_EVENTS.find(event => event.id === id);
};

export const getContextualEventsByType = (type: ContextualEvent['type']): ContextualEvent[] => {
  return CONTEXTUAL_EVENTS.filter(event => event.type === type);
};
