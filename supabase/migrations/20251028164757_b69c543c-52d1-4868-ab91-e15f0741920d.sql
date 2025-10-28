-- ============================================
-- ÉTAPE 1 : Supprimer les anciennes policies
-- ============================================

DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view approved pro accounts" ON public.pro_accounts;
DROP POLICY IF EXISTS "Authenticated users can view approved pro accounts" ON public.pro_accounts;
DROP POLICY IF EXISTS "Pro owners can view their own account" ON public.pro_accounts;
DROP POLICY IF EXISTS "Pro owners can update their own account" ON public.pro_accounts;
DROP POLICY IF EXISTS "Pro owners can delete their own account" ON public.pro_accounts;
DROP POLICY IF EXISTS "Pro users can insert their own account" ON public.pro_accounts;

-- ============================================
-- ÉTAPE 2 : Nouvelles policies pour profiles
-- ============================================

-- Voir son propre profil (toutes colonnes)
CREATE POLICY "profiles_read_self"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Profils publics (visibilité publique ou non définie)
CREATE POLICY "profiles_read_public"
ON public.profiles FOR SELECT
TO authenticated
USING (COALESCE(privacy->>'mood','public') = 'public');

-- Profils visibles aux amis uniquement
CREATE POLICY "profiles_read_friends"
ON public.profiles FOR SELECT
TO authenticated
USING (
  COALESCE(privacy->>'mood','public') = 'friends'
  AND EXISTS (
    SELECT 1
    FROM public.friendships f
    WHERE f.status = 'matched'
      AND (
        (f.a_user = auth.uid() AND f.b_user = profiles.id)
        OR
        (f.b_user = auth.uid() AND f.a_user = profiles.id)
      )
  )
);

-- Insert/Update limités au propriétaire
CREATE POLICY "profiles_insert_self"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_self"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- ÉTAPE 3 : Nouvelles policies pour pro_accounts
-- ============================================

-- Lecture publique du répertoire pro si approuvé ET consentement public
CREATE POLICY "pro_accounts_public_directory"
ON public.pro_accounts FOR SELECT
TO authenticated
USING (
  status = 'approved' 
  AND contact_public IS TRUE
);

-- Lecture publique limitée si approuvé MAIS contact non public (masque email/phone)
CREATE POLICY "pro_accounts_public_limited"
ON public.pro_accounts FOR SELECT
TO authenticated
USING (
  status = 'approved' 
  AND (contact_public IS FALSE OR contact_public IS NULL)
);

-- Le propriétaire voit/édite toujours son compte
CREATE POLICY "pro_accounts_owner_read"
ON public.pro_accounts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "pro_accounts_owner_insert"
ON public.pro_accounts FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND (has_role(auth.uid(), 'pro'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "pro_accounts_owner_update"
ON public.pro_accounts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pro_accounts_owner_delete"
ON public.pro_accounts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Admins peuvent tout voir/modifier
CREATE POLICY "pro_accounts_admin_all"
ON public.pro_accounts FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- ÉTAPE 4 : Activer RLS sur toutes les tables
-- ============================================

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);
  END LOOP;
END$$;

-- ============================================
-- ÉTAPE 5 : Index pour optimiser les performances
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_privacy_mood
  ON public.profiles ((privacy->>'mood'));

CREATE INDEX IF NOT EXISTS idx_friendships_a_b_status
  ON public.friendships (a_user, b_user, status);

CREATE INDEX IF NOT EXISTS idx_friendships_b_a_status
  ON public.friendships (b_user, a_user, status);

CREATE INDEX IF NOT EXISTS idx_pro_accounts_status_public
  ON public.pro_accounts (status, contact_public) 
  WHERE status = 'approved';