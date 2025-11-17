import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

export type Dog = Tables<"dogs">;

export function useDogs() {
  const queryClient = useQueryClient();

  // Get all user's dogs
  const { data: dogs, isLoading } = useQuery({
    queryKey: ["dogs", "my"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Dog[];
    },
  });

  // Create a dog
  const createDog = useMutation({
    mutationFn: async (dogData: Omit<Dog, "id" | "created_at" | "updated_at" | "owner_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("dogs")
        .insert({
          name: dogData.name,
          breed: dogData.breed || "",
          birthdate: dogData.birthdate,
          age_years: dogData.age_years,
          temperament: dogData.temperament,
          size: dogData.size,
          anecdote: dogData.anecdote,
          avatar_url: dogData.avatar_url,
          zodiac_sign: dogData.zodiac_sign,
          vaccination: dogData.vaccination,
          vaccinations: dogData.vaccinations,
          photo: dogData.photo,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
      toast.success("Profil du chien créé !");
    },
    onError: (error) => {
      console.error("Error creating dog:", error);
      toast.error("Erreur lors de la création du profil");
    },
  });

  // Update a dog
  const updateDog = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dog> }) => {
      const { data: result, error } = await supabase
        .from("dogs")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
      toast.success("Profil mis à jour !");
    },
    onError: (error) => {
      console.error("Error updating dog:", error);
      toast.error("Erreur lors de la mise à jour");
    },
  });

  // Delete a dog
  const deleteDog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dogs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
      toast.success("Profil supprimé");
    },
    onError: (error) => {
      console.error("Error deleting dog:", error);
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    dogs: dogs || [],
    isLoading,
    createDog,
    updateDog,
    deleteDog,
  };
}
