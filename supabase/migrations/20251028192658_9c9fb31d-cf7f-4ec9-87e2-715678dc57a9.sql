-- Fix function search path for security
CREATE OR REPLACE FUNCTION increment_adoption_counter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.adoption_stats
  SET total_matches = total_matches + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.adoption_stats LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;