import { useState } from "react";
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

type WalkState = 'inactive' | 'active' | 'paused';

interface StartWalkDialogProps {
  onStartWalk: (notifyFriends: boolean, liveTracking: boolean, notifyNearby: boolean) => void;
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
  const [open, setOpen] = useState(false);
  const [notifyFriends, setNotifyFriends] = useState(true);
  const [liveTracking, setLiveTracking] = useState(false);
  const [notifyNearby, setNotifyNearby] = useState(true);
  const [walkState, setWalkState] = useState<WalkState>('inactive');

  const handleStart = () => {
    onStartWalk(notifyFriends, liveTracking, notifyNearby);
    setWalkState('active');
    setOpen(false);
    
    toast({
      title: "Balade démarrée ! 🐕",
      description: notifyFriends 
        ? "Tes amis ont été notifiés de ta balade"
        : "Ta balade a commencé",
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
            Balade
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Démarrer une balade 🐾</DialogTitle>
            <DialogDescription>
              Configure les options de ta balade avant de commencer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleStart}>
              Démarrer
            </Button>
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
