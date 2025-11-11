import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { Button } from "./button";
import { Slider } from "./slider";
import { useState } from "react";

interface FiltersPanelProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}

export interface Filters {
  distance: number;
  ages: string[];
  sizes: string[];
  temperaments: string[];
  breeds: string[];
}

const ageOptions = ["Chiot (0-1 an)", "Jeune (1-3 ans)", "Adulte (3-7 ans)", "Senior (7+ ans)"];
const sizeOptions = ["Petit", "Moyen", "Grand"];
const temperamentOptions = ["Calme", "Joueur", "Énergique", "Affectueux", "Protecteur"];
const breedOptions = ["Labrador", "Berger Allemand", "Golden Retriever", "Bulldog", "Beagle", "Corgi"];

export function FiltersPanel({ show, onClose, onApply }: FiltersPanelProps) {
  const [distance, setDistance] = useState([25]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);

  const toggleOption = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    onApply({
      distance: distance[0],
      ages: selectedAges,
      sizes: selectedSizes,
      temperaments: selectedTemperaments,
      breeds: selectedBreeds,
    });
    onClose();
  };

  const handleReset = () => {
    setDistance([25]);
    setSelectedAges([]);
    setSelectedSizes([]);
    setSelectedTemperaments([]);
    setSelectedBreeds([]);
  };

  const hasFilters = 
    distance[0] !== 25 ||
    selectedAges.length > 0 ||
    selectedSizes.length > 0 ||
    selectedTemperaments.length > 0 ||
    selectedBreeds.length > 0;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Filtres</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Distance */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-foreground">Distance</label>
                  <span className="text-primary font-bold">{distance[0]} km</span>
                </div>
                <Slider
                  value={distance}
                  onValueChange={setDistance}
                  min={5}
                  max={50}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="font-semibold text-foreground block mb-3">Âge</label>
                <div className="flex flex-wrap gap-2">
                  {ageOptions.map((age) => (
                    <button
                      key={age}
                      onClick={() => toggleOption(age, setSelectedAges)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedAges.includes(age)
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {selectedAges.includes(age) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="font-semibold text-foreground block mb-3">Taille</label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleOption(size, setSelectedSizes)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? "bg-secondary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {selectedSizes.includes(size) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperament */}
              <div>
                <label className="font-semibold text-foreground block mb-3">Tempérament</label>
                <div className="flex flex-wrap gap-2">
                  {temperamentOptions.map((temp) => (
                    <button
                      key={temp}
                      onClick={() => toggleOption(temp, setSelectedTemperaments)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedTemperaments.includes(temp)
                          ? "bg-accent text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {selectedTemperaments.includes(temp) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="font-semibold text-foreground block mb-3">Race</label>
                <div className="flex flex-wrap gap-2">
                  {breedOptions.map((breed) => (
                    <button
                      key={breed}
                      onClick={() => toggleOption(breed, setSelectedBreeds)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedBreeds.includes(breed)
                          ? "bg-primary/80 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {selectedBreeds.includes(breed) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {breed}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-3">
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Réinitialiser
                </Button>
              )}
              <Button
                onClick={handleApply}
                className="flex-1"
              >
                Appliquer
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
