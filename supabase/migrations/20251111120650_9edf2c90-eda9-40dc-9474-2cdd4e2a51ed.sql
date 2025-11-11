-- Fix search_path for security functions
ALTER FUNCTION update_pro_services_updated_at() SET search_path = public;
ALTER FUNCTION audit_pro_profiles_changes() SET search_path = public;
ALTER FUNCTION audit_pro_services_changes() SET search_path = public;