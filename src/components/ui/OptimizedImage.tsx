import { useState, useEffect, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    skip: priority,
  });

  useEffect(() => {
    if ((inView || priority) && !imageSrc) {
      setImageSrc(src);
    }
  }, [inView, priority, src, imageSrc]);

  return (
    <div 
      ref={ref} 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ width, height }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted-foreground/10 to-muted" />
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
});
