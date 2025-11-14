import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function FocusModeToggle() {
  const { focusMode, toggleFocusMode } = useGamification();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFocusMode}
          className="h-9 w-9"
        >
          {focusMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {focusMode ? 'Désactiver le mode Focus' : 'Activer le mode Focus'}
      </TooltipContent>
    </Tooltip>
  );
}
