-- Create astrodog_horoscopes table
CREATE TABLE IF NOT EXISTS public.astrodog_horoscopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zodiac_sign TEXT NOT NULL CHECK (zodiac_sign IN (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  )),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  horoscope_text TEXT NOT NULL,
  mood TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  UNIQUE(zodiac_sign, week_start)
);

-- Add RLS
ALTER TABLE public.astrodog_horoscopes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active horoscopes
CREATE POLICY "Anyone can view active horoscopes"
ON public.astrodog_horoscopes FOR SELECT
USING (is_active = true);

-- Admins can manage horoscopes
CREATE POLICY "Admins can manage horoscopes"
ON public.astrodog_horoscopes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add indexes for performance
CREATE INDEX idx_astrodog_horoscopes_active ON astrodog_horoscopes(is_active, week_start);
CREATE INDEX idx_astrodog_horoscopes_zodiac ON astrodog_horoscopes(zodiac_sign);

-- Add user ban columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);

-- Add updated_at trigger for astrodog_horoscopes
CREATE TRIGGER update_astrodog_horoscopes_updated_at
BEFORE UPDATE ON public.astrodog_horoscopes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();