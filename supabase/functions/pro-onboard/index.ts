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

    console.log('Pro onboarding request from user:', user.id);

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await req.json();
      
      // Check if user has pro role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'pro')
        .single();

      if (!roleData) {
        // Grant pro role if not exists
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'pro' });
        
        if (roleError) {
          console.error('Error granting pro role:', roleError);
        }
      }

      // Check if pro account exists
      const { data: existingAccount } = await supabase
        .from('pro_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingAccount) {
        // Update existing account
        const { data, error } = await supabase
          .from('pro_accounts')
          .update(body)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        console.log('Updated pro account:', result.id);
      } else {
        // Create new account
        const { data, error } = await supabase
          .from('pro_accounts')
          .insert({ ...body, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        result = data;
        console.log('Created new pro account:', result.id);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in pro-onboard:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
