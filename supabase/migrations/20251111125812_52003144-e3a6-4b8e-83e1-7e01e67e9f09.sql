-- Create A/B test variants table
CREATE TABLE IF NOT EXISTS public.email_template_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- 'A', 'B', 'C', etc.
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, variant_name)
);

-- Create A/B tests table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'running', 'completed', 'cancelled'
  variant_ids UUID[] NOT NULL, -- Array of variant IDs participating in the test
  traffic_split JSONB DEFAULT '{}'::jsonb, -- {"variant_a": 50, "variant_b": 50}
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_variant_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create A/B test results table for tracking performance
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.email_template_variants(id) ON DELETE CASCADE,
  notification_log_id UUID NOT NULL REFERENCES public.notification_logs(id) ON DELETE CASCADE,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_template_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for email_template_variants
CREATE POLICY "Admins can manage template variants"
  ON public.email_template_variants
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active variants"
  ON public.email_template_variants
  FOR SELECT
  USING (is_active = true);

-- Policies for ab_tests
CREATE POLICY "Admins can manage A/B tests"
  ON public.ab_tests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for ab_test_results
CREATE POLICY "Admins can view A/B test results"
  ON public.ab_test_results
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create A/B test results"
  ON public.ab_test_results
  FOR INSERT
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_email_template_variants_updated_at
  BEFORE UPDATE ON public.email_template_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_test_results_updated_at
  BEFORE UPDATE ON public.ab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_template_variants_template ON public.email_template_variants(template_id);
CREATE INDEX idx_email_template_variants_active ON public.email_template_variants(is_active);
CREATE INDEX idx_ab_tests_template ON public.ab_tests(template_id);
CREATE INDEX idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX idx_ab_test_results_test ON public.ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_variant ON public.ab_test_results(variant_id);

-- Add webhook_id column to notification_logs for tracking Resend webhooks
ALTER TABLE public.notification_logs ADD COLUMN IF NOT EXISTS webhook_id TEXT;
ALTER TABLE public.notification_logs ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.email_template_variants(id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_webhook ON public.notification_logs(webhook_id);