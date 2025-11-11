import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  blurDataURL?: string;
}

export function LazyImage({ src, alt, className, blurDataURL }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted-foreground/20"
          style={blurDataURL ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover', filter: 'blur(20px)' } : undefined}
        />
      )}
      
      {/* Actual image */}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}
