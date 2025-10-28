import { useEffect, useRef, useState } from "react";
import { MapPin, Locate, MessageCircle, X, Shield, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AnimatedLikeButton } from "@/components/ui/AnimatedLikeButton";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMapboxToken } from "@/lib/mapbox-config";
import dog1 from "@/assets/dogs/dog-1.jpg";
import dog2 from "@/assets/dogs/dog-2.jpg";
import dog3 from "@/assets/dogs/dog-3.jpg";
import dog4 from "@/assets/dogs/dog-4.jpg";
import dog5 from "@/assets/dogs/dog-5.jpg";
import dog6 from "@/assets/dogs/dog-6.jpg";

// Initialize Mapbox token
const mapboxToken = getMapboxToken();

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

console.log('🔑 Checking Mapbox token...');
console.log('Token exists:', !!mapboxToken);
console.log('Token prefix:', mapboxToken ? mapboxToken.substring(0, 8) + '...' : 'NO TOKEN');

if (!mapboxToken) {
  console.error('❌ MAPBOX TOKEN ERROR: No Mapbox token found.');
} else {
  console.log('✅ Mapbox token loaded successfully');
  mapboxgl.accessToken = mapboxToken;
}

interface NearbyProfile {
  id: string;
  user_id?: string;
  display_name: string;
  avatar_url?: string;
  distance_km?: number;
  distance_m?: number;
  lat?: number;
  lng?: number;
  breed?: string;
  temperament?: string;
  size?: string;
  verified?: boolean;
  isOnline?: boolean;
  walkMood?: string;
}

interface POI {
  id: string;
  type: 'veterinaire' | 'pet_sitter' | 'restaurant';
  name: string;
  lat: number;
  lng: number;
  distance_km?: number;
  address?: string;
  rating?: number;
}


