import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MapPin, Phone, Navigation as NavigationIcon, ExternalLink, Map as MapIcon, Dog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [pros, setPros] = useState<ProAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get params from URL or defaults
  const selectedCategory = searchParams.get('cat');
  const radius = parseInt(searchParams.get('rayon') || '25');
  const lat = parseFloat(searchParams.get('lat') || '48.8566');
  const lng = parseFloat(searchParams.get('lng') || '2.3522');
  const page = parseInt(searchParams.get('page') || '1');

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

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
    } catch (error) {
      console.error('Error loading pros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPros();
  }, [selectedCategory, radius, lat, lng]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateParams({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleCategoryChange = (cat: string | null) => {
    updateParams({ cat: cat || '', page: '1' });
  };

  const handleRadiusChange = (newRadius: number[]) => {
    updateParams({ rayon: newRadius[0].toString(), page: '1' });
  };

  const handleViewOnMap = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('cat', selectedCategory);
    params.set('rayon', radius.toString());
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    navigate(`/annuaire/carte?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Annuaire des professionnels
          </h1>
          <p className="text-muted-foreground">
            Trouvez les meilleurs professionnels près de chez vous
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-xl h-10"
              onClick={() => handleCategoryChange(null)}
            >
              Tous
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                className="rounded-xl h-10"
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-11"
              onClick={getUserLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Autour de moi
            </Button>
            
            <div className="flex-1 min-w-[200px] max-w-xs">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Rayon: {radius} km
                </span>
                <Slider
                  value={[radius]}
                  onValueChange={handleRadiusChange}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            <Button
              size="sm"
              className="rounded-xl h-11 text-white ml-auto"
              onClick={handleViewOnMap}
              style={{ backgroundColor: "hsl(var(--brand-plum))" }}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Voir sur la carte
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 rounded-2xl shadow-sm">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : pros.length === 0 ? (
            <Card className="p-8 rounded-2xl shadow-sm text-center">
              <Dog className="w-16 h-16 mb-4 text-primary" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink)" }}>
                Aucun professionnel trouvé
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajuste les filtres ou élargis le rayon de recherche
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  handleCategoryChange(null);
                  handleRadiusChange([25]);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Card>
          ) : (
            pros.map((pro) => (
              <Card
                key={pro.id}
                className="p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3">
                  {pro.logo_url && (
                    <img
                      src={pro.logo_url}
                      alt={pro.business_name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate mb-1" style={{ fontFamily: "Fredoka" }}>
                      {pro.business_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {CATEGORIES.find(c => c.value === pro.category)?.label || pro.category}
                      </Badge>
                      {pro.distance_km !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          · {pro.distance_km.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    {pro.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {pro.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {pro.address && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-lg text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pro.address || '')}`, '_blank');
                          }}
                        >
                          <NavigationIcon className="w-3 h-3 mr-1" />
                          Itinéraire
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-10 rounded-lg text-xs text-white"
                        onClick={() => navigate(`/annuaire/${pro.id}`)}
                        style={{ backgroundColor: "hsl(var(--brand-plum))" }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Voir la fiche
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
