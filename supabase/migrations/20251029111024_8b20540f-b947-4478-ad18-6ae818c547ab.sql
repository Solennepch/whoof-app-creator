-- Fix security issues from linter (excluding system tables)

-- 1. Fix Security Definer View - recreate user_xp_summary with proper security
DROP VIEW IF EXISTS public.user_xp_summary;

CREATE VIEW public.user_xp_summary 
WITH (security_invoker=true)
AS
SELECT 
  user_id,
  COALESCE(SUM(points), 0) as total_xp,
  FLOOR(COALESCE(SUM(points), 0) / 200) as level,
  COUNT(*) as total_events
FROM public.xp_events
GROUP BY user_id;

-- 2. Fix function search_path - add to update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;