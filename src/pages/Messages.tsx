import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Pin, Archive, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { threads, threadsLoading, togglePin, toggleArchive, deleteThread } = useMessages();

  // Filter threads
  const filteredThreads = threads?.filter((thread) => {
    const matchesSearch = thread.otherUser?.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isArchived = thread.archived_by?.includes(user?.id || "");
    
    return matchesSearch && (showArchived ? isArchived : !isArchived);
  }) || [];

  const handleDeleteConfirm = () => {
    if (deleteThreadId) {
      deleteThread(deleteThreadId);
      setDeleteThreadId(null);
    }
  };

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
        <Button
          variant="outline"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Actives" : "Archivées"}
        </Button>
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
          {filteredThreads.map((thread) => {
            const isPinned = thread.pinned_by?.includes(user?.id || "");
            const isArchived = thread.archived_by?.includes(user?.id || "");

            return (
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
                      {isPinned && (
                        <Pin className="h-4 w-4 text-primary fill-current" />
                      )}
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePin(thread.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {isPinned ? "Désépingler" : "Épingler"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleArchive(thread.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {isArchived ? "Désarchiver" : "Archiver"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteThreadId(thread.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteThreadId} onOpenChange={() => setDeleteThreadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La conversation sera supprimée de votre liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}