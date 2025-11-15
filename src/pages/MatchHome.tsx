import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MatchHome() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-6"
      style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
    >
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold text-foreground">Trouve ton match 🐾</h1>
        <p className="text-muted-foreground">
          Choisis comment tu veux rencontrer des chiens
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          size="lg"
          className="h-16 text-lg"
          onClick={() => navigate('/discover')}
        >
          🐕 Chiens de ta région
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="h-16 text-lg"
          onClick={() => navigate('/discover?mode=adoption')}
        >
          ❤️ Chiens à adopter
        </Button>
      </div>
    </div>
  );
}
