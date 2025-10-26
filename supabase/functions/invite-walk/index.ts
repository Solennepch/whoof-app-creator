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

    const { to_user, message, proposed_time } = await req.json();

    if (!to_user) {
      throw new Error('Missing required field: to_user');
    }

    console.log(`User ${user.id} invited ${to_user} for a walk`);

    // Get sender's profile for the notification
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const senderName = senderProfile?.display_name || 'Un utilisateur';

    // Create a walk invitation record (you could create a walks table)
    // For now, we'll just log it and return success
    const invitation = {
      from_user: user.id,
      to_user,
      message: message || `${senderName} vous invite à une promenade !`,
      proposed_time: proposed_time || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Walk invitation:', invitation);

    // TODO: Store in a 'walk_invitations' table when it exists
    // TODO: Send push notification to recipient

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Invitation envoyée avec succès !",
        invitation
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
