import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Plus, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWalks } from "@/hooks/useWalks";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Balades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { myWalks, friendsWalks, events, walksLoading, friendsWalksLoading, eventsLoading, createEvent, joinEvent, startWalk } = useWalks();
  const [isCreating, setIsCreating] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventPlace, setNewEventPlace] = useState("");

  const handleCreateEvent = async () => {
    if (!newEventTitle || !newEventDate || !newEventPlace) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    createEvent({
      title: newEventTitle,
      starts_at: newEventDate,
      place_name: newEventPlace,
    });
    
    setIsCreating(false);
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventPlace("");
  };

  const handleJoinEvent = (eventId: string) => {
    joinEvent(eventId);
  };

  const handleStartWalk = () => {
    startWalk({});
  };

  const isLoading = walksLoading || friendsWalksLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-xl font-semibold">Balades</h1>
          <p className="text-sm text-muted-foreground">
            Chargement des balades en cours…
          </p>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Balades</h1>
            <p className="text-xs text-muted-foreground">
              Trouve ou crée des balades pour ton chien près de chez toi.
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-4" size="sm">
                + Créer une balade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Organiser une balade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Balade au parc..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date et heure</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="place">Lieu</Label>
                  <Input
                    id="place"
                    placeholder="Parc des Buttes-Chaumont..."
                    value={newEventPlace}
                    onChange={(e) => setNewEventPlace(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateEvent} className="w-full">
                  Créer la balade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dog className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Commencer une balade maintenant</h3>
                <p className="text-sm text-muted-foreground">Lance une balade spontanée</p>
              </div>
            </div>
            <Button onClick={handleStartWalk}>
              <Plus className="mr-2 h-4 w-4" />
              Démarrer
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="mr-2 h-4 w-4" />
              Amis en balade
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Balades à venir</h2>
            </div>

            {!eventsLoading && events && events.length === 0 && (
              <div className="mb-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Aucune balade prévue pour l'instant dans ta zone.  
                Tu peux lancer la première et donner le ton aux autres maîtres 🐶
              </div>
            )}

            {events && events.length > 0 && (
              <div className="space-y-3">
                {events.map((event) => {
                  const isParticipant = event.participants?.some((p: any) => p.user_id === user?.id);
                  const participantCount = event.participants?.length || 0;
                  
                  return (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(event.starts_at), "d MMMM 'à' HH:mm", { locale: fr })}
                              </div>
                              {event.place_name && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.place_name}
                                </div>
                              )}
                            </div>
                          </div>
                          {isParticipant ? (
                            <Badge variant="secondary">Inscrit</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleJoinEvent(event.id)}
                            >
                              Rejoindre
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                          {event.capacity && (
                            <span>/ {event.capacity} max</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            <h2 className="text-xl font-semibold">Amis en balade maintenant</h2>
            
            {!friendsWalksLoading && friendsWalks && friendsWalks.length === 0 && (
              <div className="mb-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                Aucun ami en balade pour le moment.  
                Invite tes amis à rejoindre Whoof pour suivre leurs balades 🤝
              </div>
            )}
            
            {friendsWalks && friendsWalks.length > 0 && (
              <div className="space-y-3">
                {friendsWalks.map((walk: any) => (
                  <Card key={walk.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Dog className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{walk.profiles?.display_name || "Utilisateur"}</p>
                          <p className="text-sm text-muted-foreground">En balade depuis {format(new Date(walk.start_at), "HH:mm", { locale: fr })}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                          En cours
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl font-semibold">Mes balades récentes</h2>
            
            {!walksLoading && myWalks && myWalks.length === 0 && (
              <div className="mb-4 rounded-2xl border border-dashed border-purple-200 bg-purple-50 px-4 py-3 text-xs text-purple-900">
                Tu n'as pas encore de balades enregistrées.  
                Démarre ta première balade pour commencer ton historique 🐾
              </div>
            )}
            
            {myWalks && myWalks.length > 0 && (
              <div className="space-y-3">
                {myWalks.slice(0, 10).map((walk) => (
                  <Card key={walk.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(new Date(walk.start_at), "d MMMM yyyy", { locale: fr })}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {walk.duration_minutes ? `${walk.duration_minutes} min` : "En cours"}
                            </span>
                            {walk.distance_km && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {walk.distance_km.toFixed(1)} km
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={walk.status === "completed" ? "secondary" : "default"}>
                          {walk.status === "completed" ? "Terminée" : walk.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
