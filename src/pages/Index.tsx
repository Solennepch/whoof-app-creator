import { useState } from "react";
import { Dog, Heart, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { IconContainer } from "@/components/ui/IconContainer";
import { LikeButton } from "@/components/ui/LikeButton";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { XpProgress } from "@/components/ui/XpProgress";
import { CongratsModal } from "@/components/ui/CongratsModal";
import { Button } from "@/components/ui/button";
import logoWhoof from "@/assets/logo-whoof-v3.png";

const Index = () => {
  const [showCongrats, setShowCongrats] = useState(false);
  const [xp, setXp] = useState(800);
  const [likes, setLikes] = useState(42);

  const handleLevelUp = () => {
    setXp(prev => {
      const newXp = prev + 500;
      if (newXp >= 1200) {
        setShowCongrats(true);
      }
      return newXp;
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-6 inline-flex">
              <img 
                src={logoWhoof} 
                alt="Whoof Logo" 
                className="h-24 w-24 sm:h-32 sm:w-32"
              />
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Whoof Apps
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              L'application sociale qui connecte les chiens et leurs propriétaires. 
              Découvrez, matchez et partagez des moments magiques ! 🐾
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button 
                size="lg" 
                className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                onClick={handleLevelUp}
              >
                <Zap className="mr-2 h-5 w-5" />
                Gagner de l'XP
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-2xl shadow-soft"
              >
                <Users className="mr-2 h-5 w-5" />
                Découvrir
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-black/5">
              <div className="mb-2 flex items-center gap-2">
                <IconContainer>
                  <Users className="h-4 w-4" />
                </IconContainer>
                <h3 className="font-semibold">Communauté</h3>
              </div>
              <p className="text-3xl font-bold text-primary">12,450+</p>
              <p className="text-sm text-muted-foreground">Toutous connectés</p>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-black/5">
              <div className="mb-2 flex items-center gap-2">
                <IconContainer>
                  <Heart className="h-4 w-4" />
                </IconContainer>
                <h3 className="font-semibold">Matchs</h3>
              </div>
              <p className="text-3xl font-bold text-accent">{likes}</p>
              <p className="text-sm text-muted-foreground">Amitiés créées</p>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-black/5">
              <div className="mb-2 flex items-center gap-2">
                <IconContainer>
                  <Trophy className="h-4 w-4" />
                </IconContainer>
                <h3 className="font-semibold">Badges</h3>
              </div>
              <p className="text-3xl font-bold text-secondary">28</p>
              <p className="text-sm text-muted-foreground">À débloquer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold">Composants Interactifs</h2>
            <p className="text-muted-foreground">
              Testez les fonctionnalités de l'application
            </p>
          </div>

          <div className="space-y-6">
            {/* XP Progress */}
            <div className="rounded-3xl bg-card p-8 shadow-soft ring-1 ring-black/5">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Progression
              </h3>
              <XpProgress current={xp} min={500} max={1200} />
              <p className="mt-4 text-sm text-muted-foreground">
                Continue à interagir pour gagner de l'XP et débloquer de nouveaux niveaux !
              </p>
            </div>

            {/* Profile Card Demo */}
            <div className="rounded-3xl bg-card p-8 shadow-soft ring-1 ring-black/5">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Dog className="h-5 w-5 text-accent" />
                Profil Suggéré
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-black/5" />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="text-lg font-semibold">Max</h4>
                      <span className="text-sm text-muted-foreground">• Golden Retriever</span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Adore jouer au parc et rencontrer de nouveaux amis ! 🎾
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ReasonChip label="À 2 km de vous" />
                      <ReasonChip label="Même race préférée" />
                      <ReasonChip label="Niveau similaire" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <LikeButton 
                    onToggle={(liked) => {
                      if (liked) setLikes(prev => prev + 1);
                      else setLikes(prev => prev - 1);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">{likes} J'aime</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 ring-1 ring-primary/10">
                <div className="mb-3 inline-flex">
                  <IconContainer>
                    <Trophy className="h-4 w-4" />
                  </IconContainer>
                </div>
                <h4 className="mb-2 font-semibold">Système de Niveaux</h4>
                <p className="text-sm text-muted-foreground">
                  Gagnez de l'XP en interagissant et débloquez des badges exclusifs
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-6 ring-1 ring-accent/10">
                <div className="mb-3 inline-flex">
                  <IconContainer>
                    <Sparkles className="h-4 w-4" />
                  </IconContainer>
                </div>
                <h4 className="mb-2 font-semibold">Matching Intelligent</h4>
                <p className="text-sm text-muted-foreground">
                  Trouvez les meilleurs compagnons grâce à notre algorithme de suggestion
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Congrats Modal */}
      <CongratsModal 
        open={showCongrats} 
        level={2}
        onClose={() => setShowCongrats(false)}
      />
    </div>
  );
};

export default Index;
