-- ============================================
-- GAMIFICATION SYSTEM
-- ============================================

-- XP Events table to track all XP-earning actions
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'profile_complete', 'walk_start', 'walk_invite', etc.
  points INTEGER NOT NULL DEFAULT 0,
  ref_id UUID, -- reference to related entity (walk, alert, match, etc.)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX idx_xp_events_created_at ON public.xp_events(created_at DESC);
CREATE INDEX idx_xp_events_type ON public.xp_events(type);

-- Enable RLS
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own XP events
CREATE POLICY "Users can view own xp events"
  ON public.xp_events FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert XP events (via functions)
CREATE POLICY "System can insert xp events"
  ON public.xp_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create view for user XP summary
CREATE OR REPLACE VIEW public.user_xp_summary AS
SELECT 
  user_id,
  COALESCE(SUM(points), 0) as total_xp,
  FLOOR(COALESCE(SUM(points), 0) / 200) as level,
  COUNT(*) as total_events
FROM public.xp_events
GROUP BY user_id;

-- Badges definition table
CREATE TABLE IF NOT EXISTS public.badges (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  criteria JSONB NOT NULL, -- JSON with achievement criteria
  color TEXT DEFAULT '#7B61FF',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial badges
INSERT INTO public.badges (code, name, description, icon, criteria, color) VALUES
  ('newbie', 'Nouveau Museau', 'Profil complet créé', '🐕', '{"profile_complete": true}', '#10B981'),
  ('star', 'Étoile du Parc', '10 balades complétées', '⭐', '{"walks_completed": 10}', '#F59E0B'),
  ('scout', 'Éclaireur', '3 dangers signalés validés', '🔍', '{"alerts_validated": 3}', '#3B82F6'),
  ('helper', 'Samaritain', '1 chien retrouvé', '🦸', '{"lost_dog_resolved": 1}', '#EF4444'),
  ('ambassador', 'Ambassadeur', '3 filleuls inscrits', '🎖️', '{"referrals_signed_up": 3}', '#8B5CF6'),
  ('verified', 'Vérifié', 'Identité/puce validée', '✅', '{"verification": "approved"}', '#06B6D4')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS on badges (public read)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- User badges (earned achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES public.badges(code) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view others badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- Weekly leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL, -- Monday of the week
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  city TEXT, -- for local leaderboards
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start, user_id)
);

CREATE INDEX idx_leaderboard_weekly_week ON public.leaderboard_weekly(week_start DESC);
CREATE INDEX idx_leaderboard_weekly_rank ON public.leaderboard_weekly(week_start, rank);
CREATE INDEX idx_leaderboard_weekly_city ON public.leaderboard_weekly(city, week_start);

ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard_weekly FOR SELECT
  USING (true);

-- Weekly challenge
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL, -- Challenge completion criteria
  reward_xp INTEGER DEFAULT 40,
  reward_badge_code TEXT, -- Optional special badge
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.weekly_challenges FOR SELECT
  USING (is_active = true);

-- ============================================
-- WALKS & ACTIVITY TRACKING
-- ============================================

-- Individual walks (different from walk_events which are group events)
CREATE TABLE IF NOT EXISTS public.walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ongoing', -- 'ongoing', 'completed', 'cancelled'
  mood TEXT, -- 'chaleurs', 'opération', 'speed', 'playtime'
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ,
  duration_minutes INTEGER, -- calculated on completion
  distance_km NUMERIC(10, 2),
  start_location GEOGRAPHY(POINT, 4326),
  route JSONB, -- array of GPS points
  friends_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_walks_user_id ON public.walks(user_id);
CREATE INDEX idx_walks_status ON public.walks(status);
CREATE INDEX idx_walks_start_at ON public.walks(start_at DESC);

ALTER TABLE public.walks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own walks"
  ON public.walks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own walks"
  ON public.walks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walks"
  ON public.walks FOR UPDATE
  USING (auth.uid() = user_id);

-- Friends can see ongoing walks of matched users
CREATE POLICY "Friends can view ongoing walks"
  ON public.walks FOR SELECT
  USING (
    status = 'ongoing' AND 
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.status = 'matched'
      AND ((f.a_user = auth.uid() AND f.b_user = walks.user_id)
           OR (f.b_user = auth.uid() AND f.a_user = walks.user_id))
    )
  );

-- ============================================
-- ALERTS SYSTEM (dangers & lost dogs)
-- ============================================

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'danger', 'lost_dog'
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'archived', 'hidden'
  validated_by UUID REFERENCES auth.users(id), -- admin who validated
  resolved_by UUID REFERENCES auth.users(id), -- user who resolved (for lost dogs)
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_type ON public.alerts(type);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_location ON public.alerts USING GIST(location);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active alerts"
  ON public.alerts FOR SELECT
  USING (status = 'active' AND expires_at > now());

