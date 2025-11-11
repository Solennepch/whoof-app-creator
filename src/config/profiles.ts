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
