import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Building, ExternalLink } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const CATEGORIES = [
  { value: 'veterinaire', label: 'Vétérinaire' },
  { value: 'toiletteur', label: 'Toiletteur' },
  { value: 'educateur', label: 'Éducateur' },
  { value: 'pet-sitter', label: 'Pet-sitter' },
  { value: 'refuge', label: 'Refuge' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'pension', label: 'Pension' },
  { value: 'photographe', label: 'Photographe' },
];

interface ProAccount {
  id: string;
  business_name: string;
  category: string;
  description?: string;
  logo_url?: string;
  address?: string;
  distance_km?: number;
}

export default function Annuaire() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pros, setPros] = useState<ProAccount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radius, setRadius] = useState([25]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566], // Paris
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  const loadPros = async () => {
    setIsLoading(true);
    try {
      let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pro-directory?km=${radius[0]}`;
      
      if (userLocation) {
        url += `&lat=${userLocation[1]}&lng=${userLocation[0]}`;
      }
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load directory');

      const data = await response.json();
      setPros(data);

      // Add markers to map
      if (map.current && data.length > 0) {
        // Clear existing markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while (markers[0]) {
          markers[0].remove();
        }

        // Add new markers
        data.forEach((pro: ProAccount) => {
          if (pro.address) {
            // Would need geocoding here in production
            new mapboxgl.Marker()
              .setLngLat([2.3522, 48.8566]) // Placeholder
              .setPopup(new mapboxgl.Popup().setHTML(`<strong>${pro.business_name}</strong>`))
              .addTo(map.current!);
          }
        });
      }
    } catch (error) {
      console.error('Error loading pros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPros();
  }, [selectedCategory, radius]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          if (map.current) {
            map.current.flyTo({ center: coords, zoom: 13 });
          }
          loadPros();
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Annuaire des professionnels
          </h1>
          <p className="text-muted-foreground">
            Trouvez les meilleurs professionnels près de chez vous
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={getUserLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Autour de moi
            </Button>
            
            <div className="flex-1 max-w-xs">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Rayon: {radius[0]} km
                </span>
                <Slider
                  value={radius}
                  onValueChange={setRadius}
                  min={1}
                  max={25}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map and List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="h-[600px] rounded-2xl overflow-hidden shadow-soft">
            <div ref={mapContainer} className="w-full h-full" />
          </div>

          {/* List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : pros.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun professionnel trouvé</p>
            ) : (
              pros.map((pro) => (
                <Card
                  key={pro.id}
                  className="p-4 rounded-2xl shadow-soft cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/annuaire/${pro.id}`)}
                >
                  <div className="flex gap-4">
                    {pro.logo_url && (
                      <img
                        src={pro.logo_url}
                        alt={pro.business_name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "Fredoka" }}>
                        {pro.business_name}
                      </h3>
                      <Badge variant="outline" className="mb-2">
                        {pro.category}
                      </Badge>
                      {pro.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pro.description}
                        </p>
                      )}
                      {pro.distance_km !== undefined && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {pro.distance_km.toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
