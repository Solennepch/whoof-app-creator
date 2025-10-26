import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify Stripe secret key is configured
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_RESTRICTED_KEY");
    if (!stripeKey) {
      logStep("ERROR: Missing Stripe key");
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logStep("ERROR: Invalid user", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let isPremium = false;
    let proPlan: string | null = null;

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // List active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        expand: ['data.items.data.price'],
        limit: 10,
      });

      logStep("Found subscriptions", { count: subscriptions.data.length });

      // Check each subscription
      for (const subscription of subscriptions.data) {
        for (const item of subscription.items.data) {
          const price = item.price;
          const lookupKey = (price as any).lookup_key || '';
          
          logStep("Checking price", { lookupKey, priceId: price.id });

          const lookupKeyLower = lookupKey.toLowerCase();
          
          if (lookupKeyLower.includes('premium') && !lookupKeyLower.includes('pro')) {
            isPremium = true;
            logStep("Found premium subscription", { lookupKey });
          }
          
          if (lookupKeyLower.includes('pro')) {
            proPlan = 'pro_premium';
            logStep("Found pro subscription", { lookupKey });
          }
        }
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Update profiles.premium
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        premium: isPremium,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      logStep("ERROR: Failed to update profile", { error: profileError.message });
    } else {
      logStep("Profile updated", { userId: user.id, premium: isPremium });
    }

    // Update pro_accounts.plan if applicable
    if (proPlan) {
      const { error: proError } = await supabaseClient
        .from('pro_accounts')
        .update({
          plan: proPlan,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (proError) {
        logStep("ERROR: Failed to update pro_account", { error: proError.message });
      } else {
        logStep("Pro account updated", { userId: user.id, plan: proPlan });
      }
    } else {
      // Reset pro plan if no active pro subscription
      const { error: proError } = await supabaseClient
        .from('pro_accounts')
        .update({
          plan: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (proError && proError.code !== 'PGRST116') { // Ignore "no rows" error
        logStep("ERROR: Failed to reset pro_account", { error: proError.message });
      }
    }

    logStep("Check complete", { isPremium, proPlan });

    return new Response(
      JSON.stringify({ isPremium, proPlan }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Unhandled exception", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
