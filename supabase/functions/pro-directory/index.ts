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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const km = Math.min(parseFloat(url.searchParams.get('km') || '25'), 25); // Max 25km
    const category = url.searchParams.get('category');

    console.log('Directory search:', { lat, lng, km, category });

    // Build query
    let query = supabase
      .from('pro_accounts')
      .select('*')
      .eq('status', 'approved');

    if (category) {
      query = query.eq('category', category);
    }

    // Filter by distance if lat/lng provided
    if (lat !== 0 && lng !== 0) {
      // Use PostGIS to filter by distance
      // ST_DWithin uses meters, so km * 1000
      const { data, error } = await supabase.rpc('find_nearby_pros', {
        user_lat: lat,
        user_lng: lng,
        radius_km: km,
        filter_category: category
      });

      if (error) {
        console.error('RPC error, falling back to simple query:', error);
        // Fallback to simple query without distance
        const { data: fallbackData, error: fallbackError } = await query.limit(50);
        if (fallbackError) throw fallbackError;
        
        return new Response(JSON.stringify(fallbackData || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No location filter, just return all approved pros
    const { data, error } = await query.limit(50);
    if (error) throw error;

    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pro-directory:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
