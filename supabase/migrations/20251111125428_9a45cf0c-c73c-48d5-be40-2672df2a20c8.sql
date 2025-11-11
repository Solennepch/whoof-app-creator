-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email', -- 'email', 'sms', or 'both'
  event_type TEXT NOT NULL, -- 'booking_reminder', 'booking_confirmed', etc.
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, event_type)
);

-- Create notification logs table for tracking
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email' or 'sms'
  recipient TEXT NOT NULL, -- email or phone number
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'opened', 'clicked'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Notification preferences policies
CREATE POLICY "Users can view their preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their preferences"
  ON public.notification_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Notification logs policies
CREATE POLICY "Admins can view all logs"
  ON public.notification_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their logs"
  ON public.notification_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_event ON public.notification_preferences(event_type);
CREATE INDEX idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_template ON public.notification_logs(template_name);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_created ON public.notification_logs(created_at DESC);

-- Insert additional email templates
INSERT INTO public.email_templates (name, subject, html_body, variables) VALUES
(
  'booking_confirmed',
  '✅ Réservation confirmée',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Bonjour {{user_name}} ! 👋</h2>
    <p>Votre réservation a été confirmée avec succès.</p>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Service:</strong> {{service_name}}</p>
      <p><strong>Professionnel:</strong> {{pro_name}}</p>
      <p><strong>Date:</strong> {{booking_date}}</p>
      <p><strong>Heure:</strong> {{booking_time}}</p>
      <p><strong>Prix:</strong> {{price}}€</p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Vous recevrez un rappel 24h avant votre rendez-vous.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      Whoof Apps - Votre plateforme de services canins<br>
      contact@whoof.app
    </p>
  </div>',
  '["user_name", "service_name", "pro_name", "booking_date", "booking_time", "price"]'::jsonb
),
(
  'booking_cancelled',
  '❌ Réservation annulée',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Bonjour {{user_name}},</h2>
    <p>Votre réservation a été annulée.</p>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Service:</strong> {{service_name}}</p>
      <p><strong>Professionnel:</strong> {{pro_name}}</p>
      <p><strong>Date:</strong> {{booking_date}}</p>
      <p><strong>Raison:</strong> {{cancellation_reason}}</p>
    </div>

    <p>Nous sommes désolés pour ce désagrément. N''hésitez pas à reprendre un nouveau rendez-vous quand vous le souhaitez.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      Whoof Apps - Votre plateforme de services canins<br>
      contact@whoof.app
    </p>
  </div>',
  '["user_name", "service_name", "pro_name", "booking_date", "cancellation_reason"]'::jsonb
),
(
  'booking_followup',
  '⭐ Comment s''est passé votre rendez-vous ?',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Bonjour {{user_name}} ! 👋</h2>
    <p>Nous espérons que votre rendez-vous avec {{pro_name}} s''est bien passé.</p>
    
    <p>Votre avis nous intéresse ! Prenez quelques instants pour laisser un commentaire :</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{review_url}}" 
         style="background: #8B2BB8; color: white; padding: 12px 30px; 
                text-decoration: none; border-radius: 6px; display: inline-block;">
        ⭐ Laisser un avis
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Votre retour aide les autres utilisateurs à faire le meilleur choix.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      Whoof Apps - Votre plateforme de services canins<br>
      contact@whoof.app
    </p>
  </div>',
  '["user_name", "pro_name", "review_url"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;