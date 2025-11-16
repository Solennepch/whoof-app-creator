// Mock data for leaderboard demonstration
const TOTAL_USERS = 1354;

const dogNames = ["Rex", "Luna", "Max", "Bella", "Rocky", "Coco", "Duke", "Milo", "Zeus", "Oscar", "Charlie", "Nala", "Thor", "Daisy", "Leo", "Ruby", "Simba", "Lola"];
const ownerNames = ["Emma", "Max", "Sophie", "Pierre", "Julie", "Thomas", "Marie", "Alexandre", "Camille", "Lucas", "Léa", "Antoine", "Chloé", "Nicolas", "Sarah", "Hugo", "Laura", "Vincent"];

// Generate all users
export const generateMockLeaderboard = () => {
  const users = [];
  
  // Current user (Matcha)
  users.push({
    user_id: "129989e7-4b4c-4c67-ab79-980fb8c04d4a",
    weekly_xp: 850,
    rank: 1,
    display_name: "⭐ Emma Martin (Premium)",
    avatar_url: "/src/assets/matcha-avatar.png",
    city: "Lyon"
  });

  // Generate other users
  for (let i = 2; i <= TOTAL_USERS; i++) {
    const ownerName = ownerNames[Math.floor(Math.random() * ownerNames.length)];
    const dogName = dogNames[Math.floor(Math.random() * dogNames.length)];
    const dogImage = `/src/assets/dogs/dog-${(i % 6) + 1}.jpg`;
    
    // XP decreases with rank
    const baseXP = 850;
    const xp = Math.max(10, baseXP - (i - 1) * Math.floor(Math.random() * 5 + 3));
    
    users.push({
      user_id: `user-${i}`,
      weekly_xp: xp,
      rank: i,
      display_name: `${ownerName} & ${dogName}`,
      avatar_url: dogImage,
      city: "Lyon"
    });
  }

  return users;
};

export const TOTAL_LEADERBOARD_USERS = TOTAL_USERS;
