-- Create function to find nearby pro accounts using PostGIS
CREATE OR REPLACE FUNCTION public.find_nearby_pros(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 25,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  business_name TEXT,
  category TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  geo GEOGRAPHY,
  logo_url TEXT,
  gallery_urls TEXT[],
  status TEXT,
  plan TEXT,
  contact_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pa.*,
    ST_Distance(
      pa.geo,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000 AS distance_km
  FROM public.pro_accounts pa
  WHERE 
    pa.status = 'approved'
    AND pa.geo IS NOT NULL
    AND ST_DWithin(
      pa.geo,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (filter_category IS NULL OR pa.category = filter_category)
  ORDER BY distance_km
  LIMIT 50
$$;