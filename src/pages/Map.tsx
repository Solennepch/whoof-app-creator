import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic29sZW5uZXBjaCIsImEiOiJjbWg3d29nNHMwd2VmMm1zN2h6OXdmZ215In0.RmXuQ4eqOhvYXaybbiAbEg";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface NearbyProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  distance_km?: number;
  lat?: number;
  lng?: number;
}


export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([2.3522, 48.8566]);
  const [nearbyProfiles, setNearbyProfiles] = useState<NearbyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nearby profiles
  const fetchNearbyProfiles = async (lng: number, lat: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('suggested', {
        body: { lat, lng, km: 5 },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) {
        console.error('Error fetching nearby profiles:', error);
        return [];
      }

      return data?.profiles || [];
    } catch (err) {
      console.error('Failed to fetch nearby profiles:', err);
      return [];
    }
  };

  // Add markers to map
  const addMarkersToMap = (profiles: NearbyProfile[], userCoords: [number, number]) => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    profiles.forEach((profile, index) => {
      let markerCoords: [number, number];

      // If no coordinates, position in circle around user
      if (!profile.lng || !profile.lat) {
        const angle = (index / profiles.length) * Math.PI * 2;
        const radius = 0.02; // ~2km circle
        markerCoords = [
          userCoords[0] + radius * Math.cos(angle),
          userCoords[1] + radius * Math.sin(angle)
        ];
      } else {
        markerCoords = [profile.lng, profile.lat];
      }

      // Create marker element
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      
      if (profile.avatar_url) {
        el.style.backgroundImage = `url(${profile.avatar_url})`;
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const distance = profile.distance_km 
        ? `${profile.distance_km.toFixed(1)} km` 
        : 'Distance inconnue';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(markerCoords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <strong style="font-size: 14px;">${profile.display_name || 'Profil'}</strong>
                <br/>
                <span style="font-size: 12px; color: #666;">${distance}</span>
              </div>
            `)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  // Initialize map and fetch profiles
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async (coords: [number, number]) => {
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

      // Fetch and display nearby profiles
      setIsLoading(true);
      const profiles = await fetchNearbyProfiles(coords[0], coords[1]);
      setNearbyProfiles(profiles);
      addMarkersToMap(profiles, coords);
      setIsLoading(false);
    };

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          initMap(coords);
        },
        () => {
          // Fallback to Paris if geolocation fails
          console.log('Geolocation failed, using default location');
          initMap(userLocation);
        }
      );
    } else {
      initMap(userLocation);
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
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
                {isLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Recherche en cours...
                  </div>
                ) : nearbyProfiles.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Aucun profil à proximité
                  </div>
                ) : (
                  nearbyProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between rounded-2xl p-3 transition hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        if (map.current && profile.lng && profile.lat) {
                          map.current.flyTo({
                            center: [profile.lng, profile.lat],
                            zoom: 15,
                            duration: 1500,
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full ring-2"
                          style={{
                            background: profile.avatar_url 
                              ? `url(${profile.avatar_url})` 
                              : "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderColor: "#EC4899",
                          }}
                        />
                        <div>
                          <p className="font-medium" style={{ color: "var(--ink)" }}>
                            {profile.display_name || 'Profil'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile.distance_km ? `${profile.distance_km.toFixed(1)} km` : 'Distance inconnue'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-full">
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
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
