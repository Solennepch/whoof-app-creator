-- Table pour les saisons
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number integer NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  theme text,
  rewards jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table pour les quêtes narratives
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  story_context text,
  season_id uuid REFERENCES public.seasons(id),
  quest_order integer NOT NULL,
  required_challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  rewards jsonb NOT NULL DEFAULT '{}',
  unlock_condition jsonb,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Table pour la progression des quêtes utilisateur
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL REFERENCES public.quests(id),
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  current_step integer DEFAULT 0,
  total_steps integer NOT NULL,
  is_completed boolean DEFAULT false,
  rewards_claimed boolean DEFAULT false,
  UNIQUE(user_id, quest_id)
);

-- Table pour le feed d'activité social
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  visibility text DEFAULT 'public',
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour les saisons
CREATE INDEX IF NOT EXISTS idx_seasons_active ON public.seasons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON public.seasons(start_date, end_date);

-- Index pour les quêtes
CREATE INDEX IF NOT EXISTS idx_quests_season ON public.quests(season_id);
CREATE INDEX IF NOT EXISTS idx_quests_active ON public.quests(is_active) WHERE is_active = true;

-- Index pour la progression des quêtes
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user_id ON public.user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_quest_id ON public.user_quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_completed ON public.user_quest_progress(is_completed);

-- Index pour le feed d'activité
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(activity_type);

-- RLS pour seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON public.seasons FOR SELECT
  USING (true);

-- RLS pour quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quests"
  ON public.quests FOR SELECT
  USING (is_active = true);

-- RLS pour user_quest_progress
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quest progress"
  ON public.user_quest_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress"
  ON public.user_quest_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
  ON public.user_quest_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS pour activity_feed
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public activities"
  ON public.activity_feed FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can insert their own activities"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.activity_feed FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_quest_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter la colonne updated_at si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_quest_progress' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_quest_progress ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

CREATE TRIGGER update_user_quest_progress_updated_at_trigger
  BEFORE UPDATE ON public.user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_quest_progress_updated_at();