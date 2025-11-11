import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Verify Stripe signature using native crypto
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse signature header: t=timestamp,v1=signature
    const parts = signature.split(',');
    let timestamp = '';
    let sig = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') sig = value;
    }

    if (!timestamp || !sig) {
      logStep('ERROR: Invalid signature format');
      return false;
    }

    // Construct signed payload: timestamp.payload
    const signedPayload = `${timestamp}.${payload}`;

    // Create HMAC SHA256 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex string
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures
    const isValid = computedSignature === sig;
    logStep('Signature verification', { isValid });
    return isValid;

  } catch (error) {
    logStep('ERROR: Signature verification failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    logStep('Webhook received');

    // Get signature from header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      logStep('ERROR: No signature header');
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body
    const body = await req.text();
    
    // Verify signature
    if (!STRIPE_WEBHOOK_SECRET) {
      logStep('ERROR: STRIPE_WEBHOOK_SECRET not set');
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      logStep('ERROR: Invalid signature');
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse event
    const event = JSON.parse(body);
    logStep('Event parsed', { type: event.type });

    // Handle relevant events
    const relevantEvents = [
      'checkout.session.completed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'payment_intent.succeeded'
    ];

    if (!relevantEvents.includes(event.type)) {
      logStep('Event not relevant, skipping');
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract metadata
    let metadata: any = {};
    
    if (event.type === 'checkout.session.completed') {
      metadata = event.data.object.metadata || {};
    } else if (event.type.startsWith('customer.subscription.')) {
      metadata = event.data.object.metadata || {};
    } else if (event.type === 'payment_intent.succeeded') {
      metadata = event.data.object.metadata || {};
    }

    const type = metadata.type; // 'user', 'pro', or 'booking'
    
    // Handle booking payments
    if (type === 'booking') {
      const bookingId = metadata.booking_id;
      const amount = parseFloat(metadata.amount || '0');
      const proUserId = metadata.pro_user_id;
      const userId = metadata.user_id;
      const serviceId = metadata.service_id;

      logStep('Processing booking payment', { bookingId, amount, proUserId });

      // Create transaction record
      const transactionResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/pro_transactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            pro_profile_id: proUserId,
            booking_id: bookingId,
            user_id: userId,
            amount: amount,
            currency: 'EUR',
            type: 'payment',
            status: 'completed',
            payment_method: 'stripe',
            stripe_payment_id: event.data.object.id,
            metadata: { service_id: serviceId }
          }),
        }
      );

      if (transactionResponse.ok) {
        logStep('Transaction created', { bookingId });
        
        // Update booking status to confirmed
        const bookingResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/pro_bookings?id=eq.${bookingId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ status: 'confirmed' }),
          }
        );

        if (bookingResponse.ok) {
          logStep('Booking confirmed', { bookingId });
        }
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = metadata.user_id;

    if (!type || !userId) {
      logStep('WARNING: Missing metadata', { type, userId });
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logStep('Processing event', { type, userId, eventType: event.type });

    // Update Supabase based on type
    if (type === 'user') {
      // Update profiles.premium
      const isPremium = event.type !== 'customer.subscription.deleted';
      
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ premium: isPremium }),
        }
      );

      if (updateResponse.ok) {
        logStep('Profile updated', { userId, premium: isPremium });
      } else {
        logStep('WARNING: Profile update failed', { 
          status: updateResponse.status, 
          error: await updateResponse.text() 
        });
      }

    } else if (type === 'pro') {
      // Update pro_accounts.plan
      const plan = event.type === 'customer.subscription.deleted' ? 'free' : 'pro_premium';
      
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/pro_accounts?user_id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ plan }),
        }
      );

      if (updateResponse.ok) {
        logStep('Pro account updated', { userId, plan });
      } else {
        logStep('WARNING: Pro account update failed', { 
          status: updateResponse.status, 
          error: await updateResponse.text() 
        });
      }
    }

    // Always return 200 OK
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR: Unhandled exception', { message: errorMessage });
    
    // Still return 200 to prevent Stripe retries on parsing errors
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
