import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { userId, type, title, message, data } = await req.json();

    if (!userId || !type || !title || !message) {
      throw new Error('Missing required fields');
    }

    // Insert notification in database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || {},
        is_read: false,
      });

    if (notificationError) throw notificationError;

    // Get user's push subscriptions
    const { data: pushSubscriptions, error: pushError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (pushError) {
      console.error('Error fetching push subscriptions:', pushError);
    }

    // Send push notifications to all user's devices
    if (pushSubscriptions && pushSubscriptions.length > 0) {
      const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY') || '';
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';

      for (const sub of pushSubscriptions) {
        try {
          // In a real implementation, you would use web-push library
          // This is a simplified version
          console.log('Would send push notification to:', sub.endpoint);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
