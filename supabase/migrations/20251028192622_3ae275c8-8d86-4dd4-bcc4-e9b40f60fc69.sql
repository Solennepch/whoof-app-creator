-- Create adoption matches table to track user matches with SPA dogs
CREATE TABLE IF NOT EXISTS public.adoption_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dog_name TEXT NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  follow_up_completed BOOLEAN NOT NULL DEFAULT false,
  adopted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create adoption stats table for global counter
CREATE TABLE IF NOT EXISTS public.adoption_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_matches INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial stats record
INSERT INTO public.adoption_stats (total_matches) VALUES (0);

-- Enable RLS
ALTER TABLE public.adoption_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adoption_matches
CREATE POLICY "Users can view their own adoption matches"
  ON public.adoption_matches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adoption matches"
  ON public.adoption_matches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adoption matches"
  ON public.adoption_matches
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for adoption_stats (public read, no write from client)
CREATE POLICY "Anyone can view adoption stats"
  ON public.adoption_stats
  FOR SELECT
  USING (true);

-- Function to increment global adoption counter
CREATE OR REPLACE FUNCTION increment_adoption_counter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.adoption_stats
  SET total_matches = total_matches + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.adoption_stats LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment counter on new matches
CREATE TRIGGER on_adoption_match_created
  AFTER INSERT ON public.adoption_matches
  FOR EACH ROW
  EXECUTE FUNCTION increment_adoption_counter();