-- Create audit_logs table for tracking all admin/moderator actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Moderators can view their own audit logs" ON public.audit_logs;

-- Create policy for admins to view all logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for moderators to view their own logs
CREATE POLICY "Moderators can view their own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  actor_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Create indexes for performance (drop first if they exist)
DROP INDEX IF EXISTS idx_audit_logs_actor;
DROP INDEX IF EXISTS idx_audit_logs_entity;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_action;

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_before JSONB DEFAULT NULL,
  p_after JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    before,
    after,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_before,
    p_after,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create trigger function to auto-log verification changes
CREATE OR REPLACE FUNCTION public.trigger_log_verification_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.log_admin_action(
      'verification_' || NEW.status,
      'verification',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('notes', NEW.notes)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function to auto-log report changes
CREATE OR REPLACE FUNCTION public.trigger_log_report_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.log_admin_action(
      'report_' || NEW.status,
      'report',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('action', NEW.action)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function to auto-log user role changes
CREATE OR REPLACE FUNCTION public.trigger_log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_admin_action(
      'role_assigned',
      'user_role',
      NEW.user_id,
      NULL,
      to_jsonb(NEW),
      NULL
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_admin_action(
      'role_revoked',
      'user_role',
      OLD.user_id,
      to_jsonb(OLD),
      NULL,
      NULL
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers
DROP TRIGGER IF EXISTS audit_verification_changes ON public.verifications;
CREATE TRIGGER audit_verification_changes
  AFTER UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_verification_changes();

DROP TRIGGER IF EXISTS audit_report_changes ON public.reports;
CREATE TRIGGER audit_report_changes
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_report_changes();

DROP TRIGGER IF EXISTS audit_role_changes ON public.user_roles;
CREATE TRIGGER audit_role_changes
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_role_changes();