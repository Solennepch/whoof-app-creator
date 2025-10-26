-- Fix remaining security issues for custom functions

-- Fix 1: Update zodiac_from_date function with proper search_path
CREATE OR REPLACE FUNCTION public.zodiac_from_date(d date)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  m INTEGER := EXTRACT(MONTH FROM d);
  dy INTEGER := EXTRACT(DAY FROM d);
BEGIN
  IF    (m = 1  AND dy >= 20) OR (m = 2  AND dy <= 18) THEN RETURN 'aquarius';
  ELSIF (m = 2  AND dy >= 19) OR (m = 3  AND dy <= 20) THEN RETURN 'pisces';
  ELSIF (m = 3  AND dy >= 21) OR (m = 4  AND dy <= 19) THEN RETURN 'aries';
  ELSIF (m = 4  AND dy >= 20) OR (m = 5  AND dy <= 20) THEN RETURN 'taurus';
  ELSIF (m = 5  AND dy >= 21) OR (m = 6  AND dy <= 20) THEN RETURN 'gemini';
  ELSIF (m = 6  AND dy >= 21) OR (m = 7  AND dy <= 22) THEN RETURN 'cancer';
  ELSIF (m = 7  AND dy >= 23) OR (m = 8  AND dy <= 22) THEN RETURN 'leo';
  ELSIF (m = 8  AND dy >= 23) OR (m = 9  AND dy <= 22) THEN RETURN 'virgo';
  ELSIF (m = 9  AND dy >= 23) OR (m = 10 AND dy <= 22) THEN RETURN 'libra';
  ELSIF (m = 10 AND dy >= 23) OR (m = 11 AND dy <= 21) THEN RETURN 'scorpio';
  ELSIF (m = 11 AND dy >= 22) OR (m = 12 AND dy <= 21) THEN RETURN 'sagittarius';
  ELSE RETURN 'capricorn';
  END IF;
END;
$function$;

COMMENT ON FUNCTION public.zodiac_from_date IS 'Calculate zodiac sign from date - uses secure search_path';

-- Fix 2: Update has_role function with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$function$;

COMMENT ON FUNCTION public.has_role IS 'Check if user has a specific role - uses secure search_path to prevent injection attacks';