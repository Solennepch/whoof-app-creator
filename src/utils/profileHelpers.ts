interface Dog {
  id: string;
  name: string;
  breed?: string;
  age_years?: number;
  birthdate?: string;
  temperament?: string;
  size?: string;
  avatar_url?: string;
  vaccination?: any;
  anecdote?: string;
  zodiac_sign?: string;
}

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  birth_date?: string;
  bio?: string;
  gender?: string;
  relationship_status?: string;
  interests?: string[];
  human_verified?: boolean;
}

export function calculateProfileCompletion(profile: Profile | null, dogs: Dog[]): number {
  if (!profile) return 0;
  
  let completed = 0;
  let total = 10;
  
  // Profile fields (5 points)
  if (profile.display_name) completed++;
  if (profile.avatar_url) completed++;
  if (profile.bio) completed++;
  if (profile.birth_date) completed++;
  if (profile.interests && profile.interests.length > 0) completed++;
  
  // Dog fields (5 points)
  if (dogs.length > 0) {
    const dog = dogs[0];
    if (dog.name) completed++;
    if (dog.avatar_url) completed++;
    if (dog.breed) completed++;
    if (dog.birthdate || dog.age_years) completed++;
    if (dog.temperament) completed++;
  }
  
  return Math.round((completed / total) * 100);
}

export function formatTime(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "À l'instant";
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}
