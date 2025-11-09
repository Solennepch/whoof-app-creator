import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, MapPin, Navigation } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxToken } from '@/lib/mapbox-config';

// Initialize Mapbox token
const mapboxToken = getMapboxToken();

if (!mapboxToken) {
  console.error('❌ MAPBOX TOKEN ERROR: No Mapbox token found.');
} else {
  console.log('✅ Mapbox token loaded successfully');
  mapboxgl.accessToken = mapboxToken;
}

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

export default function AnnuaireMap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pros, setPros] = useState<ProAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get params from URL
  const selectedCategory = searchParams.get('cat');
  const radius = parseInt(searchParams.get('rayon') || '25');
  const lat = parseFloat(searchParams.get('lat') || '48.8566');
  const lng = parseFloat(searchParams.get('lng') || '2.3522');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  const loadPros = async () => {
    setIsLoading(true);
    try {
      let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pro-directory?km=${radius}`;
      url += `&lat=${lat}&lng=${lng}`;
      
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
            // Placeholder coordinates - would need geocoding in production
            new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<strong>${pro.business_name}</strong><br/>${pro.category}`))
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
  }, [selectedCategory, radius, lat, lng]);

  const handleBackToList = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('cat', selectedCategory);
    params.set('rayon', radius.toString());
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    navigate(`/annuaire?${params.toString()}`);
  };

  const handleRecenterMap = () => {
    if (map.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 13 });
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 pt-20">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Carte des professionnels
            </h1>
            <p className="text-sm text-muted-foreground">
              {pros.length} professionnel{pros.length > 1 ? 's' : ''} trouvé{pros.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleRecenterMap}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Recentrer
            </Button>
            
            <Button
              size="sm"
              className="rounded-xl text-white"
              onClick={handleBackToList}
              style={{ backgroundColor: "hsl(var(--brand-plum))" }}
            >
              <List className="w-4 h-4 mr-2" />
              Voir en liste
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="h-[calc(100vh-12rem)] rounded-2xl overflow-hidden shadow-soft">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
