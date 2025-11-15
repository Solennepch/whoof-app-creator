import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Circle, Camera, Send, User, MapPin, Flag, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export default function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { threads, useThreadMessages, sendMessage, isSending } = useMessages();
  const { data: messages = [], isLoading } = useThreadMessages(threadId);
  const { onlineUsers, typingUsers, broadcastTyping } = useRealtimeMessages(threadId);

  const thread = threads?.find((t) => t.id === threadId);
  const otherUser = thread?.otherUser;

  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
  const isOtherUserTyping = typingUsers.some((u) => u.userId === otherUser?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || !otherUser) return;

    const content = message;
    setMessage("");
    setIsTyping(false);
    broadcastTyping(false);

    sendMessage({
      threadId: threadId || "",
      receiverId: otherUser.id,
      content,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm", { locale: fr });
    } else if (isYesterday(messageDate)) {
      return `Hier · ${format(messageDate, "HH:mm", { locale: fr })}`;
    }
    return format(messageDate, "dd/MM · HH:mm", { locale: fr });
  };

  const handleDeleteConversation = () => {
    toast({
      title: "Conversation supprimée",
      description: "Cette conversation a été supprimée.",
    });
    navigate("/messages");
  };

  const handleBlockUser = () => {
    toast({
      title: "Utilisateur bloqué",
      description: "Cet utilisateur a été bloqué.",
      variant: "destructive",
    });
    navigate("/messages");
  };

  if (isLoading || !otherUser) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="border-b bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-border/50">
                <AvatarImage src={otherUser.avatar_url || undefined} />
                <AvatarFallback>{otherUser.display_name[0]}</AvatarFallback>
              </Avatar>
              <Circle
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 border-2 border-card rounded-full",
                  isOnline ? "fill-green-500" : "fill-gray-400"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{otherUser.display_name}</p>
              {isOtherUserTyping ? (
                <p className="text-xs text-primary animate-pulse">
                  En train d'écrire...
                </p>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {isOnline ? "En ligne" : "Hors ligne"}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate(`/profile/${otherUser.id}`)}>
                <User className="mr-2 h-4 w-4" />
                Voir le profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/balades?invite=${otherUser.id}`)}>
                <MapPin className="mr-2 h-4 w-4" />
                Inviter à une balade
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <Ban className="mr-2 h-4 w-4" />
                Bloquer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Signaler
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer la conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-muted-foreground">
                Aucun message pour le moment
              </p>
              <p className="text-sm text-muted-foreground">
                Envoyez un premier message pour démarrer la conversation
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isMine = msg.sender_id === user?.id;
                const showTimestamp = index === 0 || 
                  new Date(messages[index - 1].created_at!).getTime() - new Date(msg.created_at!).getTime() > 300000;

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {formatMessageTime(msg.created_at!)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2 mb-2",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2.5 rounded-2xl",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.body}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card sticky bottom-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
            >
              <Camera className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 bg-muted rounded-3xl px-4 py-2 flex items-center gap-2">
              <Input
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Écris un message..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                disabled={isSending}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              size="icon"
              className="rounded-full flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les messages de cette conversation seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous ne pourrez plus échanger de messages avec ce duo. Cette action peut être annulée depuis les paramètres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} className="bg-destructive text-destructive-foreground">
              Bloquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
