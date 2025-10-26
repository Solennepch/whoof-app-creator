import { MapPin, Navigation } from "lucide-react";
import { IconContainer } from "@/components/ui/IconContainer";
import { Button } from "@/components/ui/button";

const nearbyDogs = [
  { name: "Luna", distance: "1.2 km", lat: 48.8566, lng: 2.3522 },
  { name: "Max", distance: "800 m", lat: 48.8576, lng: 2.3532 },
  { name: "Bella", distance: "2.1 km", lat: 48.8556, lng: 2.3512 },
];

export default function Map() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Carte
            </h1>
            <p className="text-muted-foreground">Trouve des chiens près de toi</p>
          </div>

          <Button className="rounded-2xl" style={{ backgroundColor: "var(--brand-plum)" }}>
            <Navigation className="mr-2 h-4 w-4" />
            Ma position
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="flex h-[500px] items-center justify-center rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
              <div className="text-center">
                <div className="mb-4 inline-flex">
                  <IconContainer>
                    <MapPin className="h-5 w-5" />
                  </IconContainer>
                </div>
                <h3 className="mb-2 text-xl font-semibold" style={{ color: "var(--ink)" }}>
                  Carte interactive
                </h3>
                <p className="text-muted-foreground">
                  L'intégration de la carte sera ajoutée prochainement
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full" style={{ backgroundColor: "var(--brand-plum)" }} />
                  <div className="h-3 w-3 animate-pulse rounded-full delay-100" style={{ backgroundColor: "var(--brand-raspberry)" }} />
                  <div className="h-3 w-3 animate-pulse rounded-full delay-200" style={{ backgroundColor: "var(--brand-yellow)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
              <h3 className="mb-4 font-semibold" style={{ color: "var(--ink)" }}>
                À proximité
              </h3>

              <div className="space-y-3">
                {nearbyDogs.map((dog, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl p-3 transition hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full ring-2"
                        style={{
                          background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)",
                          borderColor: "var(--brand-plum)",
                        }}
                      />
                      <div>
                        <p className="font-medium" style={{ color: "var(--ink)" }}>
                          {dog.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{dog.distance}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-4 shadow-soft"
              style={{
                background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)",
              }}
            >
              <h3 className="mb-2 font-semibold text-white">💡 Astuce</h3>
              <p className="text-sm text-white/90">
                Active la géolocalisation pour découvrir les chiens autour de toi en temps réel !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
