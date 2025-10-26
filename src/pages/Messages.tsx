import { useState } from "react";
import { MessageCircle, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const conversations = [
  {
    id: 1,
    name: "Charlie & Max",
    lastMessage: "On se retrouve au parc demain ?",
    time: "10:30",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=100&h=100&fit=crop",
    unread: 2,
  },
  {
    id: 2,
    name: "Daisy & Luna",
    lastMessage: "Super balade aujourd'hui ! 🌳",
    time: "Hier",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=100&h=100&fit=crop",
    unread: 0,
  },
  {
    id: 3,
    name: "Zeus & Rocky",
    lastMessage: "Mon chien adore jouer avec le tien",
    time: "2j",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
    unread: 0,
  },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b p-4" style={{ borderColor: "hsl(var(--border))" }}>
          <h1 className="mb-4 text-2xl font-bold" style={{ color: "hsl(var(--ink))" }}>
            Messages
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" 
              style={{ color: "hsl(var(--ink) / 0.4)" }}
            />
            <Input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageCircle 
                className="mb-3 h-12 w-12" 
                style={{ color: "hsl(var(--ink) / 0.2)" }}
              />
              <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                Aucune conversation trouvée
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-black/5"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={conv.image} alt={conv.name} />
                  <AvatarFallback>{conv.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold" style={{ color: "hsl(var(--ink))" }}>
                      {conv.name}
                    </h3>
                    <span className="text-xs" style={{ color: "hsl(var(--ink) / 0.5)" }}>
                      {conv.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p 
                      className="text-sm line-clamp-1" 
                      style={{ color: "hsl(var(--ink) / 0.6)" }}
                    >
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span
                        className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: "hsl(var(--brand-raspberry))" }}
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Empty State */}
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "hsl(var(--brand-raspberry) / 0.1)" }}
            >
              <MessageCircle 
                className="h-10 w-10" 
                style={{ color: "hsl(var(--brand-raspberry))" }}
              />
            </div>
            <h2 className="mb-2 text-xl font-bold" style={{ color: "hsl(var(--ink))" }}>
              Aucun message
            </h2>
            <p className="mb-6 text-center text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              Commencez à matcher pour discuter avec d'autres propriétaires de chiens !
            </p>
            <Button style={{ backgroundColor: "hsl(var(--brand-raspberry))" }}>
              Découvrir des profils
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}