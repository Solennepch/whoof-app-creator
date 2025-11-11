import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Check, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

const sizes = ["Petit", "Moyen", "Grand"];
const temperaments = ["Calme", "Joueur", "Énergique", "Affectueux"];

export default function Preferences() {
  const navigate = useNavigate();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>([]);
  const [distance, setDistance] = useState([25]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleTemperament = (temp: string) => {
    setSelectedTemperaments(prev =>
      prev.includes(temp) ? prev.filter(t => t !== temp) : [...prev, temp]
    );
  };

  const handleContinue = () => {
    // Save preferences to localStorage or backend
    const preferences = {
      sizes: selectedSizes,
      temperaments: selectedTemperaments,
      distance: distance[0],
    };
    localStorage.setItem("matchPreferences", JSON.stringify(preferences));
    
    toast.success("Préférences enregistrées !");
    navigate("/onboarding/location");
  };

  const handleSkip = () => {
    navigate("/onboarding/location");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <div className="h-1.5 w-8 rounded-full bg-primary" />
            <div className="h-1.5 w-8 rounded-full bg-primary" />
            <div className="h-1.5 w-8 rounded-full bg-muted" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Tes préférences de match</h1>
          <p className="text-muted-foreground mb-8">
            Aide-nous à trouver les meilleurs copains pour ton chien
          </p>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Taille recherchée</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedSizes.includes(size)
                      ? "bg-primary text-white shadow-glow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedSizes.includes(size) && (
                    <Check className="inline h-4 w-4 mr-2" />
                  )}
                  {size}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Tempérament</h3>
            <div className="flex flex-wrap gap-3">
              {temperaments.map((temp) => (
                <button
                  key={temp}
                  onClick={() => toggleTemperament(temp)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedTemperaments.includes(temp)
                      ? "bg-secondary text-white shadow-glow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedTemperaments.includes(temp) && (
                    <Check className="inline h-4 w-4 mr-2" />
                  )}
                  {temp}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Distance maximale</h3>
              <span className="text-primary font-bold">{distance[0]} km</span>
            </div>
            <Slider
              value={distance}
              onValueChange={setDistance}
              min={5}
              max={50}
              step={5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>50 km</span>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              Continuer
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
