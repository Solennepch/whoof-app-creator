import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile, useProMessages } from "@/hooks/usePro";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProMessages() {
  const navigate = useNavigate();
  const { data: profile } = useMyProProfile();
  const { data: conversations, isLoading } = useProMessages(profile?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pro/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground">
            {conversations?.length || 0} conversation(s)
          </p>
        </div>
      </div>

      {conversations && conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
            <p className="text-muted-foreground text-center">
              Vous recevrez ici les messages des utilisateurs intéressés par vos services
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations?.map((conv) => (
            <Card key={conv.user_id} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={conv.user_avatar || undefined} />
                    <AvatarFallback>{conv.user_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{conv.user_name}</CardTitle>
                      {conv.unread && (
                        <Badge variant="destructive" className="text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conv.last_message_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
