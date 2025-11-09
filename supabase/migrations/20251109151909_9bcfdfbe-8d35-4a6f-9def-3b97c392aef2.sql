-- ============================================
-- SECURITY FIXES: Résolution des problèmes du linter (corrigé)
-- ============================================

-- 1. Corriger la vue pro_accounts_safe pour retirer SECURITY DEFINER
-- On recrée la vue sans SECURITY DEFINER mais avec security_barrier
DROP VIEW IF EXISTS pro_accounts_safe CASCADE;

CREATE VIEW pro_accounts_safe WITH (security_barrier=true) AS
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
  CASE WHEN contact_public = true THEN email ELSE NULL END as email,
  CASE WHEN contact_public = true THEN phone ELSE NULL END as phone
FROM pro_accounts
WHERE status = 'approved'::text;

-- Autoriser la lecture de cette vue aux utilisateurs authentifiés
GRANT SELECT ON pro_accounts_safe TO authenticated;

-- 2. Activer RLS sur les tables applicatives qui n'en ont pas
-- (EXCLU les tables système PostGIS qui sont en lecture seule)

-- Tables de statistiques/vues applicatives
ALTER TABLE IF EXISTS adoption_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- Tables de badges
ALTER TABLE IF EXISTS badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;

-- Catégories pro
ALTER TABLE IF EXISTS categories_pro ENABLE ROW LEVEL SECURITY;

-- 3. Corriger les fonctions critiques sans search_path
-- Fonction add_xp_event
DROP FUNCTION IF EXISTS public.add_xp_event(uuid, text, integer, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.add_xp_event(
  p_user_id uuid, 
  p_type text, 
  p_points integer, 
  p_ref_id uuid DEFAULT NULL, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.xp_events (user_id, type, points, ref_id, metadata)
  VALUES (p_user_id, p_type, p_points, p_ref_id, p_metadata)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$function$;

-- Fonction check_and_award_badges
DROP FUNCTION IF EXISTS public.check_and_award_badges(uuid);
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS TABLE(badge_code text, newly_awarded boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_badge RECORD;
  v_already_has BOOLEAN;
  v_should_have BOOLEAN;
BEGIN
  FOR v_badge IN SELECT * FROM public.badges LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges 
      WHERE user_id = p_user_id AND user_badges.badge_code = v_badge.code
    ) INTO v_already_has;
    
    IF v_already_has THEN
      check_and_award_badges.badge_code := v_badge.code;
      check_and_award_badges.newly_awarded := false;
      RETURN NEXT;
      CONTINUE;
    END IF;
    
    v_should_have := false;
    
    CASE v_badge.code
      WHEN 'newbie' THEN
        SELECT EXISTS(
          SELECT 1 FROM public.profiles p
          WHERE p.id = p_user_id 
          AND p.display_name IS NOT NULL
          AND EXISTS(SELECT 1 FROM public.dogs WHERE owner_id = p_user_id)
        ) INTO v_should_have;
        
      WHEN 'star' THEN
        SELECT COUNT(*) >= 10 FROM public.walks
        WHERE walks.user_id = p_user_id AND status = 'completed'
        INTO v_should_have;
        
      WHEN 'scout' THEN
        SELECT COUNT(*) >= 3 FROM public.alerts
        WHERE alerts.user_id = p_user_id AND validated_by IS NOT NULL
        INTO v_should_have;
        
      WHEN 'helper' THEN
        SELECT COUNT(*) >= 1 FROM public.alerts
        WHERE alerts.user_id = p_user_id AND type = 'lost_dog' AND status = 'resolved'
        INTO v_should_have;
        
      WHEN 'ambassador' THEN
        SELECT COUNT(*) >= 3 FROM public.referrals
        WHERE referrer_id = p_user_id AND status IN ('signed_up', 'premium_converted')
        INTO v_should_have;
        
      WHEN 'verified' THEN
        SELECT EXISTS(
          SELECT 1 FROM public.verifications
          WHERE verifications.user_id = p_user_id AND status = 'approved'
        ) INTO v_should_have;
    END CASE;
    
    IF v_should_have THEN
      INSERT INTO public.user_badges (user_id, badge_code)
      VALUES (p_user_id, v_badge.code)
      ON CONFLICT (user_id, badge_code) DO NOTHING;
      
      check_and_award_badges.badge_code := v_badge.code;
      check_and_award_badges.newly_awarded := true;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$function$;

-- 4. Documentation
COMMENT ON VIEW pro_accounts_safe IS 
  'Vue sécurisée de l''annuaire pro avec security_barrier : masque automatiquement les coordonnées si contact_public = false';