import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PendingFollowUp {
  id: string;
  dog_name: string;
  matched_at: string;
}

export function useAdoptionFollowUp() {
  const [pendingFollowUp, setPendingFollowUp] = useState<PendingFollowUp | null>(null);

  useEffect(() => {
    checkForPendingFollowUps();
  }, []);

  const checkForPendingFollowUps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate date one week ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Find matches from one week ago that haven't been followed up
      const { data, error } = await supabase
        .from("adoption_matches")
        .select("id, dog_name, matched_at")
        .eq("user_id", user.id)
        .eq("follow_up_completed", false)
        .lte("matched_at", oneWeekAgo.toISOString())
        .order("matched_at", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking follow-ups:", error);
        return;
      }

      if (data) {
        setPendingFollowUp(data);
      }
    } catch (error) {
      console.error("Error in checkForPendingFollowUps:", error);
    }
  };

  const clearPendingFollowUp = () => {
    setPendingFollowUp(null);
  };

  return { pendingFollowUp, clearPendingFollowUp };
}