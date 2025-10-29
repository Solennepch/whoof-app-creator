-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Reports policies
  DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
  DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
  DROP POLICY IF EXISTS "Admins can manage all reports" ON public.reports;
  DROP POLICY IF EXISTS "Moderators can view reports" ON public.reports;
  DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
  
  -- Sanctions policies
  DROP POLICY IF EXISTS "Admins can manage sanctions" ON public.sanctions;
  DROP POLICY IF EXISTS "Moderators can view sanctions" ON public.sanctions;
  DROP POLICY IF EXISTS "Users can view own sanctions" ON public.sanctions;
  
  -- Admin notes policies
  DROP POLICY IF EXISTS "Admins can manage notes" ON public.admin_notes;
  
  -- Audit logs policies
  DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
  
  -- Partner campaigns policies
  DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.partner_campaigns;
  DROP POLICY IF EXISTS "Partner managers can manage campaigns" ON public.partner_campaigns;
  DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.partner_campaigns;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'message', 'photo', 'profile', 'dog')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  handled_by UUID REFERENCES auth.users(id),
  handled_at TIMESTAMPTZ,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sanctions table for user moderation
CREATE TABLE IF NOT EXISTS public.sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('warn', 'suspend', 'ban')),
  reason TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin_notes table for internal user notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create partner_campaigns table for promo codes
CREATE TABLE IF NOT EXISTS public.partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.pro_accounts(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  reward TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  quota INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON public.reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_user_end ON public.sanctions(user_id, end_at);
CREATE INDEX IF NOT EXISTS idx_sanctions_active ON public.sanctions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_notes_user ON public.admin_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_status_created ON public.verifications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type_created ON public.alerts(type, created_at DESC);

-- Enable RLS on all admin tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view reports" ON public.reports
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for sanctions
CREATE POLICY "Admins can manage sanctions" ON public.sanctions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view sanctions" ON public.sanctions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own sanctions" ON public.sanctions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for admin_notes
CREATE POLICY "Admins can manage notes" ON public.admin_notes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for partner_campaigns
CREATE POLICY "Admins can manage campaigns" ON public.partner_campaigns
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partner managers can manage campaigns" ON public.partner_campaigns
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'partner_manager'::app_role));

CREATE POLICY "Anyone can view active campaigns" ON public.partner_campaigns
  FOR SELECT TO authenticated
  USING (is_active = true AND now() >= starts_at AND now() <= ends_at);

-- Update trigger for reports
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reports_updated_at();