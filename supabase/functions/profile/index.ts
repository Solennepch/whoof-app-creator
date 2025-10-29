import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate display name from email
function generateDisplayName(email: string): string {
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1);
}

// Helper to fetch profile via REST API with service role
async function fetchProfileViaRest(userId: string, serviceRoleKey: string, supabaseUrl: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
    {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  
  const profiles = await response.json();
  return profiles.length > 0 ? profiles[0] : null;
}

// Helper to create profile via REST API with service role
async function createProfileViaRest(userId: string, email: string, serviceRoleKey: string, supabaseUrl: string) {
  const displayName = generateDisplayName(email);
  
  const newProfile = {
    id: userId,
    display_name: displayName,
    bio: '',
    avatar_url: null,
    privacy: { moodVisibility: 'friends' },
    premium: false,
    human_verified: false,
  };

  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles`,
    {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newProfile),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create profile: ${response.status} - ${error}`);
  }

  const created = await response.json();
  return Array.isArray(created) ? created[0] : created;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Extract profile ID from URL path
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const profileId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

      // Determine which profile to fetch: specific ID or current user
      const targetId = profileId && profileId !== 'profile' ? profileId : user.id;
      const isCurrentUser = targetId === user.id;
      
      console.log('Fetching profile for:', targetId, 'requested by:', user.id, 'isCurrentUser:', isCurrentUser);

      let profileData = null;

      // For current user, use service role to enable auto-creation
      if (isCurrentUser) {
        profileData = await fetchProfileViaRest(targetId, supabaseServiceRoleKey, supabaseUrl);
        
        // Auto-create profile if not found
        if (!profileData) {
          console.log('Profile not found, creating new profile for user:', targetId);
          profileData = await createProfileViaRest(targetId, user.email || '', supabaseServiceRoleKey, supabaseUrl);
        }
      } else {
        // For other users, use regular client (respects RLS)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, bio, avatar_url, gender, birth_date, relationship_status, interests, human_verified')
          .eq('id', targetId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(JSON.stringify({ ok: false, error: 'not_found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          throw error;
        }
        
        profileData = data;
      }

      // Fetch dogs for this profile
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('id, name, breed, age_years, birthdate, temperament, size, avatar_url, vaccination, anecdote, zodiac_sign')
        .eq('owner_id', targetId);

      if (dogsError) {
        console.error('Error fetching dogs:', dogsError);
      }

      return new Response(JSON.stringify({
        ok: true,
        profile: profileData,
        dogs: dogsData || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      // Update current user's profile only
      const body = await req.json();
      
      // Filter out fields that shouldn't be updated by client
      const allowedFields = ['display_name', 'bio', 'avatar_url', 'gender', 'birth_date', 'relationship_status', 'interests'];
      const updates: any = {};
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Check if profile is complete (has display_name and bio)
      const isComplete = data.display_name && data.bio && data.bio.length > 0;
      
      if (isComplete) {
        // Award XP for profile completion
        const { error: xpError } = await supabase.rpc('add_xp_event', {
          p_user_id: user.id,
          p_type: 'profile_complete',
          p_points: 50,
          p_ref_id: user.id,
          p_metadata: {}
        });

        if (xpError) {
          console.error('Error adding XP for profile completion:', xpError);
        } else {
          console.log(`Awarded 50 XP to user ${user.id} for completing profile`);
        }

        // Check and award badges
        const { error: badgeError } = await supabase.rpc('check_and_award_badges', {
          p_user_id: user.id
        });

        if (badgeError) {
          console.error('Error checking badges:', badgeError);
        }
      }

      return new Response(JSON.stringify({ ok: true, profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in profile function:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
