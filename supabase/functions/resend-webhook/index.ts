import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Resend webhook received:', payload);

    // Extract event type and data
    const { type, data } = payload;
    
    if (!type || !data) {
      throw new Error('Invalid webhook payload');
    }

    // Find the notification log by email_id from Resend
    const { data: log, error: logError } = await supabaseClient
      .from('notification_logs')
      .select('*')
      .eq('webhook_id', data.email_id)
      .single();

    if (logError) {
      console.error('Log not found for webhook:', data.email_id);
      // Return 200 to prevent Resend from retrying
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Update notification log based on event type
    const updates: any = {};
    
    switch (type) {
      case 'email.sent':
        updates.status = 'sent';
        updates.sent_at = new Date().toISOString();
        break;
        
      case 'email.delivered':
        updates.status = 'delivered';
        updates.delivered_at = new Date().toISOString();
        break;
        
      case 'email.delivery_delayed':
        updates.status = 'delayed';
        break;
        
      case 'email.complained':
        updates.status = 'complained';
        break;
        
      case 'email.bounced':
        updates.status = 'failed';
        updates.error_message = data.bounce_type || 'Email bounced';
        break;
        
      case 'email.opened':
        updates.status = 'opened';
        updates.opened_at = new Date().toISOString();
        break;
        
      case 'email.clicked':
        updates.clicked_at = new Date().toISOString();
        break;
        
      default:
        console.log('Unknown event type:', type);
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseClient
        .from('notification_logs')
        .update(updates)
        .eq('id', log.id);

      if (updateError) {
        console.error('Error updating log:', updateError);
      }

      // Update A/B test results if variant_id exists
      if (log.variant_id) {
        const { data: testResult } = await supabaseClient
          .from('ab_test_results')
          .select('*')
          .eq('notification_log_id', log.id)
          .single();

        if (testResult) {
          const resultUpdates: any = {};
          
          if (type === 'email.sent') resultUpdates.sent_count = (testResult.sent_count || 0) + 1;
          if (type === 'email.delivered') resultUpdates.delivered_count = (testResult.delivered_count || 0) + 1;
          if (type === 'email.opened') resultUpdates.opened_count = (testResult.opened_count || 0) + 1;
          if (type === 'email.clicked') resultUpdates.clicked_count = (testResult.clicked_count || 0) + 1;

          if (Object.keys(resultUpdates).length > 0) {
            await supabaseClient
              .from('ab_test_results')
              .update(resultUpdates)
              .eq('id', testResult.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, updated: Object.keys(updates).length > 0 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to prevent Resend from retrying
      }
    );
  }
});
