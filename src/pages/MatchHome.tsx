import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Home } from "lucide-react";

export default function MatchHome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center px-6" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="max-w-md w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trouve ton match parfait
          </h1>
          <p className="text-muted-foreground">
            Choisis ton aventure canine
          </p>
        </div>

        <Button
          onClick={() => navigate('/discover/region')}
          className="w-full h-20 text-lg rounded-2xl shadow-soft"
          style={{ backgroundColor: "var(--brand-plum)" }}
        >
          <Heart className="mr-2 h-6 w-6" />
          Matche les chiens de ta région
        </Button>

        <Button
          onClick={() => navigate('/discover/adoption')}
          className="w-full h-20 text-lg rounded-2xl shadow-soft"
          style={{ backgroundColor: "var(--brand-raspberry)" }}
        >
          <Home className="mr-2 h-6 w-6" />
          Adopte ton compagnon (SPA)
        </Button>
      </div>
    </div>
  );
}
