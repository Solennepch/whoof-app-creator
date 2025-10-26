import { useState } from "react";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { IconContainer } from "@/components/ui/IconContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const mockEvents = [
  {
    title: "Balade au Parc Central",
    date: "Sam 15 Juin • 10h00",
    location: "Parc Central, Paris",
    attendees: 12,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
  },
  {
    title: "Cours d'agility débutant",
    date: "Dim 16 Juin • 14h30",
    location: "Club Canin Nord",
    attendees: 8,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
  },
  {
    title: "Rencontre Grands Chiens",
    date: "Mer 19 Juin • 18h00",
    location: "Bois de Vincennes",
    attendees: 15,
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=300&fit=crop",
  },
];

export default function Events() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-4xl px-4 pt-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Événements
            </h1>
            <p className="text-muted-foreground">Rejoins des rencontres près de chez toi</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl" style={{ backgroundColor: "var(--brand-plum)" }}>
                <Plus className="mr-2 h-4 w-4" />
                Créer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" placeholder="Ex: Balade au parc" className="rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" className="rounded-2xl" />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" className="rounded-2xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Adresse ou nom du lieu" className="rounded-2xl" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décris ton événement..."
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
                <Button className="w-full rounded-2xl" style={{ backgroundColor: "var(--brand-plum)" }}>
                  Publier l'événement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {mockEvents.map((event, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5 transition hover:shadow-md"
            >
              <div
                className="h-24 w-32 flex-shrink-0 rounded-2xl bg-cover bg-center ring-1 ring-black/5"
                style={{ backgroundImage: `url(${event.image})` }}
              />

              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--ink)" }}>
                  {event.title}
                </h3>

                <div className="space-y-1 text-sm" style={{ color: "var(--ink)", opacity: 0.7 }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event.attendees} participants
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Button variant="outline" className="rounded-2xl">
                  Participer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
