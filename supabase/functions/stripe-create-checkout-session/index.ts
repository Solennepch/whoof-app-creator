import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    // Parse request body
    const body = await req.json();
    const { lookupKey, priceId, successUrl, cancelUrl } = body;

    if (!lookupKey && !priceId) {
      logStep("ERROR: Missing price identifier");
      return new Response(
        JSON.stringify({ error: 'Either lookupKey or priceId is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    logStep("Request body parsed", { lookupKey, priceId, hasSuccessUrl: !!successUrl, hasCancelUrl: !!cancelUrl });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Determine the price ID to use
    let finalPriceId = priceId;

    if (lookupKey) {
      logStep("Looking up price by lookup_key", { lookupKey });
      
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        expand: ['data.product'],
        limit: 1,
      });

      if (prices.data.length === 0) {
        logStep("ERROR: Price not found for lookup_key", { lookupKey });
        return new Response(
          JSON.stringify({ error: `No price found for lookup key: ${lookupKey}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      finalPriceId = prices.data[0].id;
      logStep("Price found", { priceId: finalPriceId, product: prices.data[0].product });
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create during checkout");
    }

    // Get the origin for URLs
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:3000";
    
    // Build URLs
    const finalSuccessUrl = successUrl || `${origin}/pro/dashboard?success=true`;
    const finalCancelUrl = cancelUrl || `${origin}/pro/pricing?canceled=true`;

    logStep("Creating checkout session", { 
      priceId: finalPriceId, 
      successUrl: finalSuccessUrl, 
      cancelUrl: finalCancelUrl 
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    logStep("Checkout session created successfully", { sessionId: session.id });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
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
