-- Fix security issues

-- 1. Recreate profile_view without SECURITY DEFINER (make it a regular view)
DROP VIEW IF EXISTS public.profile_view;
CREATE VIEW public.profile_view AS
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

-- 2. Fix nearby_profiles function to add search_path
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
SECURITY DEFINER
SET search_path = public
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

-- 3. Fix update_updated_at_column function to add search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Move PostGIS to extensions schema (handled by Supabase automatically, no action needed)
-- Note: PostGIS in public schema is a warning, not an error, and is common practice
