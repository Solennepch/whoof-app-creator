import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { threads, threadsLoading } = useMessages();

  // Filter threads
  const filteredThreads = threads?.filter((thread) => {
    const matchesSearch = thread.otherUser?.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (threadsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            {filteredThreads.length} conversation(s)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredThreads.length === 0 && searchQuery && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune conversation trouvée</p>
          </div>
        </Card>
      )}

      {threads?.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Aucun message</h3>
            <p className="text-muted-foreground mb-6">
              Commencez une conversation avec d'autres propriétaires de chiens
            </p>
            <Button>Découvrir des profils</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              className="p-4 cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={thread.otherUser?.avatar_url || ""} />
                  <AvatarFallback>
                    {thread.otherUser?.display_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {thread.otherUser?.display_name || "Utilisateur"}
                    </h3>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {thread.lastMessage?.created_at &&
                        formatDistanceToNow(new Date(thread.lastMessage.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {thread.lastMessage?.body || "Aucun message"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}