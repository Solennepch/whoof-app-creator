import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic29sZW5uZXBjaCIsImEiOiJjbWg3d29nNHMwd2VmMm1zN2h6OXdmZ215In0.RmXuQ4eqOhvYXaybbiAbEg";

mapboxgl.accessToken = MAPBOX_TOKEN;

const nearbyDogs = [
  { name: "Luna", distance: "1.2 km", lat: 48.8566, lng: 2.3522 },
  { name: "Max", distance: "800 m", lat: 48.8576, lng: 2.3532 },
  { name: "Bella", distance: "2.1 km", lat: 48.8556, lng: 2.3512 },
];

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([2.3522, 48.8566]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          
          // Initialize map centered on user
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: coords,
            zoom: 13,
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // User marker (violet)
          const userEl = document.createElement('div');
          userEl.className = 'user-marker';
          userEl.style.width = '40px';
          userEl.style.height = '40px';
          userEl.style.borderRadius = '50%';
          userEl.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)';
          userEl.style.border = '3px solid white';
          userEl.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
          userEl.style.cursor = 'pointer';

          new mapboxgl.Marker(userEl)
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML('<div style="padding: 4px; font-weight: 600;">Vous êtes ici</div>'))
            .addTo(map.current);

          // Nearby dogs markers (rose)
          nearbyDogs.forEach((dog) => {
            const el = document.createElement('div');
            el.className = 'dog-marker';
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.borderRadius = '50%';
            el.style.background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)';
            el.style.cursor = 'pointer';
            el.style.transition = 'transform 0.2s';
            el.addEventListener('mouseenter', () => {
              el.style.transform = 'scale(1.2)';
            });
            el.addEventListener('mouseleave', () => {
              el.style.transform = 'scale(1)';
            });

            new mapboxgl.Marker(el)
              .setLngLat([dog.lng, dog.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<div style="padding: 4px;"><strong>${dog.name}</strong><br/>${dog.distance}</div>`))
              .addTo(map.current!);
          });
        },
        () => {
          // Fallback to Paris if geolocation fails
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: userLocation,
            zoom: 13,
          });

          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // Add markers even without user location
          nearbyDogs.forEach((dog) => {
            const el = document.createElement('div');
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.borderRadius = '50%';
            el.style.background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)';
            el.style.cursor = 'pointer';

            new mapboxgl.Marker(el)
              .setLngLat([dog.lng, dog.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<div style="padding: 4px;"><strong>${dog.name}</strong><br/>${dog.distance}</div>`))
              .addTo(map.current!);
          });
        }
      );
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  const handleGoToUser = () => {
    if (map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 1500,
      });
    }
  };

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

          <Button onClick={handleGoToUser} className="rounded-2xl" style={{ backgroundColor: "var(--brand-plum)" }}>
            <Navigation className="mr-2 h-4 w-4" />
            Ma position
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div ref={mapContainer} className="h-[500px] rounded-3xl shadow-soft ring-1 ring-black/5" />
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
