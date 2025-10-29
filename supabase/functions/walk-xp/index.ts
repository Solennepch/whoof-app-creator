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
      throw new Error('Unauthorized');
    }

    const { action, walk_id } = await req.json();

    if (!action || !walk_id) {
      throw new Error('Missing required fields: action, walk_id');
    }

    console.log(`Walk action: ${action} for walk ${walk_id} by user ${user.id}`);

    let xpPoints = 0;
    let xpType = '';

    switch (action) {
      case 'start':
        xpPoints = 10;
        xpType = 'walk_start';
        break;
      case 'complete':
        xpPoints = 20;
        xpType = 'walk_complete';
        break;
      case 'invite':
        xpPoints = 15;
        xpType = 'walk_invite';
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    // Award XP
    const { error: xpError } = await supabase.rpc('add_xp_event', {
      p_user_id: user.id,
      p_type: xpType,
      p_points: xpPoints,
      p_ref_id: walk_id,
      p_metadata: { action }
    });

    if (xpError) {
      console.error('Error adding XP:', xpError);
      throw xpError;
    }

    console.log(`Awarded ${xpPoints} XP to user ${user.id} for ${action}`);

    // Check and award badges
    const { error: badgeError } = await supabase.rpc('check_and_award_badges', {
      p_user_id: user.id
    });

    if (badgeError) {
      console.error('Error checking badges:', badgeError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        xp_awarded: xpPoints,
        message: `+${xpPoints} XP`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
