import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    logStep("Function started");

    // Check Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    logStep("Authorization header found");

    // Get current user from Supabase Auth
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (!userResponse.ok) {
      logStep("ERROR: Failed to authenticate user", { status: userResponse.status });
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const user = await userResponse.json();
    const userId = user.id;
    logStep("User authenticated", { userId });

    // Read profiles.premium
    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=premium`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    let isPremium = false;
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData && profileData.length > 0) {
        isPremium = profileData[0].premium === true;
        logStep("Profile premium status", { isPremium });
      }
    } else {
      logStep("WARNING: Failed to read profile", { status: profileResponse.status });
    }

    // Read pro_accounts.plan
    const proResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/pro_accounts?user_id=eq.${userId}&select=plan`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    let proPlan: string | null = null;
    if (proResponse.ok) {
      const proData = await proResponse.json();
      if (proData && proData.length > 0) {
        const plan = proData[0].plan;
        if (plan === 'pro_premium' || plan === 'pro_plus') {
          proPlan = plan;
        }
        logStep("Pro account plan", { proPlan });
      }
    } else {
      logStep("WARNING: Failed to read pro_account", { status: proResponse.status });
    }

    logStep("Check complete", { isPremium, proPlan });

    return new Response(
      JSON.stringify({ ok: true, isPremium, proPlan }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logStep("ERROR: Unhandled exception", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
