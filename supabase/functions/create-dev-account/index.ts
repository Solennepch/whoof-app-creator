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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create or get dev account
    const email = 'dev@whoof.app';
    const password = 'DevMaster2025!';
    
    // Try to create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: '👑 Dev Master',
        is_dev_account: true,
      }
    });

    let userId = authData?.user?.id;

    // If user exists, get their ID
    if (authError?.message.includes('already registered')) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      userId = existingUser?.id;
    }

    if (!userId) throw new Error('Failed to create/find dev user');

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        display_name: '👑 Dev Master',
        bio: 'Compte développeur avec accès complet',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devmaster',
        city: 'Dev City',
        is_premium: true,
      }, { onConflict: 'id' });

    // Assign pro role only (admin/moderator removed)
    await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'pro' }, { onConflict: 'user_id,role' });

    // Create a dog profile for testing
    await supabaseAdmin
      .from('dogs')
      .upsert({
        owner_id: userId,
        name: 'Rex Dev',
        breed: 'Golden Retriever',
        age_years: 3,
        size: 'large',
        temperament: 'friendly',
        birthdate: '2021-01-01',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rexdev',
      }, { onConflict: 'owner_id' });

    // Create pro profile
    const { error: proError } = await supabaseAdmin
      .from('pro_profiles')
      .upsert({
        user_id: userId,
        business_name: 'Dev Business',
        description: 'Compte pro développeur avec accès complet',
        activity: 'veterinaire',
        is_published: true,
        verified: true,
        city: 'Dev City',
        tags: ['dev', 'all-access'],
      }, { onConflict: 'user_id' });

    console.log('Dev account created/updated:', { userId, profileError, proError });

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email,
          password,
          userId,
        },
        roles: ['pro'],
        message: 'Compte dev créé avec accès utilisateur + pro complet'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
