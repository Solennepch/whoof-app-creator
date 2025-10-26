import { supabase } from "@/integrations/supabase/client";

// Synchronize Supabase session token to localStorage for external API compatibility
(async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    localStorage.setItem("access_token", token);
  }
})();

// Listen to auth changes (login/refresh/logout)
supabase.auth.onAuthStateChange((_event, session) => {
  const token = session?.access_token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
});
