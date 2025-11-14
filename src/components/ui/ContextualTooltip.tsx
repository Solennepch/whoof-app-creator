import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { Button } from './button';
import { useContextualTooltip } from '@/hooks/useContextualTooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface ContextualTooltipProps {
  id: string;
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showFor?: ('minimal' | 'moderate' | 'complete')[];
}

export function ContextualTooltip({
  id,
  content,
  children,
  placement = 'top',
  showFor,
}: ContextualTooltipProps) {
  const { isOpen, shouldShow, handleDismiss, setIsOpen } = useContextualTooltip({
    id,
    content,
    placement,
    showFor,
  });

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <AnimatePresence>
          {isOpen && (
            <TooltipContent
              side={placement}
              className="max-w-sm p-0 overflow-hidden"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-popover border-2 border-primary/20 rounded-lg shadow-lg">
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-popover-foreground leading-relaxed">
                        {content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDismiss}
                      className="flex-shrink-0 h-6 w-6 -mt-1 -mr-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="px-4 pb-3">
                    <Button
                      size="sm"
                      onClick={handleDismiss}
                      className="w-full"
                    >
                      Compris !
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
}
