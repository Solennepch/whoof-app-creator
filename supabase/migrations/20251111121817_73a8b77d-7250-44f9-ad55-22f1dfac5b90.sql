-- Create pro_reviews table for client reviews
CREATE TABLE IF NOT EXISTS public.pro_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_profile_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.pro_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  pro_response TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_pro_reviews_profile ON public.pro_reviews(pro_profile_id);
CREATE INDEX idx_pro_reviews_user ON public.pro_reviews(user_id);
CREATE INDEX idx_pro_reviews_status ON public.pro_reviews(status);

-- Enable RLS
ALTER TABLE public.pro_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.pro_reviews
  FOR SELECT
  USING (status = 'approved');

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews"
  ON public.pro_reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
  ON public.pro_reviews
  FOR SELECT
  USING (user_id = auth.uid());

-- Pro owners can view reviews for their profile
CREATE POLICY "Pro owners can view their reviews"
  ON public.pro_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_reviews.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Pro owners can respond to reviews
CREATE POLICY "Pro owners can respond to reviews"
  ON public.pro_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_reviews.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON public.pro_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create pro_transactions table for payment history
CREATE TABLE IF NOT EXISTS public.pro_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_profile_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.pro_bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'payout', 'subscription')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  stripe_payment_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_pro_transactions_profile ON public.pro_transactions(pro_profile_id);
CREATE INDEX idx_pro_transactions_user ON public.pro_transactions(user_id);
CREATE INDEX idx_pro_transactions_status ON public.pro_transactions(status);
CREATE INDEX idx_pro_transactions_created ON public.pro_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.pro_transactions ENABLE ROW LEVEL SECURITY;

-- Pro owners can view their transactions
CREATE POLICY "Pro owners can view their transactions"
  ON public.pro_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_transactions.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Users can view their transactions
CREATE POLICY "Users can view their transactions"
  ON public.pro_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all transactions
CREATE POLICY "Admins can manage transactions"
  ON public.pro_transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'review', 'payment', 'message', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at on reviews
CREATE TRIGGER update_pro_reviews_updated_at_trigger
  BEFORE UPDATE ON public.pro_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_services_updated_at();

-- Trigger for updated_at on transactions
CREATE TRIGGER update_pro_transactions_updated_at_trigger
  BEFORE UPDATE ON public.pro_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_services_updated_at();

-- Function to automatically update pro rating average
CREATE OR REPLACE FUNCTION update_pro_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.pro_profiles
  SET rating_avg = (
    SELECT AVG(rating)::numeric(3,2)
    FROM public.pro_reviews
    WHERE pro_profile_id = COALESCE(NEW.pro_profile_id, OLD.pro_profile_id)
    AND status = 'approved'
  )
  WHERE id = COALESCE(NEW.pro_profile_id, OLD.pro_profile_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update rating average
CREATE TRIGGER update_pro_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pro_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_rating_avg();