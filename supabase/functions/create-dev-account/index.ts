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

    // Create complete profile with all features
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        display_name: '👑 Dev Master',
        bio: 'Compte développeur avec accès complet à toutes les fonctionnalités',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devmaster',
        city: 'Paris',
        is_premium: true,
        lat: 48.8566,
        lng: 2.3522,
        radius_km: 50,
        onboarding_completed: true,
      }, { onConflict: 'id' });

    console.log('Profile created:', { profileError });

    // Assign pro role for access to pro features
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'pro' }, { onConflict: 'user_id,role' });

    console.log('Role assigned:', { roleError });

    // Create a complete dog profile for testing all dog-related features
    const { error: dogError } = await supabaseAdmin
      .from('dogs')
      .upsert({
        owner_id: userId,
        name: 'Rex Dev',
        breed: 'Golden Retriever',
        age_years: 3,
        size: 'large',
        temperament: 'friendly',
        birthdate: '2021-01-01',
        zodiac_sign: 'capricorn',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rexdev',
        vaccinations: ['rabies', 'dhpp'],
        anecdote: 'Chien de test super sympa qui adore les balades!',
      }, { onConflict: 'owner_id' });

    console.log('Dog created:', { dogError });

    // Create complete pro profile for testing all pro features
    const { error: proError } = await supabaseAdmin
      .from('pro_profiles')
      .upsert({
        user_id: userId,
        business_name: '👑 Dev Business Pro',
        description: 'Entreprise de test avec accès complet aux fonctionnalités professionnelles',
        activity: 'veterinaire',
        is_published: true,
        verified: true,
        city: 'Paris',
        lat: 48.8566,
        lng: 2.3522,
        radius_km: 50,
        tags: ['dev', 'veterinaire', 'urgences', 'consultations'],
        email: email,
        phone: '+33 1 23 45 67 89',
        website: 'https://dev.whoof.app',
        logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=devbusiness',
      }, { onConflict: 'user_id' });

    console.log('Pro profile created:', { proError });

    // Create some test data for better experience
    // Add a pro service
    if (!proError) {
      const { data: proProfile } = await supabaseAdmin
        .from('pro_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (proProfile) {
        await supabaseAdmin
          .from('pro_services')
          .upsert({
            pro_profile_id: proProfile.id,
            name: 'Consultation générale',
            description: 'Service de test pour le compte dev',
            price: 50,
            duration: 30,
            is_active: true,
          }, { onConflict: 'pro_profile_id,name' });
      }
    }

    console.log('Dev account fully configured:', { userId, profileError, roleError, dogError, proError });

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email,
          password,
          userId,
        },
        features: {
          userAccess: true,
          proAccess: true,
          debugAccess: true,
          premiumAccess: true,
          dogProfile: true,
          proProfile: true,
        },
        message: '✅ Compte Dev Master créé avec accès COMPLET à toutes les fonctionnalités',
        instructions: 'Vous pouvez maintenant accéder à toutes les pages : utilisateur, pro, et debug'
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
