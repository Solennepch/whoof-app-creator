import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Thread {
  id: string;
  a: string;
  b: string;
  created_at: string;
  lastMessage?: Message;
  otherUser?: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

export function useMessages() {
  const queryClient = useQueryClient();

  // Fetch all threads for current user
  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("direct_threads")
        .select(`
          *,
          messages:direct_messages(*)
        `)
        .or(`a.eq.${user.id},b.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get other user profiles
      const threadsWithProfiles = await Promise.all(
        (data || []).map(async (thread) => {
          const otherUserId = thread.a === user.id ? thread.b : thread.a;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          return {
            ...thread,
            otherUser: profile,
            lastMessage: thread.messages?.[thread.messages.length - 1],
          };
        })
      );

      return threadsWithProfiles as Thread[];
    },
  });

  // Fetch messages for a specific thread
  const useThreadMessages = (threadId: string | undefined) => {
    return useQuery({
      queryKey: ["messages", threadId],
      queryFn: async () => {
        if (!threadId) return [];

        const { data, error } = await supabase
          .from("direct_messages")
          .select("*")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data as Message[];
      },
      enabled: !!threadId,
    });
  };

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({
      threadId,
      receiverId,
      content,
    }: {
      threadId?: string;
      receiverId: string;
      content: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let finalThreadId = threadId;

      // Create thread if it doesn't exist
      if (!finalThreadId) {
        const { data: existingThread } = await supabase
          .from("direct_threads")
          .select("id")
          .or(`and(a.eq.${user.id},b.eq.${receiverId}),and(a.eq.${receiverId},b.eq.${user.id})`)
          .single();

        if (existingThread) {
          finalThreadId = existingThread.id;
        } else {
          const { data: newThread, error: threadError } = await supabase
            .from("direct_threads")
            .insert({ a: user.id, b: receiverId })
            .select()
            .single();

          if (threadError) throw threadError;
          finalThreadId = newThread.id;
        }
      }

      // Send message
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          thread_id: finalThreadId,
          sender_id: user.id,
          body: content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message envoyé");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'envoi du message");
      console.error(error);
    },
  });

  return {
    threads,
    threadsLoading,
    useThreadMessages,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}
