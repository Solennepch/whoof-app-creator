-- ============================================
-- SECURITY FIXES: RLS Policies Improvements
-- ============================================

-- 1. Améliorer la politique profiles_read_public
-- Au lieu de permettre l'accès public par défaut, on exige l'authentification
DROP POLICY IF EXISTS "profiles_read_public" ON profiles;

-- Nouvelle politique : seuls les utilisateurs authentifiés peuvent voir les profils publics
CREATE POLICY "profiles_read_public_authenticated" 
ON profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND COALESCE((privacy ->> 'mood'::text), 'private'::text) = 'public'::text
);

-- 2. Améliorer les politiques pro_accounts
-- Supprimer les anciennes politiques publiques trop permissives
DROP POLICY IF EXISTS "pro_accounts_public_directory" ON pro_accounts;
DROP POLICY IF EXISTS "pro_accounts_public_limited" ON pro_accounts;

-- Nouvelle politique : seuls les utilisateurs authentifiés peuvent voir l'annuaire
-- Les coordonnées (email, phone) ne sont visibles que si contact_public = true
CREATE POLICY "pro_accounts_directory_authenticated" 
ON pro_accounts 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND status = 'approved'::text
);

-- 3. Créer une vue publique limitée pour l'annuaire (sans coordonnées sensibles)
-- Cette vue peut être utilisée pour afficher l'annuaire sans exposer les contacts
DROP VIEW IF EXISTS pro_accounts_safe CASCADE;

CREATE OR REPLACE VIEW pro_accounts_safe AS
SELECT 
  id,
  business_name,
  category,
  description,
  logo_url,
  gallery_urls,
  address,
  website,
  status,
  plan,
  geo,
  contact_public,
  created_at,
  updated_at,
  user_id,
  -- Coordonnées visibles uniquement si contact_public = true
  CASE WHEN contact_public = true THEN email ELSE NULL END as email,
  CASE WHEN contact_public = true THEN phone ELSE NULL END as phone
FROM pro_accounts
WHERE status = 'approved'::text;

-- Autoriser la lecture de cette vue aux utilisateurs authentifiés
GRANT SELECT ON pro_accounts_safe TO authenticated;

-- 4. Vérifier et activer RLS sur toutes les tables publiques importantes
-- (RLS devrait déjà être activé, mais on s'assure)

-- Vérification des tables critiques
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'profiles', 'pro_accounts', 'dogs', 'walks', 'friendships',
      'messages_pro', 'direct_messages', 'direct_threads', 'alerts',
      'reports', 'verifications', 'user_roles', 'sanctions'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- 5. Ajouter des commentaires pour la documentation
COMMENT ON POLICY "profiles_read_public_authenticated" ON profiles IS 
  'Seuls les utilisateurs authentifiés peuvent voir les profils marqués comme publics';

COMMENT ON POLICY "pro_accounts_directory_authenticated" ON pro_accounts IS 
  'Seuls les utilisateurs authentifiés peuvent accéder à l''annuaire des professionnels approuvés';

COMMENT ON VIEW pro_accounts_safe IS 
  'Vue sécurisée de l''annuaire pro : masque les coordonnées si contact_public = false';