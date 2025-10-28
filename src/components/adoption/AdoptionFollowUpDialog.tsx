import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdoptionFollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  dogName: string;
  matchId: string;
}

export function AdoptionFollowUpDialog({ open, onClose, dogName, matchId }: AdoptionFollowUpDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleResponse = async (adopted: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("adoption_matches")
        .update({ 
          follow_up_completed: true,
          adopted: adopted
        })
        .eq("id", matchId);

      if (error) throw error;

      toast({
        title: adopted ? "🎉 Félicitations !" : "💛 Merci pour votre retour",
        description: adopted 
          ? "Félicitations, vous formez une belle famille!" 
          : "Un loulou n'attend plus que toi(t) !",
      });

      onClose();
    } catch (error) {
      console.error("Error updating adoption match:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Avez-vous adopté {dogName} ?
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-6">
          <Button
            size="lg"
            onClick={() => handleResponse(true)}
            disabled={loading}
            className="h-14 text-lg bg-gradient-to-r from-[#FF5DA2] to-[#FF8E53] hover:opacity-90"
          >
            <Heart className="mr-2 h-5 w-5 fill-white" />
            Oui, {dogName} fait partie de la famille !
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleResponse(false)}
            disabled={loading}
            className="h-14 text-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Pas encore
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}