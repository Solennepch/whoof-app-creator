import { useState } from "react";
import { Trophy, Dog, User, Star, Sparkles } from "lucide-react";

const weeklyRankings = [
  { rank: 1, name: "Luna", walks: 28, distance: "42 km", avatar: "Dog" },
  { rank: 2, name: "Max", walks: 25, distance: "38 km", avatar: "Dog" },
  { rank: 3, name: "Toi", walks: 22, distance: "33 km", avatar: "User", isMe: true },
  { rank: 4, name: "Bella", walks: 20, distance: "30 km", avatar: "Dog" },
  { rank: 5, name: "Charlie", walks: 18, distance: "27 km", avatar: "Dog" },
  { rank: 6, name: "Lucy", walks: 16, distance: "24 km", avatar: "Dog" },
  { rank: 7, name: "Rocky", walks: 15, distance: "22 km", avatar: "Dog" },
];

const monthlyRankings = [
  { rank: 1, name: "Max", walks: 98, distance: "147 km", avatar: "Dog" },
  { rank: 2, name: "Toi", walks: 85, distance: "128 km", avatar: "User", isMe: true },
  { rank: 3, name: "Luna", walks: 82, distance: "123 km", avatar: "Dog" },
  { rank: 4, name: "Bella", walks: 76, distance: "114 km", avatar: "Dog" },
  { rank: 5, name: "Charlie", walks: 70, distance: "105 km", avatar: "Dog" },
  { rank: 6, name: "Lucy", walks: 65, distance: "98 km", avatar: "Dog" },
  { rank: 7, name: "Rocky", walks: 60, distance: "90 km", avatar: "Dog" },
];

export default function Ranking() {
  const [activeTab, setActiveTab] = useState("weekly");

  const rankings = activeTab === "weekly" ? weeklyRankings : monthlyRankings;
  const myRanking = rankings.find(r => r.isMe);

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #7B61FF 0%, #FF5DA2 50%, #FFC14D 100%)"
    }}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "0s" }} />
        <Sparkles className="absolute top-40 right-20 w-5 h-5 text-white/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute top-60 left-1/4 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-32 right-10 w-7 h-7 text-white/25 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-80 left-1/3 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "2s" }} />
        <Star className="absolute top-96 right-1/4 w-5 h-5 text-white/35 animate-pulse" style={{ animationDelay: "2.5s" }} />
        <Sparkles className="absolute bottom-40 left-20 w-4 h-4 text-white/25 animate-pulse" style={{ animationDelay: "3s" }} />
        <Star className="absolute bottom-60 right-16 w-6 h-6 text-white/30 animate-pulse" style={{ animationDelay: "3.5s" }} />
      </div>

      <main className="mx-auto max-w-[720px] px-4 pb-20 space-y-5 relative z-10">
        {/* Header */}
        <div className="pt-20 pb-4">
          <h1 className="text-3xl font-bold text-white text-center" style={{ fontFamily: "Fredoka" }}>
            Classement
          </h1>
        </div>

        {/* Sticky Summary Card */}
        {myRanking && (
          <section className="sticky top-[56px] z-10 rounded-2xl p-4 bg-gradient-to-r from-[#7B61FF] to-[#FF5DA2] text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs leading-4 opacity-90">Ta position</p>
                <p className="text-2xl font-extrabold">#{myRanking.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-xs leading-4 opacity-90">{activeTab === "weekly" ? "Cette semaine" : "Ce mois"}</p>
                <p className="text-2xl font-extrabold">{myRanking.walks} balades</p>
                <p className="text-xs leading-4 opacity-90">{myRanking.distance}</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/30 overflow-hidden">
              <div 
                className="h-full bg-white/90 transition-all duration-300" 
                style={{ width: `${Math.min((myRanking.walks / (rankings[0]?.walks || 1)) * 100, 100)}%` }}
              />
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-white/70 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === "weekly" 
                ? "bg-white shadow text-[#111827]" 
                : "text-gray-600"
            }`}
          >
            Hebdo
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === "monthly" 
                ? "bg-white shadow text-[#111827]" 
                : "text-gray-600"
            }`}
          >
            Mensuel
          </button>
        </div>

        {/* Rankings List */}
        <ul className="space-y-3">
          {rankings.map((user) => (
            <li key={user.rank}>
              <article 
                className={`rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${
                  user.isMe 
                    ? "ring-4 ring-[#7B61FF] shadow-lg scale-[1.02]" 
                    : "bg-white"
                }`}
                style={user.isMe ? {
                  background: "linear-gradient(135deg, rgba(123, 97, 255, 0.15) 0%, rgba(255, 93, 162, 0.15) 100%)",
                  backdropFilter: "blur(10px)"
                } : {}}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  {user.rank <= 3 ? (
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: user.rank === 1 ? "#FFC14D" : 
                                       user.rank === 2 ? "#E5E7EB" : 
                                       "#D1D5DB"
                      }}
                    >
                      <Trophy 
                        className="w-5 h-5"
                        style={{
                          color: user.rank === 1 ? "#ffffff" : 
                                user.rank === 2 ? "#6B7280" :
                                "#7B61FF"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-[#111827] shrink-0">
                      #{user.rank}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="min-w-0">
                    <p className="text-base font-semibold truncate text-[#111827] flex items-center gap-1">
                      {user.avatar === "Dog" ? (
                        <Dog className="w-4 h-4 inline" />
                      ) : (
                        <User className="w-4 h-4 inline" />
                      )}
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.distance}</p>
                  </div>
                </div>

                {/* Walks Count */}
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold leading-none" style={{ color: "#7B61FF" }}>
                    {user.walks}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">balades</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
