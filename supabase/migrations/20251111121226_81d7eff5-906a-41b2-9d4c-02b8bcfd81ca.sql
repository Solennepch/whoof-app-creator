-- Add gallery to pro_services
ALTER TABLE public.pro_services 
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Create bookings table for reservations
CREATE TABLE IF NOT EXISTS public.pro_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_profile_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.pro_services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for bookings
CREATE INDEX idx_pro_bookings_profile ON public.pro_bookings(pro_profile_id);
CREATE INDEX idx_pro_bookings_service ON public.pro_bookings(service_id);
CREATE INDEX idx_pro_bookings_user ON public.pro_bookings(user_id);
CREATE INDEX idx_pro_bookings_date ON public.pro_bookings(booking_date);
CREATE INDEX idx_pro_bookings_status ON public.pro_bookings(status);

-- Enable RLS
ALTER TABLE public.pro_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their bookings"
  ON public.pro_bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON public.pro_bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings
CREATE POLICY "Users can update their bookings"
  ON public.pro_bookings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Pro owners can view bookings for their services
CREATE POLICY "Pro owners can view their bookings"
  ON public.pro_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_bookings.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Pro owners can update bookings for their services
CREATE POLICY "Pro owners can update their bookings"
  ON public.pro_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_bookings.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON public.pro_bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_pro_bookings_updated_at_trigger
  BEFORE UPDATE ON public.pro_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_services_updated_at();

-- Create pro_availability table for managing time slots
CREATE TABLE IF NOT EXISTS public.pro_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_profile_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_pro_availability_profile ON public.pro_availability(pro_profile_id);

-- Enable RLS
ALTER TABLE public.pro_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view active availability
CREATE POLICY "Anyone can view availability"
  ON public.pro_availability
  FOR SELECT
  USING (is_active = true);

-- Pro owners can manage their availability
CREATE POLICY "Pro owners can manage availability"
  ON public.pro_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_profiles
      WHERE pro_profiles.id = pro_availability.pro_profile_id
      AND pro_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
  ON public.pro_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );