import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { action } = await req.json();
    
    // For development: Allow anyone to create test accounts
    // In production, you would want to verify admin access here

    if (action === 'create') {
      // Test accounts to create
      const testAccounts = [
        {
          email: 'test@whoof.app',
          password: 'Test123!',
          role: 'user',
          display_name: 'Solenne Martin',
          isPro: true, // This user has BOTH personal and pro profiles
          proBusinessName: 'Salon Canin Paris'
        },
        {
          email: 'test.admin@whoof.app',
          password: 'TestAdmin123!',
          role: 'admin',
          display_name: 'Admin Whoof',
          isPro: false
        }
      ];

      const results = [];

      for (const account of testAccounts) {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('display_name', account.display_name)
          .maybeSingle();

        if (existingUser) {
          results.push({
            email: account.email,
            status: 'exists',
            message: 'User already exists'
          });
          continue;
        }

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            display_name: account.display_name
          }
        });

        if (createError || !newUser.user) {
          console.error('Error creating user:', createError);
          results.push({
            email: account.email,
            status: 'error',
            error: createError?.message
          });
          continue;
        }

        // Create profile
        await supabaseAdmin
          .from('profiles')
          .insert({
            id: newUser.user.id,
            display_name: account.display_name,
            city: 'Paris'
          });

        // Add role
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: account.role
          });

        // If pro, create pro profile
        if (account.isPro) {
          await supabaseAdmin
            .from('pro_profiles')
            .insert({
              user_id: newUser.user.id,
              business_name: account.proBusinessName || 'Test Pro Business',
              activity: 'toiletteur',
              email: account.email,
              phone: '0612345678',
              city: 'Paris',
              description: 'Salon de toilettage professionnel situé au cœur de Paris',
              is_published: true,
              verified: true
            });
        }

        results.push({
          email: account.email,
          status: 'created',
          userId: newUser.user.id
        });
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list') {
      // List all test accounts
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, display_name')
        .or('display_name.eq.Solenne Martin,display_name.eq.Admin Whoof');

      const accountsWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          const { data: proProfile } = await supabaseAdmin
            .from('pro_profiles')
            .select('id')
            .eq('user_id', profile.id)
            .maybeSingle();

          return {
            id: profile.id,
            displayName: profile.display_name,
            roles: roles?.map(r => r.role) || [],
            isPro: !!proProfile
          };
        })
      );

      return new Response(JSON.stringify({ accounts: accountsWithRoles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});