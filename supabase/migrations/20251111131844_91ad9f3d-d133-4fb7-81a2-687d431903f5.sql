-- Ajouter le rôle moderator s'il n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  ELSE
    -- Ajouter moderator à l'enum existant si ce n'est pas déjà fait
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
  END IF;
END $$;

-- Table des permissions pour chaque rôle
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission)
);

-- Activer RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut lire les permissions
CREATE POLICY "Anyone can view permissions"
ON public.role_permissions
FOR SELECT
USING (true);

-- Politique : seuls les admins peuvent gérer les permissions
CREATE POLICY "Only admins can manage permissions"
ON public.role_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Permissions par défaut pour admin
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_users'),
  ('admin', 'manage_moderators'),
  ('admin', 'view_all_content'),
  ('admin', 'delete_content'),
  ('admin', 'ban_users'),
  ('admin', 'manage_verifications'),
  ('admin', 'manage_reports'),
  ('admin', 'manage_alerts'),
  ('admin', 'view_analytics'),
  ('admin', 'manage_settings'),
  ('admin', 'manage_professionals'),
  ('admin', 'manage_content')
ON CONFLICT (role, permission) DO NOTHING;

-- Permissions par défaut pour moderator
INSERT INTO public.role_permissions (role, permission) VALUES
  ('moderator', 'view_all_content'),
  ('moderator', 'manage_verifications'),
  ('moderator', 'manage_reports'),
  ('moderator', 'manage_alerts'),
  ('moderator', 'view_analytics')
ON CONFLICT (role, permission) DO NOTHING;

-- Table pour les notifications admin en temps réel
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('verification', 'report', 'alert', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Activer RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Politique : seuls les admins et modérateurs peuvent voir les notifications
CREATE POLICY "Only admins and moderators can view notifications"
ON public.admin_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Politique : seuls les admins et modérateurs peuvent marquer comme lu
CREATE POLICY "Only admins and moderators can update notifications"
ON public.admin_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

-- Fonction pour créer une notification admin automatiquement
CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérification créée
  IF TG_TABLE_NAME = 'verifications' AND NEW.status = 'pending' THEN
    INSERT INTO public.admin_notifications (type, title, message, data)
    VALUES (
      'verification',
      'Nouvelle vérification',
      'Une nouvelle demande de vérification a été soumise',
      jsonb_build_object('verification_id', NEW.id, 'user_id', NEW.user_id)
    );
  END IF;

  -- Signalement créé
  IF TG_TABLE_NAME = 'reports' AND NEW.status = 'open' THEN
    INSERT INTO public.admin_notifications (type, title, message, data)
    VALUES (
      'report',
      'Nouveau signalement',
      'Un nouveau signalement a été créé',
      jsonb_build_object('report_id', NEW.id, 'reported_user_id', NEW.reported_user_id)
    );
  END IF;

  -- Alerte créée
  IF TG_TABLE_NAME = 'alerts' AND NEW.status = 'active' THEN
    INSERT INTO public.admin_notifications (type, title, message, data)
    VALUES (
      'alert',
      'Nouvelle alerte',
      'Une nouvelle alerte système a été générée',
      jsonb_build_object('alert_id', NEW.id, 'severity', NEW.severity)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers pour notifications automatiques
DROP TRIGGER IF EXISTS verification_notification_trigger ON public.verifications;
CREATE TRIGGER verification_notification_trigger
  AFTER INSERT ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS report_notification_trigger ON public.reports;
CREATE TRIGGER report_notification_trigger
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS alert_notification_trigger ON public.alerts;
CREATE TRIGGER alert_notification_trigger
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification();

-- Activer realtime pour les notifications admin
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Fonction pour nettoyer les anciennes notifications (à appeler périodiquement)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  OR (expires_at IS NOT NULL AND expires_at < NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;