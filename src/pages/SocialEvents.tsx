import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// Type d'un événement social (à adapter côté CTO)
type SocialEvent = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO
  time?: string; // optionnel
  location: string;
  city?: string;
  hostType: "user" | "pro";
  hostName: string;
  dogFriendly: boolean;
  spotsLeft?: number;
};

// TODO CTO: remplacer ce mock par un appel Supabase / Edge Function
async function fetchSocialEvents(): Promise<SocialEvent[]> {
  // Données de démo pour que la page rende tout de suite
  const mock: SocialEvent[] = [
    {
      id: "1",
      title: "Balade de groupe au parc",
      description: "Balade tranquille entre chiens sociables, tous niveaux.",
      date: new Date().toISOString(),
      time: "10:30",
      location: "Parc de la Tête d'Or",
      city: "Lyon",
      hostType: "user",
      hostName: "Camille & Nala",
      dogFriendly: true,
      spotsLeft: 4,
    },
    {
      id: "2",
      title: "Atelier socialisation chiot",
      description: "Encadré par un éducateur canin, idéal pour les chiots timides.",
      date: new Date(Date.now() + 86400000).toISOString(), // +1 jour
      time: "15:00",
      location: "Jardin partagé des Lilas",
      city: "Paris",
      hostType: "pro",
      hostName: "Éducateur Canin Moka",
      dogFriendly: true,
      spotsLeft: 2,
    },
  ];

  await new Promise((r) => setTimeout(r, 400));
  return mock;
}

function useSocialEvents() {
  return useQuery({
    queryKey: ["social-events"],
    queryFn: fetchSocialEvents,
  });
}

export default function SocialEventsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: events, isLoading, error } = useSocialEvents();

  if (error) {
    // On affiche aussi un toast pour les vraies erreurs réseau côté CTO
    toast({
      title: "Impossible de charger les événements",
      description: "Vérifie ta connexion ou réessaie dans quelques instants.",
      variant: "destructive",
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 pb-24">
      {/* Header + CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Événements & balades</h1>
          <p className="text-xs text-muted-foreground">
            Balades de groupe, rencontres et ateliers pour ton chien.
          </p>
        </div>
        <Button
          className="rounded-full px-4"
          size="sm"
          onClick={() => navigate("/social-events/new")}
        >
          + Créer un événement
        </Button>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!events || events.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Aucun événement n'est prévu pour l'instant dans ta zone.  
            <br />
            Tu peux créer le premier et inviter d'autres maîtres à vous rejoindre 🐶
            <div className="mt-4">
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => navigate("/social-events/new")}
              >
                Créer un événement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des événements */}
      {!isLoading && events && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => (
            <SocialEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialEventCard({ event }: { event: SocialEvent }) {
  const date = new Date(event.date);
  const isPro = event.hostType === "pro";

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            {event.title}
          </CardTitle>
          <Badge variant={isPro ? "default" : "outline"} className="text-[10px]">
            {isPro ? "Pro" : "Communautaire"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {event.description && (
          <p className="text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>
              {date.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
              {event.time ? ` · ${event.time}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[140px]">
              {event.location}
              {event.city ? ` · ${event.city}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{event.hostName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {event.spotsLeft !== undefined && (
            <span className="text-[11px] text-emerald-700">
              {event.spotsLeft > 0
                ? `${event.spotsLeft} place${event.spotsLeft > 1 ? "s" : ""} restantes`
                : "Complet"}
            </span>
          )}
          {event.dogFriendly && (
            <Badge variant="outline" className="text-[10px]">
              Dog-friendly 🐾
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
