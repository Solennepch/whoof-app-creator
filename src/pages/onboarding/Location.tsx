import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapPin, Navigation, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Location() {
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const requestLocation = () => {
    setIsLocating(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location:", position.coords.latitude, position.coords.longitude);
          setLocationGranted(true);
          setIsLocating(false);
          toast.success("Localisation activée !");
          
          // Save to localStorage
          localStorage.setItem("locationEnabled", "true");
          localStorage.setItem("lastLocation", JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Location error:", error);
          setIsLocating(false);
          toast.error("Impossible d'accéder à la localisation");
        }
      );
    } else {
      setIsLocating(false);
      toast.error("La géolocalisation n'est pas supportée");
    }
  };

  const handleFinish = () => {
    // Mark onboarding as complete
    localStorage.setItem("onboardingCompleted", "true");
    toast.success("Bienvenue sur Whoof ! 🎉");
    navigate("/discover");
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/discover");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
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
            <div className="h-1.5 w-8 rounded-full bg-primary" />
          </div>
        </div>

        <Card className="p-8 text-center">
          <motion.div
            animate={locationGranted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              locationGranted
                ? "bg-gradient-to-r from-primary to-secondary"
                : "bg-muted"
            }`}
          >
            {locationGranted ? (
              <Check className="h-10 w-10 text-white" />
            ) : (
              <MapPin className="h-10 w-10 text-muted-foreground" />
            )}
          </motion.div>

          <h1 className="text-2xl font-bold mb-3">
            {locationGranted ? "C'est tout bon !" : "Active ta localisation"}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {locationGranted
              ? "Tu peux maintenant découvrir des chiens près de chez toi"
              : "Pour trouver des copains à proximité, nous avons besoin de ta localisation"}
          </p>

          {!locationGranted && (
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <Navigation className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Matches à proximité</p>
                  <p className="text-xs text-muted-foreground">
                    Trouve des chiens dans ta ville
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Événements locaux</p>
                  <p className="text-xs text-muted-foreground">
                    Participe aux balades près de toi
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {locationGranted ? (
              <Button
                onClick={handleFinish}
                className="w-full"
                size="lg"
              >
                Commencer à matcher
              </Button>
            ) : (
              <>
                <Button
                  onClick={requestLocation}
                  className="w-full"
                  size="lg"
                  disabled={isLocating}
                >
                  {isLocating ? "Localisation..." : "Activer la localisation"}
                </Button>
                <button
                  onClick={handleSkip}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Passer cette étape
                </button>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
