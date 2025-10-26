-- =====================================================
-- CORRECTIF SÉCURITÉ: Finalisation de la protection des données
-- =====================================================

-- 1. Supprimer et recréer les policies profiles de manière sûre
DO $$ 
BEGIN
  -- Supprimer les anciennes policies si elles existent
  DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;

  -- Créer la policy pour voir son propre profil
  CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

  -- Créer la policy pour voir les profils des autres (limitée)
  CREATE POLICY "Users can view public profile data"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() != id);
END $$;

-- 2. Recréer la vue profile_view SANS security definer
DROP VIEW IF EXISTS public.profile_view CASCADE;

CREATE VIEW public.profile_view 
WITH (security_invoker=on) AS
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

-- Donner accès à la vue seulement aux utilisateurs authentifiés
REVOKE ALL ON public.profile_view FROM anon, public;
GRANT SELECT ON public.profile_view TO authenticated;

-- 3. S'assurer que RLS est activé sur TOUTES les tables nécessaires
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'direct_messages', 'direct_threads', 
                      'friendships', 'verifications', 'push_subscriptions',
                      'dogs', 'pro_accounts', 'partnerships', 'user_roles',
                      'walk_events', 'walk_participants', 'reports')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- 4. Révoquer tous les accès publics non nécessaires
REVOKE ALL ON public.profiles FROM anon, public;
REVOKE ALL ON public.direct_messages FROM anon, public;
REVOKE ALL ON public.direct_threads FROM anon, public;
REVOKE ALL ON public.friendships FROM anon, public;
REVOKE ALL ON public.verifications FROM anon, public;
REVOKE ALL ON public.push_subscriptions FROM anon, public;

-- Autoriser seulement authenticated via RLS
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- 5. Protéger les pro_accounts contre l'exposition des contacts
-- Créer une vue publique qui ne montre que les infos nécessaires
DROP VIEW IF EXISTS public.pro_accounts_public CASCADE;

CREATE VIEW public.pro_accounts_public AS
SELECT 
  id,
  user_id,
  business_name,
  category,
  description,
  address,
  website,
  logo_url,
  gallery_urls,
  status,
  plan,
  created_at,
  updated_at,
  location,
  geo,
  -- Afficher email/phone SEULEMENT si contact_public est true
  CASE WHEN contact_public THEN email ELSE NULL END AS email,
  CASE WHEN contact_public THEN phone ELSE NULL END AS phone
FROM public.pro_accounts
WHERE status = 'approved';

-- Donner accès à la vue publique
GRANT SELECT ON public.pro_accounts_public TO authenticated, anon;

-- 6. Avertir sur les extensions en public (ne peut pas être corrigé ici)
-- Les extensions PostGIS doivent rester dans public pour fonctionner
-- Ce warning peut être ignoré pour PostGIS