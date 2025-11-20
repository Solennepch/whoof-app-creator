import { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useDogs } from "@/hooks/useDogs";
import { DogSelector } from "./DogSelector";

type WalkState = 'inactive' | 'active' | 'paused';
type WalkStep = 'dogs' | 'activity' | 'notifications';

const ACTIVITY_TYPES = [
  { value: 'walk', label: 'Balade', emoji: '🚶' },
  { value: 'run', label: 'Course', emoji: '🏃' },
  { value: 'park', label: 'Parc', emoji: '🌳' },
  { value: 'training', label: 'Entraînement', emoji: '🎾' },
  { value: 'social', label: 'Rencontre', emoji: '🐕' },
];

interface StartWalkDialogProps {
  onStartWalk: (notifyFriends: boolean, liveTracking: boolean, notifyNearby: boolean, dogIds: string[]) => void;
  onPauseWalk: () => void;
  onResumeWalk: () => void;
  onStopWalk: () => void;
}

export function StartWalkDialog({ 
  onStartWalk, 
  onPauseWalk,
  onResumeWalk,
  onStopWalk 
}: StartWalkDialogProps) {
  const { toast } = useToast();
  const { dogs, isLoading: dogsLoading } = useDogs();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WalkStep>('dogs');
  const [notifyFriends, setNotifyFriends] = useState(true);
  const [liveTracking, setLiveTracking] = useState(false);
  const [notifyNearby, setNotifyNearby] = useState(true);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('walk');
  const [walkState, setWalkState] = useState<WalkState>('inactive');

  // Auto-select all dogs by default (only if single dog)
  useEffect(() => {
    if (dogs.length === 1 && selectedDogIds.length === 0) {
      setSelectedDogIds([dogs[0].id]);
      setCurrentStep('activity'); // Skip dog selection if only one dog
    } else if (dogs.length > 1) {
      setCurrentStep('dogs');
    }
  }, [dogs]);

  const handleNext = () => {
    if (currentStep === 'dogs') {
      if (selectedDogIds.length === 0) {
        toast({
          title: "Aucun chien sélectionné",
          description: "Sélectionne au moins un chien pour continuer",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('activity');
    } else if (currentStep === 'activity') {
      setCurrentStep('notifications');
    }
  };

  const handleBack = () => {
    if (currentStep === 'notifications') {
      setCurrentStep('activity');
    } else if (currentStep === 'activity') {
      if (dogs.length > 1) {
        setCurrentStep('dogs');
      }
    }
  };

  const handleStart = () => {
    onStartWalk(notifyFriends, liveTracking, notifyNearby, selectedDogIds);
    setWalkState('active');
    setOpen(false);
    setCurrentStep(dogs.length > 1 ? 'dogs' : 'activity'); // Reset to first step
    
    const selectedDogsNames = dogs
      .filter(dog => selectedDogIds.includes(dog.id))
      .map(dog => dog.name)
      .join(", ");
    
    toast({
      title: "Balade démarrée ! 🐕",
      description: `${selectedDogsNames} ${selectedDogIds.length > 1 ? "sont prêts" : "est prêt"} pour l'aventure !`,
    });
  };

  const handlePause = () => {
    onPauseWalk();
    setWalkState('paused');
    toast({
      title: "Balade en pause ⏸️",
      description: "Tu peux reprendre ta balade quand tu veux",
    });
  };

  const handleResume = () => {
    onResumeWalk();
    setWalkState('active');
    toast({
      title: "Balade reprise ! 🐕",
      description: "Ta balade continue",
    });
  };

  const handleStop = () => {
    onStopWalk();
    setWalkState('inactive');
    toast({
      title: "Balade terminée ! 🎉",
      description: "Profite bien de ton repos",
    });
  };

  // Bouton inactif - ouvre le dialog pour démarrer
  if (walkState === 'inactive') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm"
            variant="default"
            className="rounded-2xl shrink-0 bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Live Balade
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentStep === 'dogs' && '🐾 Chiens pour cette balade'}
              {currentStep === 'activity' && '🎯 Type d\'activité'}
              {currentStep === 'notifications' && '🔔 Options de balade'}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 'dogs' && 'Sélectionne le ou les chiens pour cette balade'}
              {currentStep === 'activity' && 'Choisis le type d\'activité'}
              {currentStep === 'notifications' && 'Configure les notifications et le suivi'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Étape 1: Sélection des chiens (seulement si plusieurs chiens) */}
            {currentStep === 'dogs' && (
              <div className="space-y-3">
                {dogsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Chargement...
                  </div>
                ) : (
                  <DogSelector
                    dogs={dogs}
                    selectedDogIds={selectedDogIds}
                    onSelectionChange={setSelectedDogIds}
                    multiSelect={true}
                  />
                )}
              </div>
            )}

            {/* Étape 2: Type d'activité */}
            {currentStep === 'activity' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {ACTIVITY_TYPES.map((activity) => (
                    <button
                      key={activity.value}
                      type="button"
                      onClick={() => setSelectedActivity(activity.value)}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all
                        hover:shadow-soft hover:scale-[1.02]
                        ${selectedActivity === activity.value
                          ? 'border-primary bg-primary/5 shadow-soft'
                          : 'border-border bg-background hover:border-primary/50'}
                      `}
                    >
                      <span className="text-3xl">{activity.emoji}</span>
                      <span className="font-semibold text-foreground">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 3: Notifications */}
            {currentStep === 'notifications' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-friends" className="text-base">
                      Notifier mes amis
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Préviens tes amis que tu pars en balade
                    </p>
                  </div>
                  <Switch
                    id="notify-friends"
                    checked={notifyFriends}
                    onCheckedChange={setNotifyFriends}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="live-tracking" className="text-base">
                      Suivi en direct
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Seuls tes amis ont accès à ton suivi en direct
                    </p>
                  </div>
                  <Switch
                    id="live-tracking"
                    checked={liveTracking}
                    onCheckedChange={setLiveTracking}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-nearby" className="text-base">
                      Notifier les Whoofers à proximité
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Apparaître dans le bloc "chiens à proximité" des autres utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="notify-nearby"
                    checked={notifyNearby}
                    onCheckedChange={setNotifyNearby}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {currentStep !== 'dogs' && currentStep !== 'activity' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Retour
              </Button>
            )}
            {currentStep === 'activity' && dogs.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Retour
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            {currentStep === 'notifications' ? (
              <Button type="button" onClick={handleStart}>
                Démarrer
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Suivant
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Bouton actif ou en pause - dropdown avec options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm"
          variant={walkState === 'active' ? 'default' : 'secondary'}
          className="rounded-2xl shrink-0"
        >
          {walkState === 'active' ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              En balade
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              En pause
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {walkState === 'active' ? (
          <DropdownMenuItem onClick={handlePause}>
            <Pause className="h-4 w-4 mr-2" />
            Mettre en pause
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleResume}>
            <Play className="h-4 w-4 mr-2" />
            Reprendre
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleStop} className="text-destructive">
          <Square className="h-4 w-4 mr-2" />
          Arrêter la balade
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
