import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting daily missions reset...');

    // Get all active users
    const { data: activeUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1000);

    if (usersError) throw usersError;

    console.log(`Found ${activeUsers?.length || 0} users`);

    let assigned = 0;
    let errors = 0;

    // Assign new missions to each user
    for (const user of activeUsers || []) {
      try {
        const { error: assignError } = await supabaseClient.rpc('assign_daily_missions', {
          p_user_id: user.id,
          p_count: 3,
        });

        if (assignError) {
          console.error(`Error assigning missions to user ${user.id}:`, assignError);
          errors++;
        } else {
          assigned++;
        }
      } catch (error) {
        console.error(`Failed to assign missions to user ${user.id}:`, error);
        errors++;
      }
    }

    console.log(`Daily missions reset complete. Assigned: ${assigned}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        assigned,
        errors,
        totalUsers: activeUsers?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in reset-daily-missions:', error);

    return new Response(
      JSON.stringify({
        error: String(error instanceof Error ? error.message : error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
