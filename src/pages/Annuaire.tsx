import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Building2, Crown, Star, Search, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_PROS, getMockProsByCategory, getMockProsNearby } from "@/config/mockPros";

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'veterinaire', label: 'Vétérinaires' },
  { value: 'toiletteur', label: 'Toiletteurs' },
  { value: 'educateur', label: 'Éducateurs canins' },
  { value: 'pension', label: 'Pensions / Garderies' },
  { value: 'boutique', label: 'Magasins spécialisés' },
  { value: 'pet-sitter', label: 'Pet-sitters' },
  { value: 'refuge', label: 'Refuges' },
  { value: 'photographe', label: 'Photographes' },
];

interface ProAccount {
  id: string;
  business_name: string;
  category: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  distance_km?: number;
  rating_avg?: number;
}

export default function Annuaire() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: isPremium, isLoading: isPremiumLoading } = usePremium();
  const [pros, setPros] = useState<ProAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get params from URL or defaults
  const selectedCategory = searchParams.get('cat') || '';
  const radius = parseInt(searchParams.get('rayon') || '25');
  const lat = parseFloat(searchParams.get('lat') || '48.8566');
  const lng = parseFloat(searchParams.get('lng') || '2.3522');

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
      
      // Si aucun résultat, utiliser les données mockées
      if (!data || data.length === 0) {
        const mockData = selectedCategory 
          ? getMockProsByCategory(selectedCategory)
          : getMockProsNearby(radius);
        setPros(mockData);
      } else {
        setPros(data);
      }
    } catch (error) {
      console.error("Error loading pros:", error);
      // En cas d'erreur, charger les données mockées
      const mockData = selectedCategory 
        ? getMockProsByCategory(selectedCategory)
        : getMockProsNearby(radius);
      setPros(mockData);
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
          toast({
            title: "Position actualisée",
            description: "Les pros autour de toi sont maintenant affichés.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Géolocalisation désactivée",
            description: "Active la géolocalisation dans les réglages de ton navigateur.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleCategoryChange = (cat: string) => {
    updateParams({ cat, page: '1' });
  };

  const filteredPros = pros.filter(pro => {
    const matchesSearch = searchQuery === "" || 
      pro.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pro.description && pro.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
    >
      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Building2 className="w-8 h-8 text-primary" />
            Annuaire Pro
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Les meilleurs pros autour de toi, prêts à prendre soin de ton chien.
          </p>
        </div>

        {/* Recherche */}
        <div className="relative animate-fade-in" style={{ animationDelay: "100ms" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un pro (vétérinaire, toiletteur…)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Boîte à filtres */}
        <Card className="p-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Filtrer par catégorie</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === cat.value 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Carte géolocalisation */}
        <Card className="p-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Actualiser ma position
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Basé sur ta localisation actuelle : {radius} km autour de toi
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={getUserLocation}
              className="rounded-full"
            >
              Actualiser
            </Button>
          </div>
        </Card>

        {/* Liste des pros */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPros.length === 0 ? (
          /* Empty state */
          <Card className="p-8 text-center space-y-4 animate-fade-in">
            <div className="text-5xl">😕</div>
            <h3 className="text-lg font-semibold text-foreground">
              Aucun pro trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              Essaie une autre catégorie ou élargis ta zone de recherche.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("");
              }}
              className="rounded-full"
            >
              Réinitialiser les filtres
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPros.map((pro, index) => (
              <Card 
                key={pro.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                style={{ animationDelay: `${400 + index * 50}ms` }}
                onClick={() => navigate(`/annuaire/${pro.id}`)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-xl">
                    <AvatarImage src={pro.logo_url} alt={pro.business_name} />
                    <AvatarFallback className="rounded-xl bg-muted text-lg">
                      {pro.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {pro.business_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {pro.category}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {pro.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pro.city}
                          {pro.distance_km && ` • ${pro.distance_km.toFixed(1)} km`}
                        </span>
                      )}
                      {pro.rating_avg && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-amber-400" />
                          {pro.rating_avg.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Section Premium */}
        {!isPremium && !isPremiumLoading && filteredPros.length > 0 && (
          <Card className="p-6 space-y-4 bg-gradient-to-br from-accent/20 to-primary/10 border-primary/20 animate-fade-in">
            <div className="flex items-start gap-3">
              <Crown className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Accès Premium 👑
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Découvre les pros en avant-première et accède aux offres exclusives.
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/premium">
                <Crown className="h-4 w-4 mr-2" />
                Devenir Premium
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
