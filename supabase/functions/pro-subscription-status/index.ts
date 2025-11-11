import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRO-SUBSCRIPTION-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    logStep('Authenticating user with token');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep('No customer found, unsubscribed');
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        product_id: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep('Found Stripe customer', { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let plan = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      
      // Map product ID to plan name
      const planMapping: { [key: string]: string } = {
        'prod_TP3jx5kRrH3awC': 'basic',
        'prod_TP3jk0TxBUDitR': 'premium',
        'prod_TP42AgOKpiRoaF': 'enterprise',
      };
      plan = planMapping[productId] || 'basic';
      
      logStep('Active subscription found', { subscriptionId: subscription.id, plan, endDate: subscriptionEnd });

      // Update pro_profiles with subscription info
      const { error: updateError } = await supabaseClient
        .from('pro_profiles')
        .update({ 
          plan: plan,
        })
        .eq('user_id', user.id);

      if (updateError) {
        logStep('WARNING: Could not update pro_profiles', { error: updateError.message });
      } else {
        logStep('Updated pro_profiles with subscription info');
      }
    } else {
      logStep('No active subscription found');
      
      // Clear plan from pro_profiles
      await supabaseClient
        .from('pro_profiles')
        .update({ plan: null })
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan: plan,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
