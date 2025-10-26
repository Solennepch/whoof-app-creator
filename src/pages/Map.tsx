import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { IconContainer } from "@/components/ui/IconContainer";
import { Button } from "@/components/ui/button";
import MapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic29sZW5uZXBjaCIsImEiOiJjbWg3d29nNHMwd2VmMm1zN2h6OXdmZ215In0.RmXuQ4eqOhvYXaybbiAbEg";

const nearbyDogs = [
  { name: "Luna", distance: "1.2 km", lat: 48.8566, lng: 2.3522 },
  { name: "Max", distance: "800 m", lat: 48.8576, lng: 2.3532 },
  { name: "Bella", distance: "2.1 km", lat: 48.8556, lng: 2.3512 },
];

export default function Map() {
  const [viewState, setViewState] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 13
  });

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
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="h-[500px] overflow-hidden rounded-3xl shadow-soft ring-1 ring-black/5">
              <MapGL
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                style={{ width: "100%", height: "100%" }}
              >
                {nearbyDogs.map((dog, i) => (
                  <Marker key={i} latitude={dog.lat} longitude={dog.lng}>
                    <div className="relative">
                      <div
                        className="h-10 w-10 rounded-full ring-2 ring-white shadow-lg cursor-pointer transition hover:scale-110"
                        style={{
                          background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)",
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-xs font-medium shadow-lg">
                        {dog.name}
                      </div>
                    </div>
                  </Marker>
                ))}
              </MapGL>
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
