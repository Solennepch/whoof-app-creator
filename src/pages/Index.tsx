import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoWhoof from "@/assets/logo-whoof-v3.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <section className="relative overflow-hidden px-4 py-16">
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-6 inline-flex">
              <img 
                src={logoWhoof} 
                alt="Whoof Logo" 
                className="h-24 w-24 sm:h-32 sm:w-32"
              />
            </div>
            <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Whoof Apps
              </span>
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button 
                size="lg" 
                className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                onClick={() => navigate('/discover')}
              >
                <Users className="mr-2 h-5 w-5" />
                Rejoindre ma communauté
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-2xl shadow-soft"
                onClick={() => navigate('/map')}
              >
                <Search className="mr-2 h-5 w-5" />
                Découvrir
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
