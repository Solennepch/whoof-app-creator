-- Create pro_services table for managing professional services
CREATE TABLE IF NOT EXISTS public.pro_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_profile_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_pro_services_profile ON public.pro_services(pro_profile_id);
CREATE INDEX idx_pro_services_active ON public.pro_services(is_active);

-- Enable RLS
ALTER TABLE public.pro_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
  ON public.pro_services
  FOR SELECT
  USING (is_active = true);

-- Pro owners can manage their services
CREATE POLICY "Pro owners can manage their services"
  ON public.pro_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_services.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all services
CREATE POLICY "Admins can manage all services"
  ON public.pro_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_pro_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pro_services_updated_at_trigger
  BEFORE UPDATE ON public.pro_services
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_services_updated_at();

-- Audit trigger function for pro_profiles changes
CREATE OR REPLACE FUNCTION audit_pro_profiles_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, before, after, actor_id)
    VALUES (
      'pro_profiles',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid()
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, after, actor_id)
    VALUES (
      'pro_profiles',
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, before, actor_id)
    VALUES (
      'pro_profiles',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for pro_profiles
DROP TRIGGER IF EXISTS audit_pro_profiles_trigger ON public.pro_profiles;
CREATE TRIGGER audit_pro_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pro_profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_pro_profiles_changes();

-- Audit trigger function for pro_services changes
CREATE OR REPLACE FUNCTION audit_pro_services_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, before, after, actor_id)
    VALUES (
      'pro_services',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid()
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, after, actor_id)
    VALUES (
      'pro_services',
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, before, actor_id)
    VALUES (
      'pro_services',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for pro_services
CREATE TRIGGER audit_pro_services_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pro_services
  FOR EACH ROW
  EXECUTE FUNCTION audit_pro_services_changes();