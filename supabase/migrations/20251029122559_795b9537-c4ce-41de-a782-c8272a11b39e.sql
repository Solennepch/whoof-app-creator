-- Create pro_profiles table
CREATE TABLE IF NOT EXISTS public.pro_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  activity TEXT NOT NULL CHECK (activity IN ('vet', 'sitter', 'toiletteur', 'educateur', 'pension', 'marque', 'autre')),
  siret TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  radius_km INTEGER DEFAULT 25,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(2,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages_pro table for pro-user communications
CREATE TABLE IF NOT EXISTS public.messages_pro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('pro', 'user')),
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_by TEXT[] DEFAULT '{}'
);

-- Create favorites_pro table for users to save pros
CREATE TABLE IF NOT EXISTS public.favorites_pro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pro_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_profiles_user_id ON public.pro_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_activity ON public.pro_profiles(activity);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_published ON public.pro_profiles(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_pro_profiles_city ON public.pro_profiles(city);
CREATE INDEX IF NOT EXISTS idx_messages_pro_conversations ON public.messages_pro(pro_id, user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_pro_user ON public.favorites_pro(user_id, created_at DESC);

-- Enable RLS on all pro tables
ALTER TABLE public.pro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_pro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites_pro ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pro_profiles
CREATE POLICY "Anyone can view published pro profiles" ON public.pro_profiles
  FOR SELECT TO authenticated
  USING (is_published = true);

CREATE POLICY "Pro owners can view their own profile" ON public.pro_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Pro owners can create their profile" ON public.pro_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pro owners can update their profile" ON public.pro_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all pro profiles" ON public.pro_profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for messages_pro
CREATE POLICY "Pros can view their messages" ON public.messages_pro
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pro_profiles WHERE id = messages_pro.pro_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view their messages with pros" ON public.messages_pro
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Pros can send messages" ON public.messages_pro
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_role = 'pro' AND 
    EXISTS (SELECT 1 FROM public.pro_profiles WHERE id = messages_pro.pro_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to pros" ON public.messages_pro
  FOR INSERT TO authenticated
  WITH CHECK (sender_role = 'user' AND user_id = auth.uid());

-- RLS Policies for favorites_pro
CREATE POLICY "Users can view their favorites" ON public.favorites_pro
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" ON public.favorites_pro
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites" ON public.favorites_pro
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Trigger to auto-sync with pro_accounts when published
CREATE OR REPLACE FUNCTION sync_pro_to_directory()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published = true THEN
    -- Insert or update in pro_accounts
    INSERT INTO public.pro_accounts (
      id, user_id, business_name, category, description,
      website, phone, email, address, logo_url, gallery_urls,
      status, plan, contact_public, created_at, updated_at
    ) VALUES (
      NEW.id, NEW.user_id, NEW.business_name, NEW.activity, NEW.description,
      NEW.website, NEW.phone, NEW.email, NEW.city, NEW.logo_url, '{}',
      CASE WHEN NEW.verified THEN 'approved' ELSE 'pending' END, 'free', true, NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      business_name = NEW.business_name,
      category = NEW.activity,
      description = NEW.description,
      website = NEW.website,
      phone = NEW.phone,
      email = NEW.email,
      address = NEW.city,
      logo_url = NEW.logo_url,
      updated_at = NEW.updated_at;
  ELSE
    -- If unpublished, update status in pro_accounts
    UPDATE public.pro_accounts
    SET status = 'draft', updated_at = NEW.updated_at
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_pro_profiles_to_directory
  AFTER INSERT OR UPDATE ON public.pro_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_pro_to_directory();

-- Trigger for updated_at
CREATE TRIGGER update_pro_profiles_updated_at
  BEFORE UPDATE ON public.pro_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamps();