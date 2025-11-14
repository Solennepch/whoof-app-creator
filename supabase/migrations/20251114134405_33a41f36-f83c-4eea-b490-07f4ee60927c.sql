-- Create tutorial_progress table
CREATE TABLE IF NOT EXISTS public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  step_index INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create notification_preferences_gamification table
CREATE TABLE IF NOT EXISTS public.notification_preferences_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_xp_gains BOOLEAN NOT NULL DEFAULT true,
  notify_level_up BOOLEAN NOT NULL DEFAULT true,
  notify_badge_earned BOOLEAN NOT NULL DEFAULT true,
  notify_challenge_available BOOLEAN NOT NULL DEFAULT true,
  notify_challenge_completed BOOLEAN NOT NULL DEFAULT true,
  notify_daily_missions BOOLEAN NOT NULL DEFAULT true,
  notify_league_promotion BOOLEAN NOT NULL DEFAULT true,
  notify_guild_activity BOOLEAN NOT NULL DEFAULT true,
  notify_secret_achievement_hint BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences_gamification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorial_progress
CREATE POLICY "Users can view their own tutorial progress"
  ON public.tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutorial progress"
  ON public.tutorial_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutorial progress"
  ON public.tutorial_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences_gamification
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences_gamification FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_tutorial_progress_user ON public.tutorial_progress(user_id, tutorial_id);
CREATE INDEX idx_notification_prefs_gamification_user ON public.notification_preferences_gamification(user_id);

-- Function to check if notification should be sent based on gamification preferences
CREATE OR REPLACE FUNCTION public.should_send_gamification_notification(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gamif_level TEXT;
  v_notify_enabled BOOLEAN;
BEGIN
  -- Get user's gamification level
  SELECT level INTO v_gamif_level
  FROM public.gamification_preferences
  WHERE user_id = p_user_id;
  
  -- If minimal, only send critical notifications
  IF v_gamif_level = 'minimal' THEN
    RETURN p_notification_type IN ('level_up', 'challenge_completed');
  END IF;
  
  -- If moderate, send most notifications except cosmetics/guilds
  IF v_gamif_level = 'moderate' THEN
    RETURN p_notification_type NOT IN ('guild_activity', 'secret_achievement_hint');
  END IF;
  
  -- Check specific preference
  CASE p_notification_type
    WHEN 'xp_gains' THEN
      SELECT notify_xp_gains INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'level_up' THEN
      SELECT notify_level_up INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'badge_earned' THEN
      SELECT notify_badge_earned INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'challenge_available' THEN
      SELECT notify_challenge_available INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'challenge_completed' THEN
      SELECT notify_challenge_completed INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'daily_missions' THEN
      SELECT notify_daily_missions INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'league_promotion' THEN
      SELECT notify_league_promotion INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'guild_activity' THEN
      SELECT notify_guild_activity INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    WHEN 'secret_achievement_hint' THEN
      SELECT notify_secret_achievement_hint INTO v_notify_enabled
      FROM public.notification_preferences_gamification
      WHERE user_id = p_user_id;
    ELSE
      RETURN true;
  END CASE;
  
  RETURN COALESCE(v_notify_enabled, true);
END;
$$;