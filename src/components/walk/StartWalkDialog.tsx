import { useState } from "react";
import { Play } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface StartWalkDialogProps {
  onStartWalk: (notifyFriends: boolean, liveTracking: boolean) => void;
}

export function StartWalkDialog({ onStartWalk }: StartWalkDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifyFriends, setNotifyFriends] = useState(true);
  const [liveTracking, setLiveTracking] = useState(false);

  const handleStart = () => {
    onStartWalk(notifyFriends, liveTracking);
    setOpen(false);
    
    toast({
      title: "Balade démarrée ! 🐕",
      description: notifyFriends 
        ? "Tes amis ont été notifiés de ta balade"
        : "Ta balade a commencé",
    });
  };

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
              <Label htmlFor="live-tracking" className="text-base">
                Suivi en direct
              </Label>
              <p className="text-sm text-muted-foreground">
                Partage ta position en temps réel
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
