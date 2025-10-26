import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

const weeklyRankings = [
  { rank: 1, name: "Luna", walks: 28, distance: "42 km", avatar: "🐕" },
  { rank: 2, name: "Max", walks: 25, distance: "38 km", avatar: "🐶" },
  { rank: 3, name: "Toi", walks: 22, distance: "33 km", avatar: "👤", isMe: true },
  { rank: 4, name: "Bella", walks: 20, distance: "30 km", avatar: "🦮" },
  { rank: 5, name: "Charlie", walks: 18, distance: "27 km", avatar: "🐕‍🦺" },
  { rank: 6, name: "Lucy", walks: 16, distance: "24 km", avatar: "🐩" },
  { rank: 7, name: "Rocky", walks: 15, distance: "22 km", avatar: "🐕" },
];

const monthlyRankings = [
  { rank: 1, name: "Max", walks: 98, distance: "147 km", avatar: "🐶" },
  { rank: 2, name: "Toi", walks: 85, distance: "128 km", avatar: "👤", isMe: true },
  { rank: 3, name: "Luna", walks: 82, distance: "123 km", avatar: "🐕" },
  { rank: 4, name: "Bella", walks: 76, distance: "114 km", avatar: "🦮" },
  { rank: 5, name: "Charlie", walks: 70, distance: "105 km", avatar: "🐕‍🦺" },
  { rank: 6, name: "Lucy", walks: 65, distance: "98 km", avatar: "🐩" },
  { rank: 7, name: "Rocky", walks: 60, distance: "90 km", avatar: "🐕" },
];

export default function Ranking() {
  const [activeTab, setActiveTab] = useState("weekly");

  const rankings = activeTab === "weekly" ? weeklyRankings : monthlyRankings;
  const myRanking = rankings.find(r => r.isMe);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <main className="pt-20 px-3 sm:px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-end mb-4">
          <h1 
            className="text-2xl sm:text-3xl font-bold" 
            style={{ color: "hsl(var(--ink))", fontFamily: "Fredoka" }}
          >
            Classement
          </h1>
        </div>

        {/* My Stats Card */}
        {myRanking && (
          <Card 
            className="mb-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft"
            style={{ 
              background: "linear-gradient(135deg, hsl(var(--brand-plum)) 0%, hsl(var(--brand-raspberry)) 100%)" 
            }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-2xl sm:text-4xl">🏆</div>
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Ta position</p>
                  <p className="text-2xl sm:text-3xl font-bold">#{myRanking.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm opacity-90">{activeTab === "weekly" ? "Cette semaine" : "Ce mois"}</p>
                <p className="text-lg sm:text-xl font-semibold">{myRanking.walks} balades</p>
                <p className="text-xs sm:text-sm opacity-90">{myRanking.distance}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 rounded-2xl">
            <TabsTrigger value="weekly" className="rounded-xl text-xs sm:text-sm">
              Hebdo
            </TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl text-xs sm:text-sm">
              Mensuel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-2">
            {weeklyRankings.map((user) => (
              <Card
                key={user.rank}
                className={`p-3 sm:p-4 rounded-2xl shadow-soft transition-all ${
                  user.isMe ? "ring-2 ring-brand-raspberry" : ""
                }`}
                style={{ backgroundColor: user.isMe ? "hsl(var(--brand-raspberry) / 0.05)" : "hsl(var(--paper))" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Rank Badge */}
                    <div className="relative shrink-0">
                      {user.rank <= 3 ? (
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full" style={{
                          backgroundColor: user.rank === 1 ? "hsl(var(--brand-yellow))" : 
                                         user.rank === 2 ? "hsl(var(--muted))" : 
                                         "hsl(var(--border))"
                        }}>
                          <span className="text-xl sm:text-2xl">{user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: "hsl(var(--muted))" }}>
                          <span className="font-bold text-sm sm:text-base" style={{ color: "hsl(var(--ink))" }}>#{user.rank}</span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-lg truncate" style={{ color: "hsl(var(--ink))" }}>
                        <span className="text-base sm:text-xl">{user.avatar}</span> {user.name}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                        {user.distance}
                      </p>
                    </div>
                  </div>

                  {/* Walks Count */}
                  <div className="text-right shrink-0">
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: "hsl(var(--brand-plum))" }}>
                      {user.walks}
                    </p>
                    <p className="text-xs whitespace-nowrap" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                      balades
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-2">
            {monthlyRankings.map((user) => (
              <Card
                key={user.rank}
                className={`p-3 sm:p-4 rounded-2xl shadow-soft transition-all ${
                  user.isMe ? "ring-2 ring-brand-raspberry" : ""
                }`}
                style={{ backgroundColor: user.isMe ? "hsl(var(--brand-raspberry) / 0.05)" : "hsl(var(--paper))" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Rank Badge */}
                    <div className="relative shrink-0">
                      {user.rank <= 3 ? (
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full" style={{
                          backgroundColor: user.rank === 1 ? "hsl(var(--brand-yellow))" : 
                                         user.rank === 2 ? "hsl(var(--muted))" : 
                                         "hsl(var(--border))"
                        }}>
                          <span className="text-xl sm:text-2xl">{user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: "hsl(var(--muted))" }}>
                          <span className="font-bold text-sm sm:text-base" style={{ color: "hsl(var(--ink))" }}>#{user.rank}</span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-lg truncate" style={{ color: "hsl(var(--ink))" }}>
                        <span className="text-base sm:text-xl">{user.avatar}</span> {user.name}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                        {user.distance}
                      </p>
                    </div>
                  </div>

                  {/* Walks Count */}
                  <div className="text-right shrink-0">
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: "hsl(var(--brand-plum))" }}>
                      {user.walks}
                    </p>
                    <p className="text-xs whitespace-nowrap" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                      balades
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
