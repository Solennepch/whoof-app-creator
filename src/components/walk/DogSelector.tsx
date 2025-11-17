import { useState } from "react";
import { Check } from "lucide-react";
import { Dog } from "@/hooks/useDogs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DogSelectorProps {
  dogs: Dog[];
  selectedDogIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
}

export function DogSelector({ 
  dogs, 
  selectedDogIds, 
  onSelectionChange,
  multiSelect = true 
}: DogSelectorProps) {
  const handleToggleDog = (dogId: string) => {
    if (multiSelect) {
      if (selectedDogIds.includes(dogId)) {
        onSelectionChange(selectedDogIds.filter(id => id !== dogId));
      } else {
        onSelectionChange([...selectedDogIds, dogId]);
      }
    } else {
      onSelectionChange([dogId]);
    }
  };

  if (dogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucun chien enregistré</p>
        <p className="text-sm mt-2">Créez un profil dans les paramètres</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {multiSelect 
          ? "Sélectionnez un ou plusieurs chiens pour cette balade"
          : "Sélectionnez le chien pour cette balade"
        }
      </p>
      <div className="grid gap-3">
        {dogs.map((dog) => {
          const isSelected = selectedDogIds.includes(dog.id);
          
          return (
            <button
              key={dog.id}
              type="button"
              onClick={() => handleToggleDog(dog.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                "hover:shadow-soft hover:scale-[1.02]",
                isSelected
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={dog.avatar_url || ""} alt={dog.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {dog.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">{dog.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {dog.breed} • {dog.age_years} an{dog.age_years && dog.age_years > 1 ? "s" : ""}
                </p>
              </div>

              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                isSelected 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
