import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // GET /dog?owner=:id
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const ownerId = url.searchParams.get('owner');

      let endpoint = `${SUPABASE_URL}/rest/v1/dogs?select=*`;
      if (ownerId) {
        endpoint += `&owner_id=eq.${ownerId}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return new Response(
          JSON.stringify({ ok: false, error }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ ok: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // POST /dog
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.name || typeof body.name !== 'string') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Field "name" is required and must be a string' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!body.breed || typeof body.breed !== 'string') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Field "breed" is required and must be a string' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Extract valid fields
      const validFields = [
        'name',
        'breed',
        'birthdate',
        'temperament',
        'size',
        'vaccination',
        'avatar_url',
        'anecdote',
      ];

      const dogData: Record<string, any> = {};
      for (const field of validFields) {
        if (body[field] !== undefined) {
          dogData[field] = body[field];
        }
      }

      // Get user ID from auth token
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (!authResponse.ok) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Unauthorized' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const userData = await authResponse.json();
      dogData.owner_id = userData.id;

      // Insert dog
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/dogs`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(dogData),
      });

      if (!insertResponse.ok) {
        const error = await insertResponse.text();
        return new Response(
          JSON.stringify({ ok: false, error }),
          { 
            status: insertResponse.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await insertResponse.json();
      return new Response(
        JSON.stringify({ ok: true, data: data[0] || data }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
