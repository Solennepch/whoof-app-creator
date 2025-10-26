import { supabase } from "@/integrations/supabase/client";

/**
 * Safe fetch utility that automatically adds Supabase auth token
 * and handles errors consistently
 */
export async function safeFetch(path: string, init?: RequestInit) {
  try {
    // Get current Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Prepare headers
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    
    // Make the request
    const res = await fetch(path, { ...init, headers });
    
    // Check response status
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText} :: ${text}`);
    }
    
    // Return parsed JSON
    return res.json();
  } catch (error) {
    console.error('safeFetch error:', error);
    throw error;
  }
}
