import { Card } from '@/components/ui/card';
import { Heart, ChevronRight } from 'lucide-react';
import { memo } from 'react';

interface SupportSectionProps {
  onClick: () => void;
}

export const SupportSection = memo(function SupportSection({ onClick }: SupportSectionProps) {
  return (
    <Card 
      className="rounded-2xl shadow-soft overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="bg-gradient-to-r from-[#FF5DA2] to-[#FFC14D] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6" />
          <div>
            <p className="font-bold">Nous soutenir</p>
            <p className="text-xs opacity-90">Soutenez le développement de Whoof</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" />
      </div>
    </Card>
  );
});
