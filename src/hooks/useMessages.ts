import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Thread {
  id: string;
  a: string;
  b: string;
  created_at: string;
  pinned_by?: string[];
  archived_by?: string[];
  deleted_by?: string[];
  updated_at?: string;
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
        .not("deleted_by", "cs", `{${user.id}}`)
        .order("updated_at", { ascending: false });

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

      // Sort: pinned first, then by updated_at
      return threadsWithProfiles.sort((a, b) => {
        const aIsPinned = a.pinned_by?.includes(user.id);
        const bIsPinned = b.pinned_by?.includes(user.id);
        
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        
        return new Date(b.updated_at || b.created_at).getTime() - 
               new Date(a.updated_at || a.created_at).getTime();
      }) as Thread[];
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

  // Pin/Unpin thread
  const togglePin = useMutation({
    mutationFn: async (threadId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: thread } = await supabase
        .from("direct_threads")
        .select("pinned_by")
        .eq("id", threadId)
        .single();

      const pinnedBy = thread?.pinned_by || [];
      const isPinned = pinnedBy.includes(user.id);
      
      const newPinnedBy = isPinned
        ? pinnedBy.filter((id) => id !== user.id)
        : [...pinnedBy, user.id];

      const { error } = await supabase
        .from("direct_threads")
        .update({ pinned_by: newPinnedBy })
        .eq("id", threadId);

      if (error) throw error;
      return { isPinned: !isPinned };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      toast.success(data.isPinned ? "Conversation épinglée" : "Conversation désépinglée");
    },
    onError: () => {
      toast.error("Erreur lors de l'épinglage");
    },
  });

  // Archive/Unarchive thread
  const toggleArchive = useMutation({
    mutationFn: async (threadId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: thread } = await supabase
        .from("direct_threads")
        .select("archived_by")
        .eq("id", threadId)
        .single();

      const archivedBy = thread?.archived_by || [];
      const isArchived = archivedBy.includes(user.id);
      
      const newArchivedBy = isArchived
        ? archivedBy.filter((id) => id !== user.id)
        : [...archivedBy, user.id];

      const { error } = await supabase
        .from("direct_threads")
        .update({ archived_by: newArchivedBy })
        .eq("id", threadId);

      if (error) throw error;
      return { isArchived: !isArchived };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      toast.success(data.isArchived ? "Conversation archivée" : "Conversation désarchivée");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });

  // Delete thread (soft delete)
  const deleteThread = useMutation({
    mutationFn: async (threadId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: thread } = await supabase
        .from("direct_threads")
        .select("deleted_by")
        .eq("id", threadId)
        .single();

      const deletedBy = thread?.deleted_by || [];
      const newDeletedBy = [...deletedBy, user.id];

      const { error } = await supabase
        .from("direct_threads")
        .update({ deleted_by: newDeletedBy })
        .eq("id", threadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      toast.success("Conversation supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    threads,
    threadsLoading,
    useThreadMessages,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    togglePin: togglePin.mutate,
    toggleArchive: toggleArchive.mutate,
    deleteThread: deleteThread.mutate,
  };
}
