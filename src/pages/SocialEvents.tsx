import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Plus, Users, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data pour les événements
const mockEvents = [
  {
    id: "1",
    title: "Balade au Parc de la Tête d'Or",
    date: "2025-01-18",
    time: "17:00",
    location: "Lyon 6e",
    distance: 1.4,
    organizer: { name: "Camille & Ruby", avatar: "/placeholder.svg" },
    participants: [
      { id: "1", name: "Emma", avatar: "/placeholder.svg" },
      { id: "2", name: "Lucas", avatar: "/placeholder.svg" },
      { id: "3", name: "Sophie", avatar: "/placeholder.svg" },
    ],
    totalParticipants: 4,
    image: "/placeholder.svg",
    category: "balade",
    isJoined: false,
  },
  {
    id: "2",
    title: "Café Dog-Friendly — Brunch",
    date: "2025-01-19",
    time: "11:00",
    location: "Lyon 2e",
    distance: 2.1,
    organizer: { name: "Mathis & Oslo", avatar: "/placeholder.svg" },
    participants: [
      { id: "4", name: "Julie", avatar: "/placeholder.svg" },
      { id: "5", name: "Pierre", avatar: "/placeholder.svg" },
    ],
    totalParticipants: 6,
    image: "/placeholder.svg",
    category: "cafe",
    isJoined: true,
  },
  {
    id: "3",
    title: "Atelier Dressage Positif",
    date: "2025-01-20",
    time: "14:30",
    location: "Lyon 3e",
    distance: 0.8,
    organizer: { name: "Sarah Pro", avatar: "/placeholder.svg" },
    participants: [],
    totalParticipants: 8,
    image: "/placeholder.svg",
    category: "atelier",
    isJoined: false,
  },
];

const mockPastEvents = [
  {
    id: "past-1",
    title: "Balade nocturne au bord du Rhône",
    date: "2025-01-10",
    time: "19:00",
    location: "Lyon 7e",
    image: "/placeholder.svg",
    totalParticipants: 12,
  },
];

const categories = [
  { id: "all", label: "Tout", icon: null },
  { id: "balade", label: "Balade", icon: null },
  { id: "rencontre", label: "Rencontre", icon: null },
  { id: "atelier", label: "Atelier", icon: null },
  { id: "cafe", label: "Café dog-friendly", icon: null },
  { id: "dressage", label: "Dressage", icon: null },
];

export default function SocialEvents() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState(mockEvents);

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const handleJoinEvent = (eventId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, isJoined: !event.isJoined } : event
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[date.getDay()];
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold">Événements</h1>
            <p className="text-sm text-muted-foreground">
              Balades, rencontres, ateliers et activités dog-friendly.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-full flex-shrink-0"
          onClick={() => navigate("/events/create")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Créer
        </Button>
      </div>

      {/* Filtres */}
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

      {/* Section: À venir cette semaine */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">À venir cette semaine</h2>

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
              onClick={() => navigate("/events/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "overflow-hidden border-0 shadow-md cursor-pointer hover:shadow-lg transition-all rounded-2xl",
                      event.isJoined && "ring-2 ring-primary/30"
                    )}
                    onClick={() => navigate(`/social-events/${event.id}`)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                      {event.isJoined && (
                        <Badge className="absolute top-3 right-3 bg-primary">
                          ✓ Inscrit
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.date)} — {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location} • {event.distance} km
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={event.organizer.avatar} />
                            <AvatarFallback>
                              {event.organizer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs text-muted-foreground">
                            Organisé par <br />
                            <span className="font-medium text-foreground">
                              {event.organizer.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {event.participants.slice(0, 3).map((participant) => (
                              <motion.div
                                key={participant.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Avatar className="h-8 w-8 ring-2 ring-background">
                                  <AvatarImage src={participant.avatar} />
                                  <AvatarFallback>
                                    {participant.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                            ))}
                            {event.totalParticipants > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
                                +{event.totalParticipants - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.totalParticipants}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full rounded-full"
                        variant={event.isJoined ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinEvent(event.id);
                        }}
                      >
                        {event.isJoined ? "Quitter" : "Rejoindre l'événement"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Section: Carte optionnelle */}
      {filteredEvents.length > 0 && (
        <Card
          className="bg-gradient-to-br from-accent/5 to-background border-accent/20 cursor-pointer hover:shadow-md transition-all rounded-2xl"
          onClick={() => navigate("/events/map")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MapIcon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">🗺️ Afficher les événements sur la carte</h3>
              <p className="text-xs text-muted-foreground">
                Dans un rayon de 5 km autour de toi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: Événements passés */}
      {mockPastEvents.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Événements passés
          </h2>
          <div className="space-y-3">
            {mockPastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-60 hover:opacity-80 transition-opacity border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)} • {event.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.totalParticipants} participants
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Terminé
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
