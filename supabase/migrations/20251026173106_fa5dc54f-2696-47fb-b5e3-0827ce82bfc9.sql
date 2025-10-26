-- ============================================
-- 1. Create app_role enum and user_roles system
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'pro', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Create categories_pro table
-- ============================================
CREATE TABLE public.categories_pro (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);

-- Pre-fill categories
INSERT INTO public.categories_pro (slug, label) VALUES
  ('veterinaire', 'Vétérinaire'),
  ('toiletteur', 'Toiletteur'),
  ('educateur', 'Éducateur canin'),
  ('pet-sitter', 'Pet-sitter'),
  ('refuge', 'Refuge / Association'),
  ('boutique', 'Boutique'),
  ('pension', 'Pension'),
  ('photographe', 'Photographe animalier');

-- ============================================
-- 3. Create pro_accounts table
-- ============================================
CREATE TABLE public.pro_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  geo GEOGRAPHY(Point, 4326),
  logo_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_plus', 'pro_premium')),
  contact_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pro_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for pro_accounts
CREATE POLICY "Anyone can view approved pro accounts"
  ON public.pro_accounts
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Pro owners can view their own account"
  ON public.pro_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pro accounts"
  ON public.pro_accounts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Pro users can insert their own account"
  ON public.pro_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    (public.has_role(auth.uid(), 'pro') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Pro owners can update their own account"
  ON public.pro_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any pro account"
  ON public.pro_accounts
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Pro owners can delete their own account"
  ON public.pro_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any pro account"
  ON public.pro_accounts
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. Create partnerships table
-- ============================================
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES public.pro_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  offer TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- RLS policies for partnerships
CREATE POLICY "Anyone can view active partnerships"
  ON public.partnerships
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Pro owners can view their partnerships"
  ON public.partnerships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_accounts
      WHERE id = partnerships.pro_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all partnerships"
  ON public.partnerships
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Pro owners can create partnerships"
  ON public.partnerships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pro_accounts
      WHERE id = partnerships.pro_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Pro owners can update their partnerships"
  ON public.partnerships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_accounts
      WHERE id = partnerships.pro_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Pro owners can delete their partnerships"
  ON public.partnerships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pro_accounts
      WHERE id = partnerships.pro_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all partnerships"
  ON public.partnerships
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 5. Create storage bucket for pro assets
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pro-assets', 'pro-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pro-assets
CREATE POLICY "Pro owners can upload to their folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pro-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Pro owners can view their files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pro-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Pro owners can update their files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pro-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Pro owners can delete their files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pro-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins have full access to pro-assets"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'pro-assets' AND
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================
-- 6. Create indexes for performance
-- ============================================
CREATE INDEX idx_pro_accounts_user_id ON public.pro_accounts(user_id);
CREATE INDEX idx_pro_accounts_status ON public.pro_accounts(status);
CREATE INDEX idx_pro_accounts_category ON public.pro_accounts(category);
CREATE INDEX idx_pro_accounts_geo ON public.pro_accounts USING GIST(geo);
CREATE INDEX idx_partnerships_pro_id ON public.partnerships(pro_id);
CREATE INDEX idx_partnerships_is_active ON public.partnerships(is_active);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- 7. Create trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pro_accounts_updated_at
  BEFORE UPDATE ON public.pro_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();