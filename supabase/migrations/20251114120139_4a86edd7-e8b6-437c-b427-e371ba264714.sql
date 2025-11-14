-- Enable realtime for messages tables
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.direct_threads REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;