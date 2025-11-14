-- Table pour suivre la progression des challenges mensuels
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id TEXT NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  target_progress INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Table pour la participation aux événements avec colonne date pour l'index
CREATE TABLE IF NOT EXISTS public.event_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  participated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  participation_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS sur les nouvelles tables
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'challenge_progress' 
    AND policyname = 'Users can view their own challenge progress'
  ) THEN
    ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own challenge progress"
      ON public.challenge_progress FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own challenge progress"
      ON public.challenge_progress FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own challenge progress"
      ON public.challenge_progress FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS pour event_participation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participation' 
    AND policyname = 'Users can view their own event participation'
  ) THEN
    ALTER TABLE public.event_participation ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own event participation"
      ON public.event_participation FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own event participation"
      ON public.event_participation FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON public.challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_event_participation_user_id ON public.event_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participation_event_id ON public.event_participation(event_id);

-- Index unique pour éviter les participations multiples le même jour
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_participation_unique_per_day 
  ON public.event_participation(user_id, event_id, participation_date);

-- Trigger pour mettre à jour updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_challenge_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_challenge_progress_updated_at
      BEFORE UPDATE ON public.challenge_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;