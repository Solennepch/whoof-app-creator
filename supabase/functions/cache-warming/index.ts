import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!redisUrl || !redisToken) {
      console.log('Cache warming skipped: Redis not configured');
      return new Response(
        JSON.stringify({ message: 'Redis not configured, skipping cache warming' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting cache warming...');

    // 1. Get most active users (based on recent activity)
    const { data: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (usersError) {
      console.error('Error fetching active users:', usersError);
    } else {
      console.log(`Found ${activeUsers?.length || 0} active users to warm cache for`);
    }

    // 2. Get published pro profiles
    const { data: proProfiles, error: proError } = await supabase
      .from('pro_profiles')
      .select('id, user_id, business_name')
      .eq('is_published', true)
      .order('views_count', { ascending: false })
      .limit(30);

    if (proError) {
      console.error('Error fetching pro profiles:', proError);
    } else {
      console.log(`Found ${proProfiles?.length || 0} pro profiles to warm cache for`);
    }

    let warmedCount = 0;

    // Warm cache for active users - profiles
    if (activeUsers) {
      for (const user of activeUsers) {
        try {
          // Fetch profile data
          const profileResponse = await fetch(
            `${supabaseUrl}/functions/v1/profile/${user.id}`,
            {
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();

            // Store in cache via cache edge function
            await fetch(`${supabaseUrl}/functions/v1/cache`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'set',
                key: `profile:${user.id}`,
                value: profileData,
                type: 'profile',
              }),
            });

            warmedCount++;
          }
        } catch (error) {
          console.error(`Error warming cache for user ${user.id}:`, error);
        }
      }
    }

    // Warm cache for pro profiles and services
    if (proProfiles) {
      for (const pro of proProfiles) {
        try {
          // Fetch pro profile
          const { data: proData } = await supabase
            .from('pro_profiles')
            .select('*')
            .eq('id', pro.id)
            .single();

          if (proData) {
            await fetch(`${supabaseUrl}/functions/v1/cache`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'set',
                key: `pro-profile:${pro.user_id}`,
                value: proData,
                type: 'profile',
              }),
            });

            warmedCount++;
          }

          // Fetch pro services
          const { data: services } = await supabase
            .from('pro_services')
            .select('*')
            .eq('pro_profile_id', pro.id)
            .eq('is_active', true);

          if (services) {
            await fetch(`${supabaseUrl}/functions/v1/cache`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'set',
                key: `pro-services:${pro.id}`,
                value: services,
                type: 'directory',
              }),
            });

            warmedCount++;
          }
        } catch (error) {
          console.error(`Error warming cache for pro ${pro.id}:`, error);
        }
      }
    }

    console.log(`Cache warming completed: ${warmedCount} items cached`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cache warmed successfully: ${warmedCount} items`,
        details: {
          users: activeUsers?.length || 0,
          pros: proProfiles?.length || 0,
          cached: warmedCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cache warming error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
