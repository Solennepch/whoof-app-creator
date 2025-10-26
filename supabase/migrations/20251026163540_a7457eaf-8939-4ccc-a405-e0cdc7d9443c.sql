-- Fix search_path for the trigger function to improve security
CREATE OR REPLACE FUNCTION public.dogs_set_zodiac()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.birthdate IS NOT NULL THEN
    NEW.zodiac_sign := public.zodiac_from_date(NEW.birthdate);
  ELSE
    NEW.zodiac_sign := NULL;
  END IF;
  RETURN NEW;
END;
$$;