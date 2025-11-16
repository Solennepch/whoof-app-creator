// Static profile data configuration

export type RegionProfile = {
  name: string;
  breed: string;
  age: string;
  image: string;
  bio: string;
  reasons: string[];
};

export type AdoptionProfile = RegionProfile & {
  shelter: string;
};

export const regionProfiles: RegionProfile[] = [
  {
    name: "Charlie",
    breed: "Corgi",
    age: "1 an",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&h=800&fit=crop",
    bio: "Petit mais plein d'énergie ! J'adore courir et jouer avec mes amis 🦴",
    reasons: ["Jeune", "Énergique", "Petit gabarit"],
  },
  {
    name: "Daisy",
    breed: "Beagle",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=800&fit=crop",
    bio: "Curieuse et affectueuse, toujours prête pour de nouvelles aventures ! 🌼",
    reasons: ["Affectueux", "Moyen gabarit", "Sociable"],
  },
  {
    name: "Zeus",
    breed: "Doberman",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop",
    bio: "Élégant et protecteur. Cherche des compagnons pour des balades urbaines 🏙️",
    reasons: ["Grand", "Élégant", "Urbain"],
  },
  {
    name: "Rocky",
    breed: "Golden Retriever",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",
    bio: "Doux et joueur, j'adore l'eau et les longues promenades en forêt 🌲",
    reasons: ["Calme", "Grand gabarit", "Familial"],
  },
  {
    name: "Milo",
    breed: "Jack Russell",
    age: "5 ans",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&h=800&fit=crop",
    bio: "Vif et intelligent, toujours partant pour jouer au frisbee ! 🥏",
    reasons: ["Énergique", "Petit gabarit", "Joueur"],
  },
  {
    name: "Nala",
    breed: "Husky",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=800&fit=crop",
    bio: "Aventurière dans l'âme, j'adore la neige et les grandes randonnées ❄️",
    reasons: ["Sportive", "Grand gabarit", "Aventurière"],
  },
  {
    name: "Oscar",
    breed: "Bouledogue Français",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&h=800&fit=crop",
    bio: "Tranquille et affectueux, parfait pour les soirées canapé 🛋️",
    reasons: ["Calme", "Petit gabarit", "Urbain"],
  },
  {
    name: "Luna",
    breed: "Border Collie",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&h=800&fit=crop",
    bio: "Intelligente et active, j'adore apprendre de nouveaux tours ! 🎾",
    reasons: ["Intelligent", "Moyen gabarit", "Sportive"],
  },
  {
    name: "Simba",
    breed: "Berger Allemand",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1587330979470-3595ac045ab3?w=800&h=800&fit=crop",
    bio: "Loyal et protecteur, je veille toujours sur ma famille 🛡️",
    reasons: ["Fidèle", "Grand gabarit", "Protecteur"],
  },
  {
    name: "Poppy",
    breed: "Cavalier King Charles",
    age: "1 an",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop",
    bio: "Douce et câline, j'adore me blottir contre mes humains préférés 💕",
    reasons: ["Affectueux", "Petit gabarit", "Calme"],
  },
];

export const adoptionProfiles: AdoptionProfile[] = [
  {
    name: "Luna",
    breed: "Labrador croisé",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop",
    bio: "Abandonnée mais pleine de vie ! Luna cherche une famille aimante 🌟",
    reasons: ["Affectueuse", "Calme", "Moyen gabarit", "Compatible enfants", "Coup de cœur"],
    shelter: "SPA Paris",
  },
  {
    name: "Max",
    breed: "Berger allemand",
    age: "5 ans",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=800&fit=crop",
    bio: "Fidèle et protecteur. Max a besoin d'un jardin et d'un maître expérimenté 🐕",
    reasons: ["Loyal", "Grand gabarit", "Besoin d'espace", "Sportif", "À l'adoption"],
    shelter: "SPA Lyon",
  },
  {
    name: "Bella",
    breed: "Jack Russell",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop",
    bio: "Petite mais dynamique ! Bella adore jouer et a besoin d'activité quotidienne ⚡",
    reasons: ["Énergique", "Petit gabarit", "Joueuse", "Aime les balades", "Recommandé"],
    shelter: "SPA Marseille",
  },
  {
    name: "Rocky",
    breed: "Golden Retriever",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",
    bio: "Doux géant qui adore les câlins et les enfants. Cherche une famille active 💛",
    reasons: ["Doux", "Grand gabarit", "Familial", "Compatible enfants", "Recommandé"],
    shelter: "SPA Bordeaux",
  },
  {
    name: "Mimi",
    breed: "Shih Tzu",
    age: "6 ans",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop",
    bio: "Petite princesse calme, parfaite pour la vie en appartement 👑",
    reasons: ["Calme", "Petit gabarit", "Appartement", "Senior doux", "Coup de cœur"],
    shelter: "SPA Toulouse",
  },
  {
    name: "Duke",
    breed: "Husky",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=800&fit=crop",
    bio: "Aventurier énergique qui a besoin de grands espaces et d'exercice quotidien 🏔️",
    reasons: ["Sportif", "Grand gabarit", "Besoin d'espace", "Énergique", "À l'adoption"],
    shelter: "SPA Grenoble",
  },
  {
    name: "Noisette",
    breed: "Cavalier King Charles",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop",
    bio: "Adorable et affectueuse, elle cherche une famille qui lui donnera tout l'amour 💕",
    reasons: ["Affectueuse", "Petit gabarit", "Calme", "Compatible enfants", "Coup de cœur"],
    shelter: "SPA Nice",
  },
  {
    name: "Brutus",
    breed: "Bouledogue Français",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&h=800&fit=crop",
    bio: "Petit caractère mais grand cœur ! Parfait pour la vie urbaine 🏙️",
    reasons: ["Compact", "Petit gabarit", "Urbain", "Calme", "Recommandé"],
    shelter: "SPA Lille",
  },
  {
    name: "Maya",
    breed: "Border Collie",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&h=800&fit=crop",
    bio: "Intelligente et active, cherche une famille sportive pour de longues aventures 🎾",
    reasons: ["Intelligente", "Moyen gabarit", "Sportive", "Active", "À l'adoption"],
    shelter: "SPA Nantes",
  },
  {
    name: "Simba",
    breed: "Berger Belge Malinois",
    age: "4 ans",
    image: "https://images.unsplash.com/photo-1587330979470-3595ac045ab3?w=800&h=800&fit=crop",
    bio: "Protecteur et loyal, idéal pour une famille expérimentée avec jardin 🛡️",
    reasons: ["Protecteur", "Grand gabarit", "Besoin d'espace", "Loyal", "Recommandé"],
    shelter: "SPA Strasbourg",
  },
];

export const mockLikedProfiles = [
  {
    id: "1",
    name: "Charlie",
    breed: "Corgi",
    age: "1 an",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&h=800&fit=crop",
    likedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reasons: ["Énergique", "Petit gabarit"],
    matched: false,
  },
  {
    id: "2",
    name: "Daisy",
    breed: "Beagle",
    age: "3 ans",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=800&fit=crop",
    likedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    reasons: ["Affectueux", "Sociable"],
    matched: true,
  },
  {
    id: "3",
    name: "Luna",
    breed: "Labrador croisé",
    age: "2 ans",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop",
    likedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reasons: ["Calme", "Compatible enfants"],
    matched: true,
  },
];
