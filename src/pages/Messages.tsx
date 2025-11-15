import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function Messages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Chargement de tes conversations…
          </p>
        </div>
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
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-amber-700 opacity-70" />
          <h3 className="text-base font-semibold mb-2 text-amber-900">
            Aucune conversation pour l'instant
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            Tes prochains crushs canins apparaîtront ici 🐾
            <br />
            Découvre des chiens autour de toi et envoie un premier message.
          </p>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => navigate('/discover')}
          >
            Découvrir des profils
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredThreads.map((thread) => {
            const hasUnread = false; // TODO: implémenter la logique unread quand disponible
            
            return (
              <Card
                key={thread.id}
                className={cn(
                  "border-none shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all",
                  hasUnread && "bg-primary/5"
                )}
              >
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={thread.otherUser?.avatar_url || ""} />
                    <AvatarFallback>
                      {thread.otherUser?.display_name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {thread.otherUser?.display_name || "Utilisateur"}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                        {thread.lastMessage?.created_at &&
                          formatDistanceToNow(new Date(thread.lastMessage.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.lastMessage?.body || "Aucun message pour l'instant…"}
                    </p>
                  </div>
                  {hasUnread && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      1
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}