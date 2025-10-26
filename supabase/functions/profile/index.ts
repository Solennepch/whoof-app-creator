import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Extract profile ID from URL path (e.g., /profile/uuid)
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const profileId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

      // Determine which profile to fetch: specific ID or current user
      const targetId = profileId && profileId !== 'profile' ? profileId : user.id;
      
      console.log('Fetching profile for:', targetId, 'requested by:', user.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url, gender, birth_date, relationship_status, interests, human_verified')
        .eq('id', targetId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'not_found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw profileError;
      }

      // Fetch dogs for this profile
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('id, name, breed, age_years, birthdate, temperament, size, avatar_url, vaccination, anecdote, zodiac_sign')
        .eq('owner_id', targetId);

      if (dogsError) {
        console.error('Error fetching dogs:', dogsError);
      }

      return new Response(JSON.stringify({
        profile: profileData,
        dogs: dogsData || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      // Update current user's profile only
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(body)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in profile function:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
