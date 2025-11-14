export interface AnnualEvent {
  id: string;
  month: number; // 1-12
  name: string;
  description: string;
  icon: string;
  activities: string[];
  notificationTemplates: string[];
}

export const ANNUAL_EVENTS: AnnualEvent[] = [
  {
    id: 'new_year_new_pack',
    month: 1,
    name: 'Nouvelle année, nouvelle meute',
    description: 'Balade groupée nationale et mini-challenge de 7 jours',
    icon: '❄️',
    activities: [
      'Balade groupée nationale',
      'Mini-challenge de 7 jours',
      'Mode "Where is everyone?"',
    ],
    notificationTemplates: ['event_new_year_pack'],
  },
  {
    id: 'dog_match_month',
    month: 2,
    name: 'Dog Match Month',
    description: 'Événement spécial rencontres et selfies amoureux',
    icon: '💘',
    activities: [
      'Match ton chien avec un nouveau copain',
      'Semaine du Selfie Humain + Chien Amoureux',
    ],
    notificationTemplates: ['event_match_month'],
  },
  {
    id: 'spring_walk_festival',
    month: 3,
    name: 'Spring Walk Festival',
    description: 'Balades fleuries et photo challenge printanier',
    icon: '🌼',
    activities: [
      'Photo challenge "Le Printemps arrive 🌸"',
      'Classement local des chiens les plus actifs',
    ],
    notificationTemplates: ['event_spring_festival'],
  },
  {
    id: 'clean_walk_month',
    month: 4,
    name: 'Clean Walk Month',
    description: 'Balades éco-responsables avec ramassage citoyen',
    icon: '🌍',
    activities: [
      'Balades + ramassage citoyen',
      'Badges écologiques',
      'Événement sponsorisable',
    ],
    notificationTemplates: ['event_clean_walk'],
  },
  {
    id: 'pack_celebration',
    month: 5,
    name: 'Meute en fête',
    description: 'Pique-niques dog-friendly et chasse à la friandise',
    icon: '🐣',
    activities: [
      'Pique-nique dog-friendly dans chaque grande ville',
      'Chasse à la friandise virtuelle',
    ],
    notificationTemplates: ['event_pack_party'],
  },
  {
    id: 'dog_summer_prep',
    month: 6,
    name: 'Dog Summer Prep',
    description: 'Préparation été : défi silhouette et vitalité',
    icon: '☀️',
    activities: [
      'Défi silhouette & vitalité',
      'Sorties + hydratation',
      'Push météo dédiées',
    ],
    notificationTemplates: ['event_summer_prep'],
  },
  {
    id: 'beach_and_chill',
    month: 7,
    name: 'Beach & Chill',
    description: 'Spots dog-friendly et challenge photo quotidien',
    icon: '🏖️',
    activities: [
      'Spots dog-friendly en carte interactive',
      'Challenge 30 jours "1 photo par jour"',
    ],
    notificationTemplates: ['event_beach_chill'],
  },
  {
    id: 'dog_holiday_month',
    month: 8,
    name: 'Dog Holiday Month',
    description: 'Rencontres en vacances et concours coucher de soleil',
    icon: '🌞',
    activities: [
      'Cherche ton duo pour balade en vacances',
      'Concours "Le plus beau coucher de soleil"',
    ],
    notificationTemplates: ['event_holiday_month'],
  },
  {
    id: 'back_to_park',
    month: 9,
    name: 'Back to the Park',
    description: 'Retour à la routine avec challenge 20 minutes',
    icon: '🍂',
    activities: [
      'Return to routine: 20-min walk challenge',
      'Classement par ville',
    ],
    notificationTemplates: ['event_back_to_park'],
  },
  {
    id: 'howl_o_ween',
    month: 10,
    name: 'Howl-o-ween',
    description: 'Halloween canin avec costumes et balades hantées',
    icon: '🎃',
    activities: [
      'Concours costumes chiens & humains',
      'Balade hantée en réalité simple',
    ],
    notificationTemplates: ['event_halloween'],
  },
  {
    id: 'warm_walk_challenge',
    month: 11,
    name: 'Warm Walk Challenge',
    description: 'Encouragement à sortir malgré le froid',
    icon: '❄️',
    activities: [
      'Encouragement sorties hivernales',
      'Badges météo',
    ],
    notificationTemplates: ['event_warm_walk'],
  },
  {
    id: 'dogmas_party',
    month: 12,
    name: 'Dogmas Party',
    description: 'Calendrier de l\'avent et concours pull moche',
    icon: '🎄',
    activities: [
      'Calendrier de l\'avent (1 mini-défi/jour)',
      'Concours du pull moche pour chien',
    ],
    notificationTemplates: ['event_dogmas'],
  },
];

export const getCurrentMonthEvent = (): AnnualEvent | undefined => {
  const currentMonth = new Date().getMonth() + 1;
  return ANNUAL_EVENTS.find(event => event.month === currentMonth);
};

export const getEventByMonth = (month: number): AnnualEvent | undefined => {
  return ANNUAL_EVENTS.find(event => event.month === month);
};
