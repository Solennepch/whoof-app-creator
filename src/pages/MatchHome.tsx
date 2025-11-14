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

        <button
          onClick={() => navigate('/discover', { state: { mode: 'region' } })}
          className="w-full flex items-center justify-center gap-3 p-6 text-lg font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all bg-white/90"
        >
          <Heart className="h-6 w-6" style={{ color: "var(--brand-plum)" }} />
          <span style={{ color: "hsl(var(--ink))" }}>Matche les chiens de ta région</span>
        </button>

        <button
          onClick={() => navigate('/discover', { state: { mode: 'adoption' } })}
          className="w-full flex items-center justify-center gap-3 p-6 text-lg font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all bg-white/90"
        >
          <Home className="h-6 w-6" style={{ color: "var(--brand-raspberry)" }} />
          <span style={{ color: "hsl(var(--ink))" }}>Adopte ton compagnon (SPA)</span>
        </button>
      </div>
    </div>
  );
}
