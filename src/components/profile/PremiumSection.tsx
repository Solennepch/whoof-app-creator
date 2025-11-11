import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { PremiumTeaser } from '@/components/ui/PremiumTeaser';
import { memo } from 'react';

interface PremiumSectionProps {
  isPremium: boolean;
}

export const PremiumSection = memo(function PremiumSection({ isPremium }: PremiumSectionProps) {
  const navigate = useNavigate();

  if (!isPremium) {
    return <PremiumTeaser blurredCount={12} />;
  }

  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-[#FFC14D] to-[#FF5DA2] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <p className="font-bold">Membre Premium</p>
            <p className="text-xs opacity-90">Profite de tous les avantages</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={() => navigate('/premium')}
        >
          Gérer
        </Button>
      </div>
    </Card>
  );
});
