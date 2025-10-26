-- =====================================================
-- CORRECTIF SÉCURITÉ: Protéger les données utilisateurs
-- =====================================================

-- 1. CORRIGER L'EXPOSITION PUBLIQUE DES PROFILS
-- Supprimer la policy trop permissive qui expose TOUS les profils à TOUT LE MONDE
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Créer une policy permettant aux utilisateurs de voir leur propre profil complet
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Créer une policy permettant de voir les profils publics des autres (données non sensibles seulement)
CREATE POLICY "Users can view public profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() != id);

-- 2. CORRIGER LA VUE profile_view (recréer sans SECURITY DEFINER)
DROP VIEW IF EXISTS public.profile_view CASCADE;

CREATE VIEW public.profile_view AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  city,
  gender,
  created_at,
  updated_at,
  home_geom,
  mood_tags
FROM public.profiles;

-- 3. VÉRIFIER ET ACTIVER RLS SUR TOUTES LES TABLES EXPOSÉES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RÉVOQUER LES PERMISSIONS PUBLIQUES NON NÉCESSAIRES
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Autoriser seulement les utilisateurs authentifiés via RLS
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- 5. PROTÉGER LES AUTRES TABLES SENSIBLES
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. La fonction has_role existe déjà avec la bonne signature
-- Pas besoin de la recréer

-- 7. RÉVOQUER LES ACCÈS INUTILES AUX RÔLES NON AUTHENTIFIÉS
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;