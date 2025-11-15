import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Home, MapPin, Users, Sparkles, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MatchHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Rencontres & Matchs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Choisis ton type de rencontre avec un chien.
          </p>
        </motion.div>

        {/* Hero Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-base font-medium mb-3">
                🐾 Deux façons d'agrandir ta vie avec les chiens :
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Rencontrer des duos près de chez toi</p>
                <p>• Découvrir des chiens à adopter</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Carte 1 - Chiens près de chez toi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]"
            onClick={() => navigate('/discover')}
          >
            <div className="relative h-48 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-cyan-400/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🐕‍🦺</div>
              </div>
              <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                Social
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Chiens près de chez toi</h2>
                <p className="text-muted-foreground">
                  Swipe des duos chien·humain qui sortent dans ta zone.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Balades à plusieurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Rencontres entre chiens compatibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Nouveaux amis autour de toi</span>
                </div>
              </div>

              <Button 
                className="w-full rounded-full"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/discover');
                }}
              >
                <Heart className="h-4 w-4 mr-2" />
                Commencer à swiper
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Carte 2 - Adopte ton compagnon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Card 
            className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]"
            onClick={() => navigate('/discover?mode=adoption')}
          >
            <div className="relative h-48 bg-gradient-to-br from-orange-400/20 via-amber-400/20 to-yellow-400/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🏡</div>
              </div>
              <Badge className="absolute top-4 left-4 bg-orange-500/90 text-white">
                Adoption responsable
              </Badge>
              <motion.div
                className="absolute top-4 right-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 7
                }}
              >
                <Sparkles className="h-5 w-5 text-orange-500" />
              </motion.div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-orange-500" />
                  <Heart className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold">Adopte ton compagnon</h2>
                <p className="text-muted-foreground">
                  Découvre les chiens à adopter via nos refuges partenaires.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Profils vérifiés (SPA, refuges)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Infos sur le caractère & besoins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Contact direct avec le refuge</span>
                </div>
              </div>

              <Button 
                className="w-full rounded-full bg-orange-500 hover:bg-orange-600"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/discover?mode=adoption');
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Voir les chiens à adopter
              </Button>
            </CardContent>
          </Card>

          {/* Texte légal */}
          <p className="text-xs text-muted-foreground text-center mt-3 px-4">
            Les profils d'adoption sont gérés par des associations et refuges partenaires.
            WHOOF ne remplace pas les procédures officielles d'adoption.
          </p>
        </motion.div>

        {/* FAQ rapide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 pt-6"
        >
          <h2 className="text-xl font-semibold text-center">Questions fréquentes</h2>
          
          <div className="space-y-3">
            <Card className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 text-sm">Est-ce que c'est anonyme ?</h3>
                <p className="text-xs text-muted-foreground">
                  Tu choisis ce que tu partages sur ton profil.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 text-sm">Dois-je payer quelque chose ?</h3>
                <p className="text-xs text-muted-foreground">
                  Non pour les rencontres. L'adoption dépend des conditions du refuge.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 text-sm">Puis-je utiliser les deux modes ?</h3>
                <p className="text-xs text-muted-foreground">
                  Oui, tu peux rencontrer des duos ET parcourir les profils d'adoption.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
