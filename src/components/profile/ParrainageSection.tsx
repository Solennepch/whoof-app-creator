import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ChevronRight } from 'lucide-react';
import { memo } from 'react';

export const ParrainageSection = memo(function ParrainageSection() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 rounded-3xl shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Parrainage
          </h3>
          <p className="text-sm text-muted-foreground">
            Invite tes amis et gagne des récompenses
          </p>
        </div>
        <Button
          onClick={() => navigate('/parrainage')}
          size="sm"
          className="rounded-full font-semibold"
          style={{ backgroundColor: "var(--brand-plum)" }}
        >
          Voir plus
        </Button>
      </div>

      <div 
        className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02]"
        style={{ 
          background: "linear-gradient(135deg, #7B61FF 0%, #FF5DA2 100%)"
        }}
        onClick={() => navigate('/parrainage')}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">12 amis parrainés</p>
          <p className="text-xs text-white/80">Continue comme ça !</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80" />
      </div>
    </Card>
  );
});
