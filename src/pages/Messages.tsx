import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Messages() {
  const navigate = useNavigate();
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
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">
              Chargement de tes conversations…
            </p>
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
    >
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl pb-24 md:pb-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {threads?.length === 0 
              ? "Discute avec les duos que tu rencontres 🌟" 
              : `Toutes tes discussions avec les duos PAWTES`
            }
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Rechercher un duo…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-full border-border bg-background"
        />
      </div>

      {filteredThreads.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucune conversation trouvée</p>
        </motion.div>
      )}

      {threads?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 text-center"
        >
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">
            💬 Pas encore de messages…
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Aie un match, participe à une balade,
            <br />
            ou écris à un duo que tu trouves sympa 🐶✨
          </p>
          <Button
            size="lg"
            className="rounded-full"
            onClick={() => navigate('/discover')}
          >
            Découvrir des duos
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filteredThreads.map((thread, index) => {
            const hasUnread = false; // TODO: implémenter la logique unread quand disponible
            
            return (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "border-0 shadow-sm cursor-pointer hover:shadow-md transition-all rounded-2xl overflow-hidden",
                    hasUnread && "bg-primary/5 ring-2 ring-primary/20"
                  )}
                  onClick={() => navigate(`/messages/${thread.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 ring-2 ring-border/50">
                        <AvatarImage src={thread.otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {thread.otherUser?.display_name?.[0] || '🐶'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-base truncate">
                            {thread.otherUser?.display_name || 'Utilisateur inconnu'}
                          </p>
                          <div className="flex items-center gap-2">
                            {hasUnread && (
                              <Badge 
                                variant="destructive" 
                                className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                              >
                                2
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {thread.lastMessage?.created_at
                                ? formatDistanceToNow(new Date(thread.lastMessage.created_at), {
                                    addSuffix: false,
                                    locale: fr,
                                  }).replace('environ ', '')
                                : ''}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.lastMessage?.body ? `🐾 "${thread.lastMessage.body}"` : 'Aucun message'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}