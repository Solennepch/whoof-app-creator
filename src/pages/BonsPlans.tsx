import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremium } from "@/hooks/usePremium";
import { 
  Percent, 
  Gift, 
  ShoppingBag, 
  Bone, 
  Scissors,
  TreePine,
  Sparkles,
  MapPin,
  Crown
} from "lucide-react";

// Mock data for offers
const mockOffers = [
  {
    id: "1",
    title: "-20% sur les jouets Julius-K9",
    description: "Offre valable jusqu'au 27 avril",
    category: "Accessoires",
    image: "/placeholder.svg",
    distance: "1.4 km",
    location: "Lyon 3e",
    businessName: "HappiDog Store",
    isPremium: false
  },
  {
    id: "2",
    title: "1 séance de toilettage gratuite",
    description: "Pour toute nouvelle inscription",
    category: "Services",
    image: "/placeholder.svg",
    distance: "0.8 km",
    location: "Lyon 2e",
    businessName: "Dog Spa",
    isPremium: true
  },
  {
    id: "3",
    title: "-15% sur les croquettes bio",
    description: "Offre valable jusqu'au 30 avril",
    category: "Nourriture",
    image: "/placeholder.svg",
    distance: "2.1 km",
    location: "Villeurbanne",
    businessName: "Bio Chien",
    isPremium: false
  },
  {
    id: "4",
    title: "Happy Hour : -30% sur les boissons",
    description: "Du lundi au vendredi, 17h-19h",
    category: "Lieux",
    image: "/placeholder.svg",
    distance: "1.2 km",
    location: "Lyon 1er",
    businessName: "Le Café des Toutous",
    isPremium: true
  },
  {
    id: "5",
    title: "Échantillons gratuits",
    description: "Friandises naturelles pour chiens",
    category: "Nourriture",
    image: "/placeholder.svg",
    distance: "3.5 km",
    location: "Lyon 7e",
    businessName: "Natural Dog Food",
    isPremium: false
  }
];

const categories = [
  { id: "all", label: "Tout", icon: Sparkles },
  { id: "accessoires", label: "Accessoires", icon: ShoppingBag },
  { id: "nourriture", label: "Nourriture", icon: Bone },
  { id: "services", label: "Services", icon: Scissors },
  { id: "lieux", label: "Lieux dog-friendly", icon: TreePine },
  { id: "premium", label: "Offres exclusives", icon: Crown }
];

export default function BonsPlans() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading] = useState(false);
  const { data: isPremium } = usePremium();

  // Filter offers based on selected category
  const filteredOffers = mockOffers.filter(offer => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "premium") return offer.isPremium;
    return offer.category.toLowerCase() === selectedCategory;
  });

  // Separate premium and regular offers
  const premiumOffers = filteredOffers.filter(o => o.isPremium);
  const regularOffers = filteredOffers.filter(o => !o.isPremium);

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
              }}
            >
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground" style={{ fontFamily: "Fredoka" }}>
            Bons Plans
          </h1>
          <p className="text-lg text-muted-foreground">
            Les meilleures offres dog-friendly autour de toi
          </p>
        </div>

        {/* Category Chips */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-2 whitespace-nowrap transition-all ${
                    isActive 
                      ? "shadow-md scale-105" 
                      : "hover:scale-102"
                  }`}
                  style={isActive ? {
                    background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
                    color: "white",
                    border: "none"
                  } : {}}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Premium Section - Only show if user is NOT premium */}
        {!isPremium && premiumOffers.length > 0 && (
          <Card 
            className="mb-8 p-6 rounded-3xl border-2 cursor-pointer hover:scale-[1.02] transition-transform"
            style={{
              background: "linear-gradient(135deg, #FFF9E6 0%, #FFE4C4 100%)",
              borderColor: "var(--brand-yellow)"
            }}
            onClick={() => window.location.href = "/premium"}
          >
            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--brand-yellow)" }}
              >
                <Crown className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                  Offres Premium 👑
                </h3>
                <p className="text-muted-foreground mb-4">
                  Accès exclusif aux meilleurs deals partenaires. Jusqu'à -50% sur une sélection de services.
                </p>
                <Button 
                  className="rounded-full"
                  style={{
                    background: "var(--brand-yellow)",
                    color: "var(--foreground)"
                  }}
                >
                  Débloquer mes avantages
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Offers Section */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 rounded-3xl">
                <Skeleton className="w-full h-40 rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card className="p-12 rounded-3xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--muted)" }}
              >
                <Percent className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                  Aucun bon plan pour l'instant…
                </h3>
                <p className="text-muted-foreground mb-6">
                  Reviens demain : de nouvelles offres arrivent régulièrement 🐾
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = "/annuaire"}
                className="rounded-full"
              >
                Découvrir l'annuaire pro
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Premium Offers - Only show full details if user is premium */}
            {premiumOffers.length > 0 && isPremium && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "Fredoka" }}>
                  <Crown className="w-6 h-6 text-[var(--brand-yellow)]" />
                  Offres Exclusives Premium
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {premiumOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} isPremium />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Offers */}
            {regularOffers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Fredoka" }}>
                  Offres du moment
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {regularOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Offer Card Component
function OfferCard({ offer, isPremium = false }: { offer: typeof mockOffers[0], isPremium?: boolean }) {
  return (
    <Card 
      className={`rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
        isPremium ? "border-2" : ""
      }`}
      style={isPremium ? {
        borderColor: "var(--brand-yellow)",
        background: "linear-gradient(135deg, #FFFBF0 0%, #FFF9E6 100%)"
      } : {}}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted">
        <img 
          src={offer.image} 
          alt={offer.title}
          className="w-full h-full object-cover"
        />
        {/* Category Badge */}
        <Badge 
          className="absolute top-3 left-3 rounded-full"
          style={{
            background: "var(--background)",
            color: "var(--foreground)"
          }}
        >
          {offer.category}
        </Badge>
        {/* Premium Badge */}
        {isPremium && (
          <Badge 
            className="absolute top-3 right-3 rounded-full border-none"
            style={{
              background: "var(--brand-yellow)",
              color: "var(--foreground)"
            }}
          >
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ fontFamily: "Fredoka" }}>
          {offer.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Gift className="w-4 h-4" />
          <span>{offer.description}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span>{offer.location} — {offer.distance}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm font-medium">{offer.businessName}</span>
          <Button 
            size="sm" 
            className="rounded-full"
            style={{
              background: isPremium 
                ? "var(--brand-yellow)" 
                : "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
              color: "white"
            }}
          >
            Voir l'offre
          </Button>
        </div>
      </div>
    </Card>
  );
}