export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([2.3522, 48.8566]);
  const [nearbyProfiles, setNearbyProfiles] = useState<NearbyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<NearbyProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radius, setRadius] = useState(25);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Generate mock profiles for development
  const generateMockProfiles = (lng: number, lat: number, count: number = 8): NearbyProfile[] => {
    const dogNames = [
      'Max', 'Luna', 'Charlie', 'Bella', 'Rocky', 'Daisy', 
      'Cooper', 'Milo', 'Lola', 'Zeus', 'Nala', 'Oscar'
    ];
    const breeds = [
      'Golden Retriever', 'Labrador', 'Berger Allemand', 'Bouledogue Français',
      'Beagle', 'Husky', 'Border Collie', 'Caniche'
    ];
    const sizes = ['Petit', 'Moyen', 'Grand'];
    const temperaments = ['Calme', 'Joueur', 'Énergique', 'Amical'];
    const walkMoods = [
      '🏃 Envie de courir',
      '🌳 Balade au parc',
      '☕ Promenade tranquille',
      '🎾 Jeu de balle',
      '🌅 Balade matinale',
      '🐕 Socialisation'
    ];
    const dogImages = [dog1, dog2, dog3, dog4, dog5, dog6];

    return Array.from({ length: count }, (_, i) => {
      // Random offset within ~2km radius
      const angle = Math.random() * Math.PI * 2;
      const radius = (Math.random() * 0.02) + 0.005; // 0.5-2km roughly
      const randomLng = lng + radius * Math.cos(angle);
      const randomLat = lat + radius * Math.sin(angle);
      const distance_m = radius * 111000; // rough conversion to meters

      return {
        id: `mock-${i}`,
        user_id: `user-mock-${i}`,
        display_name: dogNames[i % dogNames.length],
        avatar_url: dogImages[i % dogImages.length],
        distance_km: distance_m / 1000,
        distance_m: distance_m,
        lat: randomLat,
        lng: randomLng,
        breed: breeds[i % breeds.length],
        size: sizes[i % sizes.length],
        temperament: temperaments[i % temperaments.length],
        verified: Math.random() > 0.5,
        isOnline: Math.random() > 0.3, // 70% en ligne
        walkMood: Math.random() > 0.2 ? walkMoods[i % walkMoods.length] : undefined
      };
    });
  };

  // Generate mock POIs for development
  const generateMockPOIs = (lng: number, lat: number): POI[] => {
    const vets = [
      { name: 'Clinique Vétérinaire du Centre', address: '12 Rue de la Paix' },
      { name: 'Cabinet Dr. Martin', address: '45 Avenue des Champs' },
      { name: 'Vétérinaire de Garde 24/7', address: '78 Boulevard Saint-Michel' }
    ];
    const petSitters = [
      { name: 'Dog Walker Pro', address: '23 Rue du Parc' },
      { name: 'Pet Care Services', address: '56 Avenue Voltaire' },
      { name: 'Garderie Toutous Heureux', address: '89 Rue Lafayette' }
    ];
    const restaurants = [
      { name: 'Le Bistrot des Chiens', address: '34 Place du Marché' },
      { name: 'Café Canin', address: '67 Rue de Rivoli' },
      { name: 'Restaurant La Patte d\'Or', address: '90 Boulevard Haussmann' }
    ];

    const allPOIs: POI[] = [];
    let poiId = 0;

    // Add vets
    vets.forEach((vet, i) => {
      const angle = (i / vets.length) * Math.PI * 2;
      const radius = 0.015;
      allPOIs.push({
        id: `vet-${poiId++}`,
        type: 'veterinaire',
        name: vet.name,
        address: vet.address,
        lat: lat + radius * Math.sin(angle),
        lng: lng + radius * Math.cos(angle),
        rating: 4 + Math.random()
      });
    });

    // Add pet sitters
    petSitters.forEach((ps, i) => {
      const angle = (i / petSitters.length) * Math.PI * 2 + Math.PI / 3;
      const radius = 0.012;
      allPOIs.push({
        id: `ps-${poiId++}`,
        type: 'pet_sitter',
        name: ps.name,
        address: ps.address,
        lat: lat + radius * Math.sin(angle),
        lng: lng + radius * Math.cos(angle),
        rating: 4 + Math.random()
      });
    });

    // Add restaurants
    restaurants.forEach((rest, i) => {
      const angle = (i / restaurants.length) * Math.PI * 2 + Math.PI / 6;
      const radius = 0.018;
      allPOIs.push({
        id: `rest-${poiId++}`,
        type: 'restaurant',
        name: rest.name,
        address: rest.address,
        lat: lat + radius * Math.sin(angle),
        lng: lng + radius * Math.cos(angle),
        rating: 4 + Math.random()
      });
    });

    return allPOIs;
  };

  // Fetch nearby profiles
  const fetchNearbyProfiles = async (lng: number, lat: number) => {
    try {
      // For development: use mock data
      // Comment out this line and uncomment the API call below for production
      console.log('🧪 Using mock profiles for development');
      return generateMockProfiles(lng, lat);

      /* Uncomment for production API call:
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

      // Map the data to include distance_km
      const profiles = (data || []).map((profile: any) => ({
        ...profile,
        distance_km: profile.distance_m ? profile.distance_m / 1000 : null,
        user_id: profile.id, // Ensure we have user_id for actions
      }));

      return profiles;
      */
    } catch (err) {
      console.error('Failed to fetch nearby profiles:', err);
      return [];
    }
  };

  // Handle profile selection
  const handleSelectProfile = (profile: NearbyProfile) => {
    setSelectedProfile(profile);
    setIsDrawerOpen(true);

    // Center and zoom on the profile
    if (map.current && profile.lng && profile.lat) {
      map.current.flyTo({
        center: [profile.lng, profile.lat],
        zoom: 15,
        duration: 1500,
      });
    }
  };

  // Handle like action with optimistic UI
  const handleLike = async () => {
    if (!selectedProfile?.user_id) return;

    const profileId = selectedProfile.user_id;
    const wasLiked = likedProfiles.has(profileId);

    // Optimistic UI: update state immediately
    setLikedProfiles((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });

    setIsLiking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Vous devez être connecté pour aimer un profil");
      }

      const { data, error } = await supabase.functions.invoke('swipe', {
        body: { 
          action: wasLiked ? 'pass' : 'like',
          to_user: profileId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Show match toast if applicable
      if (data.match && !wasLiked) {
        toast({
          title: "C'est un match ! 🎉",
          description: "Vous pouvez maintenant échanger ensemble !",
          action: data.chat_id ? (
            <Button
              size="sm"
              onClick={() => navigate(`/chat?c=${data.chat_id}`)}
              className="rounded-full"
            >
              Ouvrir le chat
            </Button>
          ) : undefined,
        });
      } else if (!wasLiked) {
        toast({
          title: "Like envoyé ❤️",
          description: "Votre intérêt a été envoyé avec succès",
        });
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      
      // Rollback optimistic UI on error
      setLikedProfiles((prev) => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(profileId);
        } else {
          newSet.delete(profileId);
        }
        return newSet;
      });

      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'aimer ce profil, réessaie plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  // Handle walk invitation
  const handleInviteWalk = async () => {
    if (!selectedProfile?.user_id) return;

    setIsInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('invite-walk', {
        body: { 
          to_user: selectedProfile.user_id,
          message: `Envie d'une balade avec ${selectedProfile.display_name || 'votre chien'} ?`
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;

      toast({
        title: "Invitation envoyée ! 🐾",
        description: "Votre invitation à la promenade a été envoyée avec succès",
      });
      
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error inviting to walk:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Add markers to map with clustering
  const addMarkersToMap = (profiles: NearbyProfile[], pois: POI[], userCoords: [number, number]) => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Prepare GeoJSON data for clustering
    const geojsonData: any = {
      type: 'FeatureCollection',
      features: profiles.map((profile, index) => {
        let coords: [number, number];

        // If no coordinates, position in circle around user
        if (!profile.lng || !profile.lat) {
          const angle = (index / profiles.length) * Math.PI * 2;
          const radius = 0.02;
          coords = [
            userCoords[0] + radius * Math.cos(angle),
            userCoords[1] + radius * Math.sin(angle)
          ];
        } else {
          coords = [profile.lng, profile.lat];
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: {
            ...profile,
            coords
          }
        };
      })
    };

    // Add source and layers for clustering
    if (!map.current.getSource('profiles')) {
      map.current.addSource('profiles', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster circles
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'profiles',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#EC4899',
            10,
            '#BE185D',
            30,
            '#9F1239'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff'
        }
      });

      // Cluster count labels
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'profiles',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Unclustered points
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'profiles',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#EC4899',
          'circle-radius': 18,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff'
        }
      });

      // Click on cluster to zoom
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        (map.current!.getSource('profiles') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;

            map.current!.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Click on unclustered point to show details
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return;
        const profile = e.features[0].properties as any;
        
        // Parse the profile data
        const parsedProfile: NearbyProfile = {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          distance_km: profile.distance_km,
          distance_m: profile.distance_m,
          lat: profile.lat,
          lng: profile.lng,
          breed: profile.breed,
          temperament: profile.temperament,
          size: profile.size,
          verified: profile.verified === 'true' || profile.verified === true
        };

        handleSelectProfile(parsedProfile);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    } else {
      // Update existing source
      (map.current.getSource('profiles') as mapboxgl.GeoJSONSource).setData(geojsonData);
    }

    // Add POI markers - Filter by selected category
    const filteredPOIs = pois.filter(poi => {
      if (!selectedCategory) return true; // Show all if no filter
      return poi.type === selectedCategory;
    });

    filteredPOIs.forEach(poi => {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';

      // Style based on POI type
      if (poi.type === 'veterinaire') {
        el.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v20"/><path d="M2 11h20"/><circle cx="11" cy="11" r="9"/></svg>';
      } else if (poi.type === 'pet_sitter') {
        el.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>';
      } else if (poi.type === 'restaurant') {
        el.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 8px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${poi.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${poi.address || ''}</div>
          <div style="font-size: 12px;">
            ${'⭐'.repeat(Math.floor(poi.rating || 4))} ${(poi.rating || 4).toFixed(1)}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  // Initialize map and fetch profiles
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is available
    if (!mapboxToken) {
      console.error('Cannot initialize map: Mapbox token is missing');
      setIsLoading(false);
      toast({
        title: "Erreur de configuration",
        description: "Le token Mapbox n'est pas configuré. Contactez l'administrateur.",
        variant: "destructive",
      });
      return;
    }

    const initMap = async (coords: [number, number]) => {
      try {
        console.log('🗺️ Initializing map at coordinates:', coords);
        
        // Initialize map centered on user
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: coords,
          zoom: 13,
        });

        // Wait for map to load
        map.current.on('load', () => {
          console.log('✅ Map loaded successfully with Mapbox');
        });

        map.current.on('error', (e: any) => {
          console.error('❌ Map error:', e);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // User marker (violet) - position actuelle
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
          .setPopup(new mapboxgl.Popup().setHTML('<div style="padding: 4px; font-weight: 600;">Vous êtes ici 📍</div>'))
          .addTo(map.current);

        console.log('✅ User marker added at', coords);

        // Fetch and display nearby profiles and POIs
        setIsLoading(true);
        const profiles = await fetchNearbyProfiles(coords[0], coords[1]);
        const generatedPOIs = generateMockPOIs(coords[0], coords[1]);
        setNearbyProfiles(profiles);
        setPois(generatedPOIs);
        addMarkersToMap(profiles, generatedPOIs, coords);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
        toast({
          title: "Erreur",
          description: "Impossible de charger la carte. Vérifiez votre connexion.",
          variant: "destructive",
        });
      }
    };

    // Get user location
    if (navigator.geolocation) {
      console.log('🌍 Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          console.log('✅ Geolocation obtained:', coords);
          setUserLocation(coords);
          initMap(coords);
        },
        (error) => {
          // Fallback to Paris if geolocation fails
          console.log('⚠️ Geolocation failed, using default location (Paris):', error.message);
          toast({
            title: "Localisation désactivée",
            description: "Affichage de Paris par défaut. Activez la géolocalisation pour voir votre position.",
          });
          initMap(userLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.log('⚠️ Geolocation not supported, using default location (Paris)');
      toast({
        title: "Géolocalisation non disponible",
        description: "Affichage de Paris par défaut.",
      });
      initMap(userLocation);
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    if (map.current && nearbyProfiles.length > 0) {
      addMarkersToMap(nearbyProfiles, pois, userLocation);
    }
  }, [selectedCategory, radius]);

  const handleGoToUser = () => {
    if (map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 1500,
      });
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          if (map.current) {
            map.current.flyTo({
              center: coords,
              zoom: 13,
              duration: 1500,
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'obtenir votre position",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-6">
        {/* Header */}
        <div className="mb-2 md:mb-6 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="mb-1 text-2xl md:text-3xl font-bold truncate text-foreground">
              Carte
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Trouve des professionnels près de toi</p>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm"
                  variant="outline"
                  className="rounded-2xl shrink-0"
                >
                  <Filter className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Filtres</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white z-50" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm mb-3">Catégories</h4>
                  
                  {/* Categories - Grid layout for 3 rows */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      className="rounded-xl h-9 text-xs"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Tous
                    </Button>
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={selectedCategory === cat.value ? "default" : "outline"}
                        size="sm"
                        className="rounded-xl h-9 text-xs"
                        onClick={() => setSelectedCategory(cat.value)}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Localisation</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-10 w-full mb-3"
                      onClick={getUserLocation}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Autour de moi
                    </Button>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Rayon: {radius} km
                      </label>
                      <Slider
                        value={[radius]}
                        onValueChange={(val) => setRadius(val[0])}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleGoToUser}
                    className="bg-white hover:bg-gray-50 text-black rounded-full transition-all flex items-center justify-center shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                    aria-label="Recentrer sur ma position"
                  >
                    <span className="text-xl">📍</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recentrer sur ma position</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Interactive Map - Responsive height */}
          <div className="lg:col-span-2">
            <div 
              ref={mapContainer} 
              className="h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl md:rounded-3xl shadow-soft ring-1 ring-black/5" 
            />
          </div>

          {/* Sidebar - Hidden on mobile, shows as overlay via Sheet */}
          <div className="space-y-4 hidden lg:block">
            <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
              <h3 className="mb-4 font-semibold" style={{ color: "var(--ink)" }}>
                À proximité
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                      className="flex items-center justify-between rounded-2xl p-3 transition hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => handleSelectProfile(profile)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectProfile(profile);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Voir le profil de ${profile.display_name || 'Profil'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="h-10 w-10 rounded-full ring-2"
                            style={{
                              background: profile.avatar_url 
                                ? `url(${profile.avatar_url})` 
                                : "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderColor: profile.isOnline ? "#10b981" : "#EC4899",
                            }}
                          />
                          {profile.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2" style={{ color: "var(--ink)" }}>
                            {profile.display_name || 'Profil'}
                            {profile.verified && (
                              <Shield className="h-3 w-3 text-primary" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile.distance_km ? `${profile.distance_km.toFixed(1)} km` : 'Distance inconnue'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-full">
                        <MapPin className="h-4 w-4" />
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

          {/* Mobile: Nearby profiles as a floating card */}
          <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
            <div className="rounded-2xl bg-white p-3 shadow-vibrant ring-1 ring-black/10 backdrop-blur-sm">
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                🐾 {nearbyProfiles.length} profils à proximité
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {isLoading ? (
                  <div className="text-xs text-muted-foreground py-2">
                    Recherche...
                  </div>
                ) : nearbyProfiles.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2">
                    Aucun profil trouvé
                  </div>
                ) : (
                  nearbyProfiles.slice(0, 5).map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectProfile(profile)}
                      className="shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-accent/10 transition-smooth"
                    >
                      <div className="relative">
                        <div
                          className="h-12 w-12 rounded-full ring-2 shadow-sm"
                          style={{
                            background: profile.avatar_url 
                              ? `url(${profile.avatar_url})` 
                              : "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderColor: profile.isOnline ? "#10b981" : "#EC4899",
                          }}
                        />
                        {profile.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="text-center max-w-[60px]">
                        <p className="text-xs font-medium truncate" style={{ color: "var(--ink)" }}>
                          {profile.display_name || 'Profil'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {profile.distance_km ? `${profile.distance_km.toFixed(1)}km` : '?'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Drawer - Mobile optimized */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span className="text-lg">Profil</span>
              <div className="flex items-center gap-2">
                {selectedProfile && (
                  <AnimatedLikeButton
                    isLiked={likedProfiles.has(selectedProfile.user_id || selectedProfile.id)}
                    isLoading={isLiking}
                    onLike={handleLike}
                  />
                )}
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedProfile && (
            <div className="mt-4 space-y-5">
              {/* Avatar and Name - Mobile optimized */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/20 shadow-glow">
                    <AvatarImage src={selectedProfile.avatar_url} />
                    <AvatarFallback className="text-3xl md:text-4xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                      {(selectedProfile.display_name || 'P')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedProfile.isOnline && (
                    <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 ring-4 ring-white shadow-lg flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2 flex-wrap">
                    {selectedProfile.display_name || 'Profil'}
                    {selectedProfile.verified && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Shield className="h-3 w-3" />
                        Vérifié
                      </Badge>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProfile.distance_km 
                      ? `À ${selectedProfile.distance_km.toFixed(1)} km de vous` 
                      : 'Distance inconnue'}
                  </p>
                  {selectedProfile.isOnline && (
                    <Badge className="mt-2 bg-green-500 hover:bg-green-600">
                      En ligne
                    </Badge>
                  )}
                </div>
              </div>

              {/* Walk Mood Badge */}
              {selectedProfile.walkMood && (
                <div className="flex justify-center">
                  <Badge 
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    {selectedProfile.walkMood}
                  </Badge>
                </div>
              )}

              {/* Details - Mobile optimized */}
              {(selectedProfile.breed || selectedProfile.temperament || selectedProfile.size) && (
                <div className="space-y-3 p-3 md:p-4 rounded-2xl bg-muted/50">
                  {selectedProfile.breed && (
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Race</p>
                      <p className="text-sm md:text-base font-medium">{selectedProfile.breed}</p>
                    </div>
                  )}
                  {selectedProfile.size && (
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Taille</p>
                      <p className="text-sm md:text-base font-medium capitalize">{selectedProfile.size}</p>
                    </div>
                  )}
                  {selectedProfile.temperament && (
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Tempérament</p>
                      <p className="text-sm md:text-base font-medium capitalize">{selectedProfile.temperament}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons - Mobile optimized */}
              <div className="space-y-2 md:space-y-3 pb-4">
                <Button 
                  className="w-full rounded-2xl shadow-glow hover:shadow-vibrant transition-bounce" 
                  size="lg"
                  style={{ backgroundColor: "var(--brand-plum)" }}
                  onClick={() => {
                    const profileId = selectedProfile.user_id || selectedProfile.id;
                    navigate(`/profile/${profileId}`);
                  }}
                >
                  Voir le profil complet
                </Button>

                <Button 
                  className="w-full rounded-2xl gap-2 transition-smooth" 
                  variant="outline"
                  size="lg"
                  onClick={handleInviteWalk}
                  disabled={isInviting}
                  style={{ borderColor: "var(--brand-yellow)", color: "var(--brand-yellow)" }}
                >
                  <MessageCircle className={`h-5 w-5 ${isInviting ? 'animate-pulse' : ''}`} />
                  {isInviting ? "Envoi..." : "Inviter à marcher"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
