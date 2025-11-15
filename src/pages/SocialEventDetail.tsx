import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Mock data pour un événement spécifique
const mockEvent = {
  id: "1",
  title: "Balade au Parc de la Tête d'Or",
  date: "2025-01-18",
  time: "17:00",
  duration: "1h30",
  location: "Parc de la Tête d'Or",
  address: "Place Général Leclerc, 69006 Lyon",
  distance: 1.4,
  image: "/placeholder.svg",
  organizer: {
    id: "org-1",
    name: "Camille",
    dogName: "Ruby",
    avatar: "/placeholder.svg",
  },
  description:
    "Balade tranquille dans le plus grand parc urbain de France ! On se retrouve à l'entrée principale pour une heure de marche sympa avec nos chiens. Idéal pour la sociabilisation et les rencontres.",
  participants: [
    { id: "1", name: "Emma & Milo", avatar: "/placeholder.svg" },
    { id: "2", name: "Lucas & Nala", avatar: "/placeholder.svg" },
    { id: "3", name: "Sophie & Max", avatar: "/placeholder.svg" },
    { id: "4", name: "Pierre & Luna", avatar: "/placeholder.svg" },
  ],
  rules: [
    "Chiens tenus en laisse obligatoire",
    "Prévoir de l'eau pour ton chien",
    "Respect des autres chiens et propriétaires",
  ],
  category: "Balade",
  isJoined: false,
};

export default function SocialEventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const event = mockEvent; // En production, fetch depuis l'API

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-accent/20 to-background">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full shadow-lg"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Share Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full shadow-lg"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <Badge className="absolute bottom-4 left-4 bg-primary">
          {event.category}
        </Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title Card */}
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-muted-foreground">
                      {event.time} • {event.duration}
                    </p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-muted-foreground">{event.distance} km</p>
                  </div>
                </div>
              </div>

              <Button className="w-full rounded-full" size="lg">
                {event.isJoined ? "Quitter l'événement" : "Rejoindre l'événement"}
              </Button>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Organisateur</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-border/50">
                    <AvatarImage src={event.organizer.avatar} />
                    <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {event.organizer.name} & {event.organizer.dogName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Organisateur
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate(`/messages/${event.organizer.id}`)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Règles & Recommandations</h3>
                <ul className="space-y-2">
                  {event.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Participants ({event.participants.length})
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {event.participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${participant.id}`)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium truncate">
                      {participant.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Lieu de rendez-vous</h2>
              <div className="space-y-2">
                <p className="text-sm font-medium">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.address}</p>
              </div>
              <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <Button variant="outline" className="w-full rounded-full">
                Ouvrir dans Maps
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
