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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Tout" },
  { id: "balade", label: "Balade" },
  { id: "rencontre", label: "Rencontre" },
  { id: "atelier", label: "Atelier" },
  { id: "cafe", label: "Café dog-friendly" },
];

export default function Balades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { myWalks, friendsWalks, events, walksLoading, friendsWalksLoading, eventsLoading, createEvent, joinEvent, startWalk } = useWalks();
  const [isCreating, setIsCreating] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventPlace, setNewEventPlace] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      <div className="min-h-screen pb-24 p-6" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events?.filter((e: any) => e.category === selectedCategory) || [];

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold">Agenda & Événements</h1>
              <p className="text-sm text-muted-foreground">
                Balades, rencontres, ateliers et activités dog-friendly.
              </p>
            </div>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full flex-shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Créer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Organiser un événement</DialogTitle>
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
                  Créer l'événement
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

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap rounded-full px-4 py-2 transition-all",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

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
              <h2 className="text-xl font-semibold">À venir cette semaine</h2>
            </div>

            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 text-center"
              >
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-lg font-semibold mb-2">
                  Aucun événement pour le moment
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Crée le premier de ta zone et rencontre des duos près de toi !
                </p>
                <Button
                  size="lg"
                  className="rounded-full"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredEvents.map((event: any, index: number) => {
                    const isParticipant = event.participants?.some((p: any) => p.user_id === user?.id);
                    const participantCount = event.participants?.length || 0;
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={cn(
                          "overflow-hidden border-0 shadow-md hover:shadow-lg transition-all rounded-2xl",
                          isParticipant && "ring-2 ring-primary/30"
                        )}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {event.starts_at && format(new Date(event.starts_at), "EEE d MMM 'à' HH:mm", { locale: fr })}
                                  </div>
                                  {event.place_name && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.place_name}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {participantCount} participant{participantCount > 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                              {isParticipant ? (
                                <Badge variant="secondary" className="ml-2">Inscrit</Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleJoinEvent(event.id)}
                                  className="ml-2"
                                >
                                  Rejoindre
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
