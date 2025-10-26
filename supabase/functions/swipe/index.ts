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

    const { action, to_user } = await req.json();

    if (!action || !to_user) {
      throw new Error('Missing required fields: action, to_user');
    }

    if (!['like', 'pass'].includes(action)) {
      throw new Error('Invalid action. Must be "like" or "pass"');
    }

    console.log(`User ${user.id} ${action}d user ${to_user}`);

    // Insert the swipe record
    const { data: swipe, error: swipeError } = await supabase
      .from('friendships')
      .insert({
        a_user: user.id,
        b_user: to_user,
        status: action === 'like' ? 'pending' : 'passed'
      })
      .select()
      .single();

    if (swipeError) {
      console.error('Error inserting swipe:', swipeError);
      throw swipeError;
    }

    // Check for mutual like (match)
    let isMatch = false;
    if (action === 'like') {
      const { data: reciprocalSwipe } = await supabase
        .from('friendships')
        .select('*')
        .eq('a_user', to_user)
        .eq('b_user', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (reciprocalSwipe) {
        isMatch = true;
        
        // Update both records to 'matched'
        await supabase
          .from('friendships')
          .update({ status: 'matched' })
          .eq('id', swipe.id);

        await supabase
          .from('friendships')
          .update({ status: 'matched' })
          .eq('id', reciprocalSwipe.id);

        console.log(`Match! Between ${user.id} and ${to_user}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        match: isMatch,
        message: isMatch ? "C'est un match ! 🎉" : `${action === 'like' ? 'Like envoyé' : 'Profil passé'}` 
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
