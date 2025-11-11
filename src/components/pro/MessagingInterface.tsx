import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Circle } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MessagingInterfaceProps {
  threadId: string;
  otherUser: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

export function MessagingInterface({ threadId, otherUser }: MessagingInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { useThreadMessages, sendMessage, isSending } = useMessages();
  const { data: messages = [], isLoading } = useThreadMessages(threadId);
  const { onlineUsers, typingUsers, broadcastTyping } = useRealtimeMessages(threadId);

  const isOnline = onlineUsers.has(otherUser.id);
  const isOtherUserTyping = typingUsers.some((u) => u.userId === otherUser.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const content = message;
    setMessage("");
    setIsTyping(false);
    broadcastTyping(false);

    sendMessage({
      threadId,
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback>{otherUser.display_name[0]}</AvatarFallback>
            </Avatar>
            <Circle
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 border-2 border-background rounded-full",
                isOnline ? "fill-green-500" : "fill-gray-400"
              )}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{otherUser.display_name}</CardTitle>
            {isOtherUserTyping && (
              <p className="text-xs text-muted-foreground animate-pulse">
                En train d'écrire...
              </p>
            )}
            {!isOtherUserTyping && (
              <Badge variant="secondary" className="text-xs">
                {isOnline ? "En ligne" : "Hors ligne"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Aucun message</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isOwn = msg.sender_id !== otherUser.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherUser.avatar_url || undefined} />
                    <AvatarFallback>{otherUser.display_name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{msg.body}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Votre message..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={!message.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
