-- Create table to track shown tooltips per user
CREATE TABLE IF NOT EXISTS public.tooltip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tooltip_id TEXT NOT NULL,
  first_shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tooltip_id)
);

-- Enable RLS
ALTER TABLE public.tooltip_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tooltip_views
CREATE POLICY "Users can view their own tooltip views"
  ON public.tooltip_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tooltip views"
  ON public.tooltip_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tooltip views"
  ON public.tooltip_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_tooltip_views_user_id ON public.tooltip_views(user_id);
CREATE INDEX idx_tooltip_views_tooltip_id ON public.tooltip_views(tooltip_id);

-- Insert tutorial completion badges
INSERT INTO public.badges (code, name, description, icon, color, criteria)
VALUES 
  ('TUTORIAL_WELCOME', 'Premier pas', 'Tutoriel de bienvenue complété', '🎓', '#4CAF50', '{"type": "tutorial_completed", "tutorial_id": "welcome"}'),
  ('TUTORIAL_GAMIFICATION', 'Expert gamification', 'Tutoriel gamification complété', '🎮', '#9C27B0', '{"type": "tutorial_completed", "tutorial_id": "gamification"}'),
  ('TUTORIAL_MASTER', 'Maître des tutoriels', 'Tous les tutoriels complétés', '🏆', '#FFD700', '{"type": "all_tutorials_completed", "count": 2}')
ON CONFLICT (code) DO NOTHING;

-- Function to check and award tutorial badges
CREATE OR REPLACE FUNCTION public.check_tutorial_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completed_count INTEGER;
  v_badge_code TEXT;
BEGIN
  -- Count completed tutorials
  SELECT COUNT(DISTINCT tutorial_id)
  INTO v_completed_count
  FROM public.tutorial_progress
  WHERE user_id = p_user_id AND completed = true;

  -- Award tutorial master badge if all tutorials completed
  IF v_completed_count >= 2 THEN
    INSERT INTO public.user_badges (user_id, badge_code)
    VALUES (p_user_id, 'TUTORIAL_MASTER')
    ON CONFLICT (user_id, badge_code) DO NOTHING;
  END IF;
END;
$$;