import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FocusModeToggleProps {
  variant?: 'icon' | 'full';
}

export function FocusModeToggle({ variant = 'icon' }: FocusModeToggleProps) {
  const { focusMode, toggleFocusMode } = useGamification();

  if (variant === 'full') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleFocusMode}
        className={`
          flex items-center gap-2 rounded-full px-3 py-1 transition-all w-full justify-start
          ${focusMode 
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700" 
            : "bg-muted hover:bg-accent text-muted-foreground"
          }
        `}
      >
        {focusMode ? (
          <EyeOff className={`h-4 w-4 ${focusMode ? "text-white" : ""}`} />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="text-xs font-bold">
          {focusMode ? 'Mode Focus ON' : 'Mode Focus OFF'}
        </span>
      </Button>
    );
  }

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
