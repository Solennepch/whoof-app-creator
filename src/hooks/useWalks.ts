import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Walk {
  id: string;
  user_id: string;
  dog_id: string | null;
  status: string;
  mood: string | null;
  start_at: string;
  end_at: string | null;
  start_location: any;
  route: any;
  distance_km: number | null;
  duration_minutes: number | null;
  friends_notified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalkEvent {
  id: string;
  host_id: string;
  title: string;
  starts_at: string;
  place_name: string | null;
  place_point: any;
  capacity: number | null;
  created_at: string;
  updated_at: string;
  participants?: any[];
}

export function useWalks() {
  const queryClient = useQueryClient();

  // Get my walks
  const { data: myWalks, isLoading: walksLoading } = useQuery({
    queryKey: ["walks", "my"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("walks")
        .select("*")
        .eq("user_id", user.id)
        .order("start_at", { ascending: false });

      if (error) throw error;
      return data as Walk[];
    },
  });

  // Get friends' ongoing walks
  const { data: friendsWalks, isLoading: friendsWalksLoading } = useQuery({
    queryKey: ["walks", "friends"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get matched friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("a_user, b_user")
        .eq("status", "matched")
        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`);

      if (!friendships || friendships.length === 0) return [];

      const friendIds = friendships.map((f) =>
        f.a_user === user.id ? f.b_user : f.a_user
      );

      const { data, error } = await supabase
        .from("walks")
        .select(`
          *,
          profiles:user_id(display_name, avatar_url)
        `)
        .in("user_id", friendIds)
        .eq("status", "ongoing")
        .order("start_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get walk events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["walk_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("walk_events")
        .select(`
          *,
          host:host_id(display_name, avatar_url),
          participants:walk_participants(user_id)
        `)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return data as WalkEvent[];
    },
  });

  // Start a walk
  const startWalk = useMutation({
    mutationFn: async ({ dogId, mood }: { dogId?: string; mood?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("walks")
        .insert({
          user_id: user.id,
          dog_id: dogId,
          mood: mood,
          status: "ongoing",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
      toast.success("Balade démarrée !");
    },
    onError: (error) => {
      toast.error("Erreur lors du démarrage de la balade");
      console.error(error);
    },
  });

  // End a walk
  const endWalk = useMutation({
    mutationFn: async (walkId: string) => {
      const { data, error } = await supabase
        .from("walks")
        .update({
          status: "completed",
          end_at: new Date().toISOString(),
        })
        .eq("id", walkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
      toast.success("Balade terminée !");
    },
  });

  // Create walk event
  const createEvent = useMutation({
    mutationFn: async (event: {
      title: string;
      starts_at: string;
      place_name?: string;
      capacity?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("walk_events")
        .insert({
          host_id: user.id,
          ...event,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk_events"] });
      toast.success("Événement créé !");
    },
  });

  // Join walk event
  const joinEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("walk_participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk_events"] });
      toast.success("Vous participez à l'événement !");
    },
  });

  return {
    myWalks,
    friendsWalks,
    events,
    walksLoading,
    friendsWalksLoading,
    eventsLoading,
    startWalk: startWalk.mutate,
    endWalk: endWalk.mutate,
    createEvent: createEvent.mutate,
    joinEvent: joinEvent.mutate,
  };
}
