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

    // Account 1: Premium User (Particulier)
    const premiumUserEmail = 'premium.user@whoof.app';
    const premiumUserPassword = 'PremiumUser2025!';
    
    console.log('Creating premium user account...');
    const { data: premiumUserData, error: premiumUserError } = await supabaseAdmin.auth.admin.createUser({
      email: premiumUserEmail,
      password: premiumUserPassword,
      email_confirm: true,
      user_metadata: {
        display_name: '⭐ Emma Martin (Premium)',
        is_test_account: true,
      }
    });

    let premiumUserId = premiumUserData?.user?.id;

    if (premiumUserError && premiumUserError.message.includes('already registered')) {
      console.log('Premium user already exists, fetching...');
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData.users.find(u => u.email === premiumUserEmail);
      if (existingUser) {
        premiumUserId = existingUser.id;
      }
    } else if (premiumUserError) {
      throw premiumUserError;
    }

    if (!premiumUserId) {
      throw new Error('Failed to create/find premium user');
    }

    // Create premium profile
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: premiumUserId,
        display_name: '⭐ Emma Martin',
        bio: 'Utilisatrice premium - Compte de test',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emmamartin',
        city: 'Lyon',
        premium: true, // IMPORTANT: Set premium status
        home_geom: `POINT(4.8357 45.7640)`,
        onboarding_completed: true,
      }, { onConflict: 'id' });

    console.log('Premium user profile created');

    // Create dog for premium user
    await supabaseAdmin
      .from('dogs')
      .upsert({
        owner_id: premiumUserId,
        name: 'Luna',
        breed: 'Border Collie',
        age_years: 2,
        size: 'moyen',
        temperament: 'énergique',
        birthdate: '2022-06-15',
        zodiac_sign: 'gemini',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=luna',
        vaccinations: ['rabies', 'dhpp'],
        anecdote: 'Chienne très intelligente qui adore apprendre de nouveaux tours!',
      }, { onConflict: 'owner_id' });

    console.log('Premium user dog created');

    // Account 2: Premium Pro
    const premiumProEmail = 'premium.pro@whoof.app';
    const premiumProPassword = 'PremiumPro2025!';
    
    console.log('Creating premium pro account...');
    const { data: premiumProData, error: premiumProError } = await supabaseAdmin.auth.admin.createUser({
      email: premiumProEmail,
      password: premiumProPassword,
      email_confirm: true,
      user_metadata: {
        display_name: '💼 Dr. Sophie Bernard (Pro Premium)',
        is_test_account: true,
      }
    });

    let premiumProId = premiumProData?.user?.id;

    if (premiumProError && premiumProError.message.includes('already registered')) {
      console.log('Premium pro already exists, fetching...');
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData.users.find(u => u.email === premiumProEmail);
      if (existingUser) {
        premiumProId = existingUser.id;
      }
    } else if (premiumProError) {
      throw premiumProError;
    }

    if (!premiumProId) {
      throw new Error('Failed to create/find premium pro');
    }

    // Create profile
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: premiumProId,
        display_name: '💼 Dr. Sophie Bernard',
        bio: 'Vétérinaire premium - Compte de test',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophiebernard',
        city: 'Marseille',
        home_geom: `POINT(5.3698 43.2965)`,
        onboarding_completed: true,
      }, { onConflict: 'id' });

    console.log('Premium pro profile created');

    // Create pro account with premium plan
    await supabaseAdmin
      .from('pro_accounts')
      .upsert({
        user_id: premiumProId,
        business_name: '🌟 Clinique Vétérinaire Premium',
        category: 'veterinaire',
        description: 'Clinique vétérinaire avec abonnement premium - Compte de test',
        plan: 'pro_premium', // IMPORTANT: Premium plan
        status: 'active',
        contact_public: true,
        email: premiumProEmail,
        phone: '06 12 34 56 78',
        address: '15 Avenue du Prado, 13008 Marseille',
        geo: `POINT(5.3698 43.2965)`,
        logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=cliniquepremium',
      }, { onConflict: 'user_id' });

    console.log('Premium pro account created');

    // Create pro profile
    await supabaseAdmin
      .from('pro_profiles')
      .upsert({
        user_id: premiumProId,
        business_name: '🌟 Clinique Vétérinaire Premium',
        activity: 'veterinaire',
        description: 'Clinique vétérinaire moderne avec équipement de pointe. Spécialiste en médecine générale et chirurgie.',
        is_published: true,
        verified: true,
        city: 'Marseille',
        lat: 43.2965,
        lng: 5.3698,
        radius_km: 30,
        email: premiumProEmail,
        phone: '06 12 34 56 78',
        website: 'https://clinique-premium.fr',
        tags: ['urgences', 'chirurgie', 'vaccinations'],
        logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=cliniquepremium',
      }, { onConflict: 'user_id' });

    console.log('Premium pro profile created');

    // Add some services for the pro
    await supabaseAdmin
      .from('pro_services')
      .insert([
        {
          pro_profile_id: premiumProId,
          name: 'Consultation vétérinaire',
          description: 'Consultation complète de votre animal',
          price: 50,
          duration: '30min',
          is_active: true,
        },
        {
          pro_profile_id: premiumProId,
          name: 'Vaccination complète',
          description: 'Protocole de vaccination complet',
          price: 80,
          duration: '45min',
          is_active: true,
        },
      ]);

    console.log('Pro services created');

    return new Response(
      JSON.stringify({
        success: true,
        accounts: [
          {
            email: premiumUserEmail,
            password: premiumUserPassword,
            type: 'premium_user',
            displayName: '⭐ Emma Martin (Premium)'
          },
          {
            email: premiumProEmail,
            password: premiumProPassword,
            type: 'premium_pro',
            displayName: '💼 Dr. Sophie Bernard (Pro Premium)'
          }
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error creating premium accounts:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
