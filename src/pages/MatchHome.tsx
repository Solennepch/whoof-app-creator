import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Dog } from "lucide-react";

export default function MatchHome() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
    >
      {/* Subtle grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />

      <div className="text-center space-y-5 max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
          Trouve ton match <span className="inline-block animate-pulse">🐾</span>
        </h1>
        <p className="text-base text-muted-foreground/80 leading-relaxed font-medium px-4">
          Aggrandis ta meute
        </p>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-sm z-10">
        <Button
          size="lg"
          className="h-[68px] text-lg font-semibold rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 delay-150"
          onClick={() => navigate('/discover')}
        >
          <Dog className="h-5 w-5" />
          Chiens de ta région
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="h-[68px] text-lg font-semibold rounded-3xl bg-white/90 backdrop-blur-sm border-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 delay-300"
          onClick={() => navigate('/discover?mode=adoption')}
        >
          <Heart className="h-5 w-5" />
          Chiens à adopter
        </Button>
      </div>
    </div>
  );
}
