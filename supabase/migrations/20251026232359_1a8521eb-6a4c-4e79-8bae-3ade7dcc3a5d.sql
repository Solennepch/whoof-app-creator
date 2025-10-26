-- Fix 1: Business Owner Contact Information Leaked to Competitors
-- Revoke public access to pro_accounts sensitive fields
REVOKE SELECT ON TABLE public.pro_accounts FROM anon;
REVOKE SELECT ON TABLE public.pro_accounts FROM public;

-- Ensure RLS is enabled
ALTER TABLE public.pro_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Pro accounts are viewable by everyone" ON public.pro_accounts;
DROP POLICY IF EXISTS "Read pro info for authenticated users" ON public.pro_accounts;
DROP POLICY IF EXISTS "Read pro accounts with contact restrictions" ON public.pro_accounts;

-- Create policy: only show approved pro accounts to authenticated users
CREATE POLICY "Authenticated users can view approved pro accounts"
ON public.pro_accounts
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Create a secure view that masks contact info based on contact_public flag
DROP VIEW IF EXISTS public.pro_accounts_safe;
CREATE VIEW public.pro_accounts_safe WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  business_name,
  category,
  description,
  website,
  CASE WHEN contact_public THEN phone ELSE NULL END as phone,
  CASE WHEN contact_public THEN email ELSE NULL END as email,
  address,
  geo,
  logo_url,
  gallery_urls,
  status,
  plan,
  contact_public,
  created_at,
  updated_at
FROM public.pro_accounts
WHERE status = 'approved';

GRANT SELECT ON public.pro_accounts_safe TO authenticated;
COMMENT ON VIEW public.pro_accounts_safe IS 'Secure view that hides contact info unless contact_public is true';

-- Fix 2: Function Search Path Mutable
-- Update all custom functions to use explicit schema references

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;

-- Fix dogs_set_zodiac function
CREATE OR REPLACE FUNCTION public.dogs_set_zodiac()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  IF NEW.birthdate IS NOT NULL THEN
    NEW.zodiac_sign := public.zodiac_from_date(NEW.birthdate);
  ELSE
    NEW.zodiac_sign := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix find_nearby_pros function (with explicit columns and fixed search_path)
CREATE OR REPLACE FUNCTION public.find_nearby_pros(
  user_lat double precision, 
  user_lng double precision, 
  radius_km double precision DEFAULT 25, 
  filter_category text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  business_name text, 
  category text, 
  description text, 
  website text, 
  phone text, 
  email text, 
  address text, 
  geo geography, 
  logo_url text, 
  gallery_urls text[], 
  status text, 
  plan text, 
  contact_public boolean, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  distance_km double precision
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
  SELECT 
    pa.id,
    pa.user_id,
    pa.business_name,
    pa.category,
    pa.description,
    pa.website,
    pa.phone,
    pa.email,
    pa.address,
    pa.geo,
    pa.logo_url,
    pa.gallery_urls,
    pa.status,
    pa.plan,
    pa.contact_public,
    pa.created_at,
    pa.updated_at,
    (public.ST_Distance(
      pa.geo,
      public.ST_SetSRID(public.ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000)::double precision AS distance_km
  FROM public.pro_accounts pa
  WHERE 
    pa.status = 'approved'
    AND pa.geo IS NOT NULL
    AND public.ST_DWithin(
      pa.geo,
      public.ST_SetSRID(public.ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (filter_category IS NULL OR pa.category = filter_category)
  ORDER BY distance_km
  LIMIT 50
$function$;

-- Fix set_timestamps function
CREATE OR REPLACE FUNCTION public.set_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.created_at = COALESCE(NEW.created_at, now());
    NEW.updated_at = now();
  ELSE
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix 3: Extension in Public
-- Note: Moving PostGIS extensions can break existing queries
-- Instead, we'll restrict privileges on the public schema

-- Revoke CREATE on public schema from PUBLIC role
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Ensure anon role has very limited access
REVOKE ALL ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Anon can only read specific safe views
GRANT SELECT ON public.pro_accounts_safe TO anon;

-- Comment explaining the security model
COMMENT ON SCHEMA public IS 'Main schema with PostGIS extensions. Extensions remain here for compatibility. Access is restricted via RLS policies and explicit grants to prevent data leaks.';