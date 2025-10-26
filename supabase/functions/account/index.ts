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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'delete' && req.method === 'DELETE') {
      // Delete user account and all associated data
      // Profile, dogs, friendships, verifications will be cascade deleted
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Account deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'export' && req.method === 'GET') {
      // Export all user data
      const [profile, dogs, friendships, verifications] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('dogs').select('*').eq('owner_id', user.id),
        supabase.from('friendships').select('*').or(`a_user.eq.${user.id},b_user.eq.${user.id}`),
        supabase.from('verifications').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profile.data,
        dogs: dogs.data,
        friendships: friendships.data,
        verifications: verifications.data
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="whoof-data-${user.id}.json"`
        },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
