export const TUTORIALS = {
  welcome: {
    id: 'welcome',
    name: 'Bienvenue sur Whoof Apps',
    steps: [
      {
        id: 'intro',
        title: 'Bienvenue ! 🐕',
        description: 'Découvrez comment trouver le compagnon de balade idéal pour votre chien en quelques étapes simples.',
        action: 'Explorez les fonctionnalités principales',
      },
      {
        id: 'matching',
        title: 'Trouvez des matchs',
        description: 'Parcourez les profils de chiens à proximité et swipez pour trouver vos futurs compagnons de balade.',
        action: 'Rendez-vous dans l\'onglet Découvrir',
        showFor: ['minimal', 'moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'messages',
        title: 'Communiquez facilement',
        description: 'Une fois le match établi, chattez avec les propriétaires pour organiser vos balades.',
        showFor: ['minimal', 'moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'xp-intro',
        title: 'Gagnez de l\'expérience',
        description: 'Complétez des actions pour gagner de l\'XP et monter de niveau. Plus vous êtes actif, plus vous débloquez de fonctionnalités !',
        action: 'Consultez votre progression dans Événements',
        showFor: ['moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'challenges',
        title: 'Relevez des challenges',
        description: 'Participez aux challenges mensuels pour gagner des récompenses exclusives et vous mesurer à la communauté.',
        showFor: ['moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'badges',
        title: 'Collectionnez des badges',
        description: 'Débloquez des badges en accomplissant des objectifs spécifiques. Montrez votre engagement à la communauté !',
        showFor: ['complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'guilds',
        title: 'Rejoignez une guilde',
        description: 'Créez ou rejoignez une guilde pour collaborer avec d\'autres passionnés et gravir les échelons ensemble.',
        showFor: ['complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'customize',
        title: 'Personnalisez votre expérience',
        description: 'Ajustez les paramètres de gamification dans Paramètres pour adapter l\'application à vos préférences.',
        action: 'Allez dans Paramètres → Gamification',
      },
    ],
  },
  
  gamification: {
    id: 'gamification',
    name: 'Système de gamification',
    steps: [
      {
        id: 'intro',
        title: 'Comprendre la gamification',
        description: 'Whoof Apps utilise des éléments de jeu pour rendre votre expérience plus engageante et amusante.',
        showFor: ['moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'xp-system',
        title: 'Système d\'XP',
        description: 'Gagnez des points d\'expérience en complétant des balades, en matchant avec d\'autres chiens, et en participant aux événements.',
        showFor: ['moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'levels',
        title: 'Niveaux et progression',
        description: 'À chaque montée de niveau, débloquez de nouvelles fonctionnalités et récompenses. Votre niveau reflète votre engagement dans la communauté.',
        showFor: ['moderate', 'complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'daily-missions',
        title: 'Missions quotidiennes',
        description: 'Complétez vos missions quotidiennes pour obtenir des bonus d\'XP et maintenir votre série active.',
        showFor: ['complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'leagues',
        title: 'Système de ligues',
        description: 'Montez dans les ligues (Bronze, Argent, Or, Platine) en fonction de vos performances hebdomadaires.',
        showFor: ['complete'] as ('minimal' | 'moderate' | 'complete')[],
      },
      {
        id: 'focus-mode',
        title: 'Mode Focus',
        description: 'Activez le mode Focus depuis le header pour masquer temporairement tous les éléments de gamification et vous concentrer sur l\'essentiel.',
      },
    ],
  },
};
