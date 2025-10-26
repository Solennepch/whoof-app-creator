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

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Creating partnership for user:', user.id);

      // Get user's pro account
      const { data: proAccount, error: proError } = await supabase
        .from('pro_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (proError || !proAccount) {
        return new Response(JSON.stringify({ error: 'Pro account not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create partnership
      const { data, error } = await supabase
        .from('partnerships')
        .insert({
          pro_id: proAccount.id,
          title: body.title,
          offer: body.offer,
          start_date: body.start_date,
          end_date: body.end_date,
          is_active: body.is_active !== undefined ? body.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Created partnership:', data.id);

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Get partnerships for current user's pro account
      const { data: proAccount, error: proError } = await supabase
        .from('pro_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (proError || !proAccount) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('pro_id', proAccount.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in pro-partnership:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
