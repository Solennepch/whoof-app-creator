// Mock data for leaderboard demonstration
const TOTAL_USERS = 1354;

const dogNames = ["Rex", "Luna", "Max", "Bella", "Rocky", "Coco", "Duke", "Milo", "Zeus", "Oscar", "Charlie", "Nala", "Thor", "Daisy", "Leo", "Ruby", "Simba", "Lola"];
const ownerNames = ["Emma", "Max", "Sophie", "Pierre", "Julie", "Thomas", "Marie", "Alexandre", "Camille", "Lucas", "Léa", "Antoine", "Chloé", "Nicolas", "Sarah", "Hugo", "Laura", "Vincent"];

// Generate all users
export const generateMockLeaderboard = () => {
  const users = [];
  
  // First place: Scoubidou
  users.push({
    user_id: "user-max",
    weekly_km: 45.0,
    weekly_walks: 14,
    rank: 1,
    display_name: "Scoubidou",
    avatar_url: "/src/assets/dogs/dog-1.jpg",
    city: "Lyon"
  });

  // Current user (Matcha) - 2nd place
  users.push({
    user_id: "129989e7-4b4c-4c67-ab79-980fb8c04d4a",
    weekly_km: 42.5,
    weekly_walks: 12,
    rank: 2,
    display_name: "Matcha & Solenne",
    avatar_url: "/src/assets/matcha-avatar.png",
    city: "Lyon"
  });

  // Generate other users
  for (let i = 3; i <= TOTAL_USERS; i++) {
    const dogName = dogNames[Math.floor(Math.random() * dogNames.length)];
    
    // Assign fixed photos for top 10
    let dogImage;
    if (i <= 10) {
      dogImage = `/src/assets/dogs/dog-${((i - 2) % 6) + 1}.jpg`;
    } else {
      dogImage = `/src/assets/dogs/dog-${(i % 6) + 1}.jpg`;
    }
    
    // Km and walks decrease with rank
    const baseKm = 42.5;
    const baseWalks = 12;
    const km = Math.max(0.5, baseKm - (i - 1) * (Math.random() * 0.8 + 0.2));
    const walks = Math.max(1, Math.floor(baseWalks - (i - 1) * 0.08));
    
    users.push({
      user_id: `user-${i}`,
      weekly_km: Math.round(km * 10) / 10,
      weekly_walks: walks,
      rank: i,
      display_name: dogName,
      avatar_url: dogImage,
      city: "Lyon"
    });
  }

  return users;
};

export const TOTAL_LEADERBOARD_USERS = TOTAL_USERS;
