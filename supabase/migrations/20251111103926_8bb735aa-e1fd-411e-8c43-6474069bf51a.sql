-- Fix RLS on walks and walk_participants (corrected column names)
CREATE POLICY "Users can view walks they participate in" ON public.walks FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() IN (
    SELECT wp.user_id FROM walk_participants wp 
    JOIN walk_events we ON wp.event_id = we.id
    WHERE we.id IS NOT NULL
  )
);

-- Create messages table for conversation summaries
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES direct_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_walk_participants_event ON walk_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_walk_participants_user ON walk_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(a_user, b_user);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);