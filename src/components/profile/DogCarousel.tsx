import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DogCard } from "./DogCard";

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age_years?: number;
  birthdate?: string;
  temperament?: string;
  size?: string;
  avatar_url?: string;
  vaccination?: any;
  anecdote?: string;
  zodiac_sign?: string;
}

interface DogCarouselProps {
  dogs: Dog[];
  isOwner?: boolean;
  onLike?: () => void;
  onMessage?: () => void;
}

export function DogCarousel({ dogs, isOwner, onLike, onMessage }: DogCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (dogs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun chien enregistré
      </div>
    );
  }

  if (dogs.length === 1) {
    return (
      <DogCard 
        dog={dogs[0]} 
        isOwner={isOwner}
        onLike={onLike}
        onMessage={onMessage}
      />
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? dogs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === dogs.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      {/* Carousel Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ fontFamily: "Fredoka" }}>
          Mes chiens ({currentIndex + 1}/{dogs.length})
        </h3>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="rounded-full"
            aria-label="Chien précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full"
            aria-label="Chien suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Dog Card */}
      <div className="relative">
        <DogCard 
          dog={dogs[currentIndex]} 
          isOwner={isOwner}
          onLike={onLike}
          onMessage={onMessage}
        />
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {dogs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-gray-300'
            }`}
            aria-label={`Aller au chien ${index + 1}`}
          />
        ))}
      </div>

      {/* Keyboard Navigation */}
      <div
        role="region"
        aria-label="Carrousel de chiens"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') handlePrevious();
          if (e.key === 'ArrowRight') handleNext();
        }}
        tabIndex={0}
        className="outline-none"
      />
    </div>
  );
}
