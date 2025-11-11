import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { ProTier } from "@/hooks/useProSubscription";

interface ProTierBadgeProps {
  tier: ProTier;
  showIcon?: boolean;
  className?: string;
}

export function ProTierBadge({ tier, showIcon = true, className }: ProTierBadgeProps) {
  if (!tier) return null;

  const config = {
    basique: {
      label: 'Basique',
      icon: Star,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200'
    },
    premium: {
      label: 'Premium',
      icon: Zap,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200'
    },
    enterprise: {
      label: 'Enterprise',
      icon: Crown,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200'
    }
  };

  const tierConfig = config[tier];
  const Icon = tierConfig.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${tierConfig.className} ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {tierConfig.label}
    </Badge>
  );
}
