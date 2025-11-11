import { ReactNode } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { useAnimationPreference } from '@/hooks/useAnimationPreference';

interface ConditionalMotionProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function ConditionalMotion({ children, className, ...motionProps }: ConditionalMotionProps) {
  const { prefersReducedMotion } = useAnimationPreference();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}

interface ConditionalAnimatePresenceProps {
  children: ReactNode;
  show?: boolean;
}

export function ConditionalAnimatePresence({ children, show = true }: ConditionalAnimatePresenceProps) {
  const { prefersReducedMotion } = useAnimationPreference();

  if (prefersReducedMotion) {
    return <>{show ? children : null}</>;
  }

  return <AnimatePresence>{show ? children : null}</AnimatePresence>;
}
