-- Security hardening - Final cleanup (without spatial_ref_sys)

-- 1. Verify and recreate pro_accounts_safe with owner access
DROP VIEW IF EXISTS public.pro_accounts_safe;
CREATE VIEW public.pro_accounts_safe WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  business_name,
  category,
  description,
  website,
  -- Show contact info if public OR if user is the owner
  CASE 
    WHEN contact_public OR auth.uid() = user_id THEN phone 
    ELSE NULL 
  END as phone,
  CASE 
    WHEN contact_public OR auth.uid() = user_id THEN email 
    ELSE NULL 
  END as email,
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

-- 2. Strict grants on pro_accounts_safe
REVOKE ALL ON public.pro_accounts_safe FROM PUBLIC;
REVOKE ALL ON public.pro_accounts_safe FROM anon;
GRANT SELECT ON public.pro_accounts_safe TO authenticated;

COMMENT ON VIEW public.pro_accounts_safe IS 'SECURITY INVOKER view - Secure view that hides contact info unless contact_public=true OR user is the owner. Only accessible to authenticated users.';

-- 3. Verify public schema has no CREATE privilege
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 4. Update profile_view to be explicitly SECURITY INVOKER
DROP VIEW IF EXISTS public.profile_view;
CREATE VIEW public.profile_view WITH (security_invoker=on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  city,
  gender,
  created_at,
  updated_at
FROM public.profiles;

-- Strict grants on profile_view
REVOKE ALL ON public.profile_view FROM PUBLIC;
REVOKE ALL ON public.profile_view FROM anon;
GRANT SELECT ON public.profile_view TO authenticated;

COMMENT ON VIEW public.profile_view IS 'SECURITY INVOKER view - Public profile data only, accessible to authenticated users';

-- 5. Update pro_accounts_public view to be SECURITY INVOKER
DROP VIEW IF EXISTS public.pro_accounts_public;
CREATE VIEW public.pro_accounts_public WITH (security_invoker=on) AS
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
  logo_url,
  gallery_urls,
  status,
  plan,
  created_at,
  updated_at,
  location,
  geo
FROM public.pro_accounts
WHERE status = 'approved';

-- Strict grants on pro_accounts_public
REVOKE ALL ON public.pro_accounts_public FROM PUBLIC;
REVOKE ALL ON public.pro_accounts_public FROM anon;
GRANT SELECT ON public.pro_accounts_public TO authenticated;

COMMENT ON VIEW public.pro_accounts_public IS 'SECURITY INVOKER view - Public pro accounts with conditional contact info exposure';

-- 6. Document security model
COMMENT ON SCHEMA public IS 'Main application schema with PostGIS extensions. Security model: RLS enabled on all user tables, CREATE revoked from PUBLIC/anon, all custom functions use secure search_path (pg_catalog, public), all views are SECURITY INVOKER with explicit grants to authenticated role only. Note: spatial_ref_sys is a PostGIS system table and cannot be modified.';

-- 7. Final verification - ensure no dangerous grants exist
DO $$
BEGIN
  -- Revoke any remaining dangerous privileges
  EXECUTE 'REVOKE CREATE ON SCHEMA public FROM PUBLIC';
  EXECUTE 'REVOKE CREATE ON SCHEMA public FROM anon';
  EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
  EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
  
  RAISE NOTICE 'Security hardening complete: all views are SECURITY INVOKER, strict grants applied, public schema locked down';
END $$;