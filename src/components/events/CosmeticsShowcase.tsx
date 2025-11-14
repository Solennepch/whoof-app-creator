import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Sparkles, Lock, Check, Image, Award, Frame } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Cosmetic {
  id: string;
  season_id: string;
  type: string;
  name: string;
  description: string;
  rarity: string;
  preview_url: string;
  unlocked: boolean;
  equipped: boolean;
}

const rarityColors = {
  common: "text-gray-500 border-gray-500/20 bg-gray-500/5",
  rare: "text-blue-500 border-blue-500/20 bg-blue-500/5",
  epic: "text-purple-500 border-purple-500/20 bg-purple-500/5",
  legendary: "text-amber-500 border-amber-500/20 bg-amber-500/5",
};

const typeIcons = {
  avatar_frame: Frame,
  badge: Award,
  profile_banner: Image,
  animated_badge: Sparkles,
};

export function CosmeticsShowcase() {
  const { user } = useAuth();

  const { data: cosmetics, refetch } = useQuery({
    queryKey: ["season-cosmetics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Get current season
      const { data: season } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (!season) return [];

      // Get all cosmetics for this season
      const { data: allCosmetics, error: cosmeticsError } = await supabase
        .from("season_cosmetics")
        .select("*")
        .eq("season_id", season.id)
        .order("rarity", { ascending: false });

      if (cosmeticsError) throw cosmeticsError;

      // Get user's unlocked cosmetics
      const { data: userCosmetics } = await supabase
        .from("user_cosmetics")
        .select("cosmetic_id")
        .eq("user_id", user.id);

      const unlockedIds = new Set(userCosmetics?.map((uc) => uc.cosmetic_id) || []);

      // Get active cosmetics
      const { data: activeCosmetics } = await supabase
        .from("user_active_cosmetics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return allCosmetics.map((cosmetic) => ({
        ...cosmetic,
        unlocked: unlockedIds.has(cosmetic.id),
        equipped:
          activeCosmetics?.active_avatar_frame === cosmetic.id ||
          activeCosmetics?.active_badge === cosmetic.id ||
          activeCosmetics?.active_banner === cosmetic.id,
      })) as Cosmetic[];
    },
  });

  const handleEquipCosmetic = async (cosmetic: Cosmetic) => {
    if (!user || !cosmetic.unlocked) return;

    try {
      const fieldMap = {
        avatar_frame: "active_avatar_frame",
        badge: "active_badge",
        profile_banner: "active_banner",
        animated_badge: "active_badge",
      };

      const field = fieldMap[cosmetic.type as keyof typeof fieldMap];

      const { error } = await supabase
        .from("user_active_cosmetics")
        .upsert({
          user_id: user.id,
          [field]: cosmetic.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Cosmétique équipé ! ✨");
      refetch();
    } catch (error) {
      console.error("Error equipping cosmetic:", error);
      toast.error("Erreur lors de l'équipement");
    }
  };

  const groupedByType = cosmetics?.reduce((acc, cosmetic) => {
    if (!acc[cosmetic.type]) acc[cosmetic.type] = [];
    acc[cosmetic.type].push(cosmetic);
    return acc;
  }, {} as Record<string, Cosmetic[]>);

  const CosmeticCard = ({ cosmetic }: { cosmetic: Cosmetic }) => {
    const Icon = typeIcons[cosmetic.type as keyof typeof typeIcons] || Sparkles;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative p-4 rounded-lg border-2 transition-all cursor-pointer",
          rarityColors[cosmetic.rarity as keyof typeof rarityColors],
          cosmetic.equipped && "ring-2 ring-primary",
          !cosmetic.unlocked && "opacity-50 grayscale"
        )}
        onClick={() => cosmetic.unlocked && handleEquipCosmetic(cosmetic)}
      >
        {cosmetic.equipped && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}

        {!cosmetic.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon className="h-8 w-8" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm">{cosmetic.name}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {cosmetic.rarity}
            </Badge>
          </div>
          {cosmetic.description && (
            <p className="text-xs text-muted-foreground text-center">
              {cosmetic.description}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  if (!user || !cosmetics?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Cosmétiques de Saison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Aucun cosmétique disponible pour le moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unlockedCount = cosmetics.filter((c) => c.unlocked).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Cosmétiques
              </CardTitle>
              <Badge variant="secondary">
                {unlockedCount}/{cosmetics.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {cosmetics.slice(0, 4).map((cosmetic) => {
                const Icon = typeIcons[cosmetic.type as keyof typeof typeIcons] || Sparkles;
                return (
                  <div
                    key={cosmetic.id}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex items-center justify-center",
                      rarityColors[cosmetic.rarity as keyof typeof rarityColors],
                      !cosmetic.unlocked && "opacity-30 grayscale"
                    )}
                  >
                    {cosmetic.unlocked ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Cliquez pour voir tous les cosmétiques
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Collection de Cosmétiques
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">Tous ({cosmetics.length})</TabsTrigger>
            <TabsTrigger value="unlocked">Débloqués ({unlockedCount})</TabsTrigger>
            <TabsTrigger value="avatar_frame">Cadres</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="profile_banner">Bannières</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cosmetics.map((cosmetic) => (
                <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unlocked" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cosmetics
                .filter((c) => c.unlocked)
                .map((cosmetic) => (
                  <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
                ))}
            </div>
          </TabsContent>

          {Object.entries(groupedByType || {}).map(([type, items]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((cosmetic) => (
                  <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
