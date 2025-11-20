import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  // MODE SANDBOX : accès complet sans restrictions
  return { 
    isAdmin: true, 
    isLoading: false 
  };
}
