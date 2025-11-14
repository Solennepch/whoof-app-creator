export interface MonthlyChallenge {
  id: string;
  month: number;
  name: string;
  objective: string;
  objectiveType: 'walks' | 'matches' | 'parks' | 'photos' | 'minutes' | 'days' | 'tasks';
  objectiveTarget: number;
  reward: string;
  badge: string;
  notificationMessages: string[];
}

export const MONTHLY_CHALLENGES: MonthlyChallenge[] = [
  {
    id: 'january_restart',
    month: 1,
    name: 'Restart Your Walk',
    objective: '20 balades dans le mois',
    objectiveType: 'walks',
    objectiveTarget: 20,
    reward: 'Badge "Nouvelle Meute 2025"',
    badge: '❄️',
    notificationMessages: [
      'On démarre en douceur : ta 1ère balade de l\'année t\'attend 🐾✨',
      'Déjà 5 balades ! Continue sur ta lancée 🔥',
      'Mi-parcours atteint ! 10 balades, encore 10 🎯',
      'Plus que 5 balades pour ton badge ! 💪',
    ],
  },
  {
    id: 'february_match',
    month: 2,
    name: 'Match My Dog',
    objective: '10 nouvelles rencontres / likes / matches',
    objectiveType: 'matches',
    objectiveTarget: 10,
    reward: 'Badge "Dog Lover" + boost profil 24h',
    badge: '💘',
    notificationMessages: [
      'C\'est la saison de l\'amour… et ton chien le sent 😏❤️',
      'Premier Whoof envoyé ! Continue de flairer 👃',
      '5 Whoofs déjà ! Ton chien est populaire 🌟',
      'Encore 3 rencontres pour devenir Dog Lover ! 💕',
    ],
  },
  {
    id: 'march_explorer',
    month: 3,
    name: 'Spring Explorer',
    objective: 'Explorer 3 nouveaux parcs',
    objectiveType: 'parks',
    objectiveTarget: 3,
    reward: 'Badge "Découvreur du Printemps"',
    badge: '🌼',
    notificationMessages: [
      'Nouveau parc repéré ! C\'est le moment de l\'explorer 🌸🐕',
      'Premier parc découvert ! 2 à trouver encore 🗺️',
      'Wow ! 2 parcs explorés. Le printemps te va bien 🌸',
    ],
  },
  {
    id: 'april_clean',
    month: 4,
    name: 'Clean & Walk',
    objective: '5 balades clean-walk',
    objectiveType: 'walks',
    objectiveTarget: 5,
    reward: 'Badge "Green Paw"',
    badge: '🌍',
    notificationMessages: [
      'Une petite balade & un petit geste pour la planète ? 🌍🐾',
      'Première clean-walk ! La planète te dit merci 🌿',
      'À mi-chemin de ton badge Green Paw ! 💚',
    ],
  },
  {
    id: 'may_social',
    month: 5,
    name: 'Playdate Social Club',
    objective: 'Participer à une balade groupée',
    objectiveType: 'tasks',
    objectiveTarget: 1,
    reward: 'Badge "Social Dog"',
    badge: '🐣',
    notificationMessages: [
      'On sort en bande aujourd\'hui ? Une balade groupée débute près de toi ! 🎉',
      'Balade groupée près de chez toi dans 1h ! 🐕‍🦺',
    ],
  },
  {
    id: 'june_summer',
    month: 6,
    name: 'Summer Prep Challenge',
    objective: '600 minutes de marche cumulée',
    objectiveType: 'minutes',
    objectiveTarget: 600,
    reward: 'Badge "Summer Ready"',
    badge: '☀️',
    notificationMessages: [
      'Il fait chaud, mais pas trop : moment parfait pour une belle balade ☀️🐶',
      'Déjà 200 minutes ! Continue comme ça 💪',
      'Mi-parcours ! 300 minutes au compteur ⚡',
      'Plus que 100 minutes pour être Summer Ready ! 🏖️',
    ],
  },
  {
    id: 'july_photo',
    month: 7,
    name: 'Photo Of The Summer',
    objective: 'Poster 5 photos',
    objectiveType: 'photos',
    objectiveTarget: 5,
    reward: 'Mise en avant dans le "Top du mois"',
    badge: '🏖️',
    notificationMessages: [
      'Aujourd\'hui, capture votre moment soleil ☀️📸',
      'Première photo postée ! Encore 4 pour le top 🌟',
      'À mi-chemin ! Continue de capturer l\'été 📷',
    ],
  },
  {
    id: 'august_holiday',
    month: 8,
    name: 'Holiday Walks',
    objective: 'Marcher dans 3 lieux différents',
    objectiveType: 'parks',
    objectiveTarget: 3,
    reward: 'Badge "Globe-Trotteur 🐕"',
    badge: '🌞',
    notificationMessages: [
      'Nouvel endroit ? Partage-le avec la meute 🌍🐾',
      'Premier lieu découvert ! Où vas-tu ensuite ? 🗺️',
      'Dernière destination avant ton badge ! 🎒',
    ],
  },
  {
    id: 'september_routine',
    month: 9,
    name: 'Routine Reset',
    objective: '20 minutes par jour pendant 20 jours',
    objectiveType: 'days',
    objectiveTarget: 20,
    reward: 'Badge "Retour au Parc"',
    badge: '🍂',
    notificationMessages: [
      'Routine mode ON ! 20 minutes, easy 🌿🐶',
      'Jour 5 : la routine s\'installe 🔄',
      'Jour 10 ! Mi-parcours du challenge 💪',
      'Jour 15 : tu es incroyable ! Plus que 5 🎯',
    ],
  },
  {
    id: 'october_halloween',
    month: 10,
    name: 'Howl-o-Challenge',
    objective: 'Photo en costume',
    objectiveType: 'photos',
    objectiveTarget: 1,
    reward: 'Badge halloween + classement fun',
    badge: '🎃',
    notificationMessages: [
      'On veut ton plus beau costume… ou ton plus moche 👻🐶',
      'Photo postée ! Tu participes au classement Halloween 🎃',
    ],
  },
  {
    id: 'november_cold',
    month: 11,
    name: 'Cold Doesn\'t Scare Us',
    objective: '10 balades malgré la météo',
    objectiveType: 'walks',
    objectiveTarget: 10,
    reward: 'Badge "Brave Dog"',
    badge: '❄️',
    notificationMessages: [
      'Un peu froid mais toujours motivé ? On t\'admire ❄️🐾',
      '5 balades sous le froid ! Tu es courageux 🦸',
      'Plus que 2 balades pour le badge Brave Dog ! 💪',
    ],
  },
  {
    id: 'december_advent',
    month: 12,
    name: 'Calendar of the Paw',
    objective: '24 mini-défis',
    objectiveType: 'tasks',
    objectiveTarget: 24,
    reward: 'Badge "Dogmas Legend"',
    badge: '🎄',
    notificationMessages: [
      'Case 1 ouverte ! 🎄🐶 Aujourd\'hui : une photo près du sapin',
      'Jour 5 du calendrier : défi spécial t\'attend ! 🎁',
      'Jour 12 : mi-parcours du calendrier ! Continue 🌟',
      'Jour 20 : presque Legend ! Encore 4 défis 🏆',
    ],
  },
];

export const getCurrentMonthChallenge = (): MonthlyChallenge | undefined => {
  const currentMonth = new Date().getMonth() + 1;
  return MONTHLY_CHALLENGES.find(challenge => challenge.month === currentMonth);
};

export const getChallengeByMonth = (month: number): MonthlyChallenge | undefined => {
  return MONTHLY_CHALLENGES.find(challenge => challenge.month === month);
};
