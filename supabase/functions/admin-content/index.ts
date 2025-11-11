import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HoroscopeData {
  zodiac_sign: string;
  week_start: string;
  week_end: string;
  horoscope_text: string;
  mood: string;
  is_active?: boolean;
}

interface UserBanData {
  user_id: string;
  ban_reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roles) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...data } = await req.json();

    console.log(`Admin action: ${action}`, { user_id: user.id });

    switch (action) {
      case 'create_horoscope': {
        const horoscopeData = data as HoroscopeData;
        
        const { data: horoscope, error } = await supabaseClient
          .from('astrodog_horoscopes')
          .insert({
            zodiac_sign: horoscopeData.zodiac_sign,
            week_start: horoscopeData.week_start,
            week_end: horoscopeData.week_end,
            horoscope_text: horoscopeData.horoscope_text,
            mood: horoscopeData.mood,
            created_by: user.id,
            is_active: horoscopeData.is_active || false,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating horoscope:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Horoscope created:', horoscope.id);

        return new Response(
          JSON.stringify({ data: horoscope }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_horoscope': {
        const { horoscope_id, ...updateData } = data;
        
        const { data: horoscope, error } = await supabaseClient
          .from('astrodog_horoscopes')
          .update(updateData)
          .eq('id', horoscope_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating horoscope:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Horoscope updated:', horoscope.id);

        return new Response(
          JSON.stringify({ data: horoscope }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'publish_horoscope': {
        const { horoscope_id } = data;
        
        const { data: horoscope, error } = await supabaseClient
          .from('astrodog_horoscopes')
          .update({
            is_active: true,
            published_at: new Date().toISOString(),
          })
          .eq('id', horoscope_id)
          .select()
          .single();

        if (error) {
          console.error('Error publishing horoscope:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Horoscope published:', horoscope.id);

        return new Response(
          JSON.stringify({ data: horoscope }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_horoscopes': {
        const { zodiac_sign, week_start } = data;
        
        let query = supabaseClient
          .from('astrodog_horoscopes')
          .select('*')
          .order('week_start', { ascending: false });

        if (zodiac_sign) {
          query = query.eq('zodiac_sign', zodiac_sign);
        }

        if (week_start) {
          query = query.eq('week_start', week_start);
        }

        const { data: horoscopes, error } = await query.limit(50);

        if (error) {
          console.error('Error fetching horoscopes:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ data: horoscopes }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ban_user': {
        const { user_id, ban_reason } = data as UserBanData;
        
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .update({
            is_banned: true,
            banned_at: new Date().toISOString(),
            ban_reason: ban_reason || 'Violation des conditions d\'utilisation',
          })
          .eq('id', user_id)
          .select()
          .single();

        if (error) {
          console.error('Error banning user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('User banned:', user_id);

        return new Response(
          JSON.stringify({ data: profile }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unban_user': {
        const { user_id } = data as UserBanData;
        
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .update({
            is_banned: false,
            banned_at: null,
            ban_reason: null,
          })
          .eq('id', user_id)
          .select()
          .single();

        if (error) {
          console.error('Error unbanning user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('User unbanned:', user_id);

        return new Response(
          JSON.stringify({ data: profile }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'auto_publish_weekly': {
        // Get current week's start and end dates
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Get all pending horoscopes for this week
        const { data: horoscopes, error: fetchError } = await supabaseClient
          .from('astrodog_horoscopes')
          .select('*')
          .eq('week_start', weekStartStr)
          .eq('is_active', false);

        if (fetchError) {
          console.error('Error fetching horoscopes for auto-publish:', fetchError);
          return new Response(
            JSON.stringify({ error: fetchError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Publish them
        const { data: published, error: publishError } = await supabaseClient
          .from('astrodog_horoscopes')
          .update({
            is_active: true,
            published_at: new Date().toISOString(),
          })
          .eq('week_start', weekStartStr)
          .eq('is_active', false)
          .select();

        if (publishError) {
          console.error('Error auto-publishing horoscopes:', publishError);
          return new Response(
            JSON.stringify({ error: publishError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Auto-published ${published?.length || 0} horoscopes for week ${weekStartStr}`);

        return new Response(
          JSON.stringify({ 
            data: { 
              published_count: published?.length || 0,
              week_start: weekStartStr 
            } 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in admin-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
