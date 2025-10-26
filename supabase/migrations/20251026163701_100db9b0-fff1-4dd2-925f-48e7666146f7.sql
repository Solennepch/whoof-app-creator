-- Add birthdate and zodiac_sign columns to dogs table
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS birthdate date;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS zodiac_sign text;

-- Create function to calculate zodiac sign from birthdate
CREATE OR REPLACE FUNCTION public.zodiac_from_date(d date)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  WITH md AS (
    SELECT (EXTRACT(MONTH FROM d)::int * 100 + EXTRACT(DAY FROM d)::int) AS mmdd
  )
  SELECT CASE
    WHEN (SELECT mmdd FROM md) BETWEEN 321 AND 419   THEN 'Aries'
    WHEN (SELECT mmdd FROM md) BETWEEN 420 AND 520   THEN 'Taurus'
    WHEN (SELECT mmdd FROM md) BETWEEN 521 AND 620   THEN 'Gemini'
    WHEN (SELECT mmdd FROM md) BETWEEN 621 AND 722   THEN 'Cancer'
    WHEN (SELECT mmdd FROM md) BETWEEN 723 AND 822   THEN 'Leo'
    WHEN (SELECT mmdd FROM md) BETWEEN 823 AND 922   THEN 'Virgo'
    WHEN (SELECT mmdd FROM md) BETWEEN 923 AND 1022  THEN 'Libra'
    WHEN (SELECT mmdd FROM md) BETWEEN 1023 AND 1121 THEN 'Scorpio'
    WHEN (SELECT mmdd FROM md) BETWEEN 1122 AND 1221 THEN 'Sagittarius'
    WHEN (SELECT mmdd FROM md) >= 1222 OR (SELECT mmdd FROM md) <= 119 THEN 'Capricorn'
    WHEN (SELECT mmdd FROM md) BETWEEN 120 AND 218   THEN 'Aquarius'
    WHEN (SELECT mmdd FROM md) BETWEEN 219 AND 320   THEN 'Pisces'
    ELSE NULL
  END;
$$;

-- Create trigger function to automatically set zodiac_sign
CREATE OR REPLACE FUNCTION public.dogs_set_zodiac()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create trigger
DROP TRIGGER IF EXISTS trg_dogs_set_zodiac ON public.dogs;
CREATE TRIGGER trg_dogs_set_zodiac
BEFORE INSERT OR UPDATE OF birthdate ON public.dogs
FOR EACH ROW
EXECUTE FUNCTION public.dogs_set_zodiac();

-- Backfill existing records
UPDATE public.dogs
SET zodiac_sign = public.zodiac_from_date(birthdate)
WHERE birthdate IS NOT NULL;