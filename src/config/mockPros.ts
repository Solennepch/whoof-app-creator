// Mock data for professional directory demonstration

export interface MockProAccount {
  id: string;
  business_name: string;
  category: string;
  description: string;
  logo_url: string;
  address: string;
  city: string;
  distance_km: number;
  rating_avg: number;
  phone?: string;
  website?: string;
}

export const MOCK_PROS: MockProAccount[] = [
  {
    id: "pro-1",
    business_name: "Clinique Vétérinaire du Parc",
    category: "veterinaire",
    description: "Clinique vétérinaire moderne offrant soins généraux, chirurgie et urgences 24/7. Plus de 15 ans d'expérience.",
    logo_url: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=200&h=200&fit=crop",
    address: "12 Avenue des Champs",
    city: "Paris",
    distance_km: 1.2,
    rating_avg: 4.8,
    phone: "01 42 43 44 45",
    website: "www.clinique-parc.fr"
  },
  {
    id: "pro-2",
    business_name: "Toutou Zen - Toilettage",
    category: "toiletteur",
    description: "Salon de toilettage haut de gamme. Produits bio, ambiance relaxante. Spécialiste races à poils longs.",
    logo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop",
    address: "25 Rue de la Pompe",
    city: "Paris",
    distance_km: 2.5,
    rating_avg: 4.9,
    phone: "01 45 46 47 48"
  },
  {
    id: "pro-3",
    business_name: "Éduc'Canin Pro",
    category: "educateur",
    description: "Éducation canine positive, rééducation comportementale. Cours individuels et collectifs. Certifié CCAD.",
    logo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    address: "8 Boulevard Victor Hugo",
    city: "Paris",
    distance_km: 3.1,
    rating_avg: 4.7,
    phone: "01 48 49 50 51",
    website: "www.educcaninpro.fr"
  },
  {
    id: "pro-4",
    business_name: "Pension Canine Les Mimosas",
    category: "pension",
    description: "Pension familiale avec grand jardin sécurisé. Garderie à la journée. Promenades quotidiennes incluses.",
    logo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop",
    address: "45 Chemin des Vignes",
    city: "Boulogne-Billancourt",
    distance_km: 4.8,
    rating_avg: 4.6,
    phone: "01 52 53 54 55"
  },
  {
    id: "pro-5",
    business_name: "Dog & Co - Boutique",
    category: "boutique",
    description: "Magasin spécialisé : croquettes premium, accessoires design, jouets éducatifs. Conseils personnalisés.",
    logo_url: "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=200&h=200&fit=crop",
    address: "18 Rue du Commerce",
    city: "Paris",
    distance_km: 1.8,
    rating_avg: 4.5,
    phone: "01 56 57 58 59",
    website: "www.dogandco.fr"
  },
  {
    id: "pro-6",
    business_name: "Julie's Pet Sitting",
    category: "pet-sitter",
    description: "Pet-sitting à domicile, garde de jour et nuit. Diplômée comportementaliste. Disponible week-ends et vacances.",
    logo_url: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&h=200&fit=crop",
    address: "32 Rue Saint-Antoine",
    city: "Paris",
    distance_km: 2.2,
    rating_avg: 5.0,
    phone: "06 12 34 56 78"
  },
  {
    id: "pro-7",
    business_name: "Refuge SPA de Paris",
    category: "refuge",
    description: "Refuge accueillant chiens et chats abandonnés. Adoptions responsables. Programme de socialisation.",
    logo_url: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=200&h=200&fit=crop",
    address: "95 Boulevard Périphérique",
    city: "Gentilly",
    distance_km: 5.5,
    rating_avg: 4.8,
    phone: "01 60 61 62 63",
    website: "www.spa-paris.org"
  },
  {
    id: "pro-8",
    business_name: "Pawtraits Photography",
    category: "photographe",
    description: "Photos professionnelles de chiens en studio ou extérieur. Séances lifestyle, portraits, shooting famille.",
    logo_url: "https://images.unsplash.com/photo-1422565096762-bdb997a56a84?w=200&h=200&fit=crop",
    address: "7 Rue des Artistes",
    city: "Paris",
    distance_km: 3.6,
    rating_avg: 4.9,
    phone: "06 23 45 67 89",
    website: "www.pawtraits.fr"
  },
  {
    id: "pro-9",
    business_name: "Clinique Véto 24/7",
    category: "veterinaire",
    description: "Service vétérinaire d'urgence ouvert 24h/24. Équipe pluridisciplinaire, plateau technique complet.",
    logo_url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=200&h=200&fit=crop",
    address: "102 Avenue de France",
    city: "Paris",
    distance_km: 4.2,
    rating_avg: 4.7,
    phone: "01 64 65 66 67"
  },
  {
    id: "pro-10",
    business_name: "Pattes de Velours Spa",
    category: "toiletteur",
    description: "Spa canin de luxe : bain hydromassant, brushing stylé, soins des griffes. Ambiance zen garantie.",
    logo_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=200&h=200&fit=crop",
    address: "56 Avenue Montaigne",
    city: "Paris",
    distance_km: 2.9,
    rating_avg: 4.8,
    phone: "01 68 69 70 71",
    website: "www.pattesdevelours.fr"
  },
  {
    id: "pro-11",
    business_name: "Canidélite - Formation",
    category: "educateur",
    description: "Centre de formation canine. Préparation examen chien citoyen, agility, obé-rythmée. Tous niveaux.",
    logo_url: "https://images.unsplash.com/photo-1600077106724-946750eeaf3c?w=200&h=200&fit=crop",
    address: "78 Route de Versailles",
    city: "Sèvres",
    distance_km: 6.2,
    rating_avg: 4.6,
    phone: "01 72 73 74 75"
  },
  {
    id: "pro-12",
    business_name: "La Villa Canine",
    category: "pension",
    description: "Hôtel 5 étoiles pour chiens. Suites individuelles climatisées, webcam 24/7, spa et piscine sur place.",
    logo_url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=200&h=200&fit=crop",
    address: "33 Avenue du Bois",
    city: "Neuilly-sur-Seine",
    distance_km: 3.7,
    rating_avg: 5.0,
    phone: "01 76 77 78 79",
    website: "www.villacanine.fr"
  },
  {
    id: "pro-13",
    business_name: "Croquettes & Cie",
    category: "boutique",
    description: "Épicerie fine pour animaux. Alimentation bio, vrac, produits naturels. Conseil nutritionnel gratuit.",
    logo_url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop",
    address: "14 Rue de Passy",
    city: "Paris",
    distance_km: 2.4,
    rating_avg: 4.7,
    phone: "01 80 81 82 83"
  },
  {
    id: "pro-14",
    business_name: "Max & Léa Pet Care",
    category: "pet-sitter",
    description: "Duo de pet-sitters professionnels. Garde à domicile, promenades, visites médicales. Assurance RC pro.",
    logo_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop",
    address: "21 Rue Mozart",
    city: "Paris",
    distance_km: 3.3,
    rating_avg: 4.9,
    phone: "06 34 56 78 90"
  },
  {
    id: "pro-15",
    business_name: "Refuge Les Amis des Bêtes",
    category: "refuge",
    description: "Association de sauvetage et réhabilitation. Programme d'adoption éthique. Bénévolat et dons acceptés.",
    logo_url: "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=200&h=200&fit=crop",
    address: "67 Chemin Rural",
    city: "Ivry-sur-Seine",
    distance_km: 7.1,
    rating_avg: 4.5,
    phone: "01 84 85 86 87",
    website: "www.amisdesbetes.org"
  }
];

export const getMockProsByCategory = (category?: string): MockProAccount[] => {
  if (!category) return MOCK_PROS;
  return MOCK_PROS.filter(pro => pro.category === category);
};

export const getMockProsNearby = (maxDistance: number): MockProAccount[] => {
  return MOCK_PROS.filter(pro => pro.distance_km <= maxDistance)
    .sort((a, b) => a.distance_km - b.distance_km);
};
