-- Function to increment pro profile views
CREATE OR REPLACE FUNCTION increment_pro_view(pro_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pro_profiles
  SET views_count = views_count + 1
  WHERE id = pro_id;
END;
$$;