CREATE POLICY "Users can create alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all alerts"
  ON public.alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- ADMIN & MODERATION
-- ============================================

-- Sanctions table
CREATE TABLE IF NOT EXISTS public.sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'warn', 'suspend', 'ban'
  reason TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ, -- NULL for permanent ban
  created_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sanctions_user_id ON public.sanctions(user_id);
CREATE INDEX idx_sanctions_end_at ON public.sanctions(end_at) WHERE is_active = true;

ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sanctions"
  ON public.sanctions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own sanctions"
  ON public.sanctions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_notes_user_id ON public.admin_notes(user_id);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes"
  ON public.admin_notes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Extend reports table with additional fields if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reports' AND column_name = 'entity_type') THEN
    ALTER TABLE public.reports ADD COLUMN entity_type TEXT;
    ALTER TABLE public.reports ADD COLUMN entity_id UUID;
    ALTER TABLE public.reports ADD COLUMN reason TEXT;
    ALTER TABLE public.reports ADD COLUMN handled_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.reports ADD COLUMN handled_at TIMESTAMPTZ;
    ALTER TABLE public.reports ADD COLUMN admin_notes TEXT[];
  END IF;
END $$;

-- Partner campaigns for promotions
CREATE TABLE IF NOT EXISTS public.partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL, -- references pro_accounts
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reward TEXT, -- description of reward
  quota INTEGER, -- max uses
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partner_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns"
  ON public.partner_campaigns FOR SELECT
  USING (is_active = true AND now() BETWEEN starts_at AND ends_at);

CREATE POLICY "Admins can manage campaigns"
  ON public.partner_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Referrals tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'signed_up', 'premium_converted'
  reward_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  signed_up_at TIMESTAMPTZ,
  premium_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to add XP event
CREATE OR REPLACE FUNCTION public.add_xp_event(
  p_user_id UUID,
  p_type TEXT,
  p_points INTEGER,
  p_ref_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.xp_events (user_id, type, points, ref_id, metadata)
  VALUES (p_user_id, p_type, p_points, p_ref_id, p_metadata)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_code TEXT, newly_awarded BOOLEAN) AS $$
DECLARE
  v_badge RECORD;
  v_already_has BOOLEAN;
  v_should_have BOOLEAN;
BEGIN
  FOR v_badge IN SELECT * FROM public.badges LOOP
    -- Check if user already has this badge
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges 
      WHERE user_id = p_user_id AND badge_code = v_badge.code
    ) INTO v_already_has;
    
    -- Skip if already awarded
    IF v_already_has THEN
      badge_code := v_badge.code;
      newly_awarded := false;
      RETURN NEXT;
      CONTINUE;
    END IF;
    
    -- Check criteria based on badge type
    v_should_have := false;
    
    CASE v_badge.code
      WHEN 'newbie' THEN
        -- Profile complete: has display_name and has at least one dog
        SELECT EXISTS(
          SELECT 1 FROM public.profiles p
          WHERE p.id = p_user_id 
          AND p.display_name IS NOT NULL
          AND EXISTS(SELECT 1 FROM public.dogs WHERE owner_id = p_user_id)
        ) INTO v_should_have;
        
      WHEN 'star' THEN
        -- 10 completed walks
        SELECT COUNT(*) >= 10 FROM public.walks
        WHERE user_id = p_user_id AND status = 'completed'
        INTO v_should_have;
        
      WHEN 'scout' THEN
        -- 3 validated alerts
        SELECT COUNT(*) >= 3 FROM public.alerts
        WHERE user_id = p_user_id AND validated_by IS NOT NULL
        INTO v_should_have;
        
      WHEN 'helper' THEN
        -- 1 resolved lost dog
        SELECT COUNT(*) >= 1 FROM public.alerts
        WHERE user_id = p_user_id AND type = 'lost_dog' AND status = 'resolved'
        INTO v_should_have;
        
      WHEN 'ambassador' THEN
        -- 3 referrals signed up
        SELECT COUNT(*) >= 3 FROM public.referrals
        WHERE referrer_id = p_user_id AND status IN ('signed_up', 'premium_converted')
        INTO v_should_have;
        
      WHEN 'verified' THEN
        -- Verification approved
        SELECT EXISTS(
          SELECT 1 FROM public.verifications
          WHERE user_id = p_user_id AND status = 'approved'
        ) INTO v_should_have;
    END CASE;
    
    -- Award badge if criteria met
    IF v_should_have THEN
      INSERT INTO public.user_badges (user_id, badge_code)
      VALUES (p_user_id, v_badge.code)
      ON CONFLICT (user_id, badge_code) DO NOTHING;
      
      badge_code := v_badge.code;
      newly_awarded := true;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_walks_updated_at BEFORE UPDATE ON public.walks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();