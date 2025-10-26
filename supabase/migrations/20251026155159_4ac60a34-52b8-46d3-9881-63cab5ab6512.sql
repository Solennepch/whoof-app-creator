-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  privacy JSONB DEFAULT '{"mood":"friends"}'::jsonb,
  mood_tags TEXT[] DEFAULT '{}',
  home_geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on home_geom for spatial queries
CREATE INDEX profiles_home_geom_gist ON public.profiles USING GIST (home_geom);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age_years INTEGER,
  temperament TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
  vaccination JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on dogs
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- RLS policies for dogs
CREATE POLICY "Anyone can view dogs"
  ON public.dogs FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert their dogs"
  ON public.dogs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their dogs"
  ON public.dogs FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their dogs"
  ON public.dogs FOR DELETE
  USING (auth.uid() = owner_id);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  a_user UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  b_user UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(a_user, b_user),
  CHECK (a_user < b_user)
);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = a_user OR auth.uid() = b_user);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = a_user OR auth.uid() = b_user);

CREATE POLICY "Users can update their friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = a_user OR auth.uid() = b_user);

-- Create verifications table
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('identity', 'vaccination', 'ownership', 'other')),
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on verifications
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for verifications
CREATE POLICY "Users can view own verifications"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for verifications
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for verifications bucket
CREATE POLICY "Users can read own verification files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verifications' AND owner = auth.uid());

CREATE POLICY "Users can upload own verification files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verifications' AND owner = auth.uid());

CREATE POLICY "Users can update own verification files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'verifications' AND owner = auth.uid());

CREATE POLICY "Users can delete own verification files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'verifications' AND owner = auth.uid());

-- Create profile view that respects privacy settings for mood_tags
CREATE OR REPLACE VIEW public.profile_view AS
SELECT
  p.id,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.privacy,
  p.home_geom,
  p.created_at,
  p.updated_at,
  CASE
    WHEN (p.privacy->>'mood') = 'public' THEN p.mood_tags
    WHEN (p.privacy->>'mood') = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted' AND (
        (f.a_user = p.id AND f.b_user = auth.uid()) OR
        (f.b_user = p.id AND f.a_user = auth.uid())
      )
    ) THEN p.mood_tags
    ELSE array_remove(p.mood_tags, 'in_heat')
  END AS mood_tags_effective
FROM public.profiles p;

-- Create nearby_profiles function
CREATE OR REPLACE FUNCTION public.nearby_profiles(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  meters INTEGER
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
AS $$
  WITH query_point AS (
    SELECT ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography AS geom
  )
  SELECT 
    p.id,
    p.display_name,
    ST_Distance(p.home_geom, qp.geom) AS distance_meters
  FROM public.profiles p, query_point qp
  WHERE p.home_geom IS NOT NULL
    AND ST_DWithin(p.home_geom, qp.geom, LEAST(meters, 25000))
  ORDER BY distance_meters ASC
  LIMIT 50;
$$;

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
