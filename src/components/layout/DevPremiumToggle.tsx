import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevTools } from "@/hooks/useDevTools";
import { usePremium } from "@/hooks/usePremium";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DevPremiumToggle() {
  const { isDevAccount, premiumOverride, togglePremiumOverride } = useDevTools();
  const { data: isPremium } = usePremium();

  if (!isDevAccount) return null;

  const isActive = premiumOverride !== null ? premiumOverride : isPremium;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePremiumOverride}
              className={`
                flex items-center gap-2 rounded-full px-3 py-1 transition-all
                ${isActive 
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700" 
                  : "bg-muted hover:bg-accent text-muted-foreground"
                }
              `}
            >
              <Crown className={`h-4 w-4 ${isActive ? "fill-white" : ""}`} />
              <span className="text-xs font-bold">
                {isActive ? "Premium ON" : "Premium OFF"}
              </span>
            </Button>
            {premiumOverride !== null && (
              <Badge variant="outline" className="text-xs">
                Override
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Mode DEV : Activer/Désactiver le statut Premium
            {premiumOverride !== null && " (Override actif)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
