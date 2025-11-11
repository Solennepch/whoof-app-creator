-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active templates (for edge functions)
CREATE POLICY "Anyone can view active templates"
  ON public.email_templates
  FOR SELECT
  USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default booking reminder template
INSERT INTO public.email_templates (name, subject, html_body, variables) VALUES
(
  'booking_reminder',
  '🐾 Rappel de rendez-vous demain',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Bonjour {{user_name}} ! 👋</h2>
    <p>Ce message est un rappel pour votre rendez-vous demain :</p>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Service:</strong> {{service_name}}</p>
      <p><strong>Professionnel:</strong> {{pro_name}}</p>
      <p><strong>Date:</strong> {{booking_date}}</p>
      <p><strong>Heure:</strong> {{booking_time}}</p>
    </div>

    <p>Merci de confirmer votre présence :</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{confirm_url}}" 
         style="background: #8B2BB8; color: white; padding: 12px 30px; 
                text-decoration: none; border-radius: 6px; display: inline-block;">
        ✅ Confirmer ma présence
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Si vous ne pouvez pas vous rendre à ce rendez-vous, merci de prévenir 
      {{pro_name}} au {{pro_phone}}.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      Whoof Apps - Votre plateforme de services canins<br>
      contact@whoof.app
    </p>
  </div>',
  '["user_name", "service_name", "pro_name", "booking_date", "booking_time", "confirm_url", "pro_phone"]'::jsonb
);

-- Create index for performance
CREATE INDEX idx_email_templates_name ON public.email_templates(name);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);