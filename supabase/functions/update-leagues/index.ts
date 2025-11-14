import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting league updates...');

    // Get current active season
    const { data: currentSeason, error: seasonError } = await supabaseClient
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();

    if (seasonError) throw seasonError;
    if (!currentSeason) {
      console.log('No active season found');
      return new Response(
        JSON.stringify({ success: true, message: 'No active season' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get weekly leaderboard for current season
    const { data: leaderboard, error: leaderboardError } = await supabaseClient
      .from('leaderboard_weekly')
      .select('user_id, weekly_xp, rank')
      .order('rank', { ascending: true });

    if (leaderboardError) throw leaderboardError;

    // Get all leagues
    const { data: leagues, error: leaguesError } = await supabaseClient
      .from('leagues')
      .select('*')
      .order('tier', { ascending: true });

    if (leaguesError) throw leaguesError;

    console.log(`Processing ${leaderboard?.length || 0} players across ${leagues?.length || 0} leagues`);

    let updated = 0;
    let promotions = 0;
    let relegations = 0;

    // Assign leagues based on current rank
    for (const player of leaderboard || []) {
      // Find appropriate league
      const league = leagues?.find(
        (l) => player.rank >= l.min_rank && player.rank <= l.max_rank
      );

      if (!league) continue;

      // Get user's current league
      const { data: currentLeague, error: currentError } = await supabaseClient
        .from('user_leagues')
        .select('league_id, last_league_id, promotion_count, relegation_count')
        .eq('user_id', player.user_id)
        .eq('season_id', currentSeason.id)
        .maybeSingle();

      if (currentError && currentError.code !== 'PGRST116') {
        console.error(`Error fetching league for user ${player.user_id}:`, currentError);
        continue;
      }

      // Determine if promotion or relegation
      let promotionCount = 0;
      let relegationCount = 0;
      const lastLeagueId = currentLeague?.league_id || null;

      if (lastLeagueId && lastLeagueId !== league.id) {
        const lastLeague = leagues?.find((l) => l.id === lastLeagueId);
        if (lastLeague) {
          if (league.tier < lastLeague.tier) {
            promotions++;
            promotionCount = 1;
          } else if (league.tier > lastLeague.tier) {
            relegations++;
            relegationCount = 1;
          }
        }
      }

      // Upsert user league
      const { error: upsertError } = await supabaseClient
        .from('user_leagues')
        .upsert({
          user_id: player.user_id,
          season_id: currentSeason.id,
          league_id: league.id,
          current_rank: player.rank,
          monthly_xp: player.weekly_xp,
          last_league_id: lastLeagueId,
          promotion_count: ((currentLeague?.promotion_count as number) || 0) + promotionCount,
          relegation_count: ((currentLeague?.relegation_count as number) || 0) + relegationCount,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error(`Error updating league for user ${player.user_id}:`, upsertError);
      } else {
        updated++;
      }
    }

    console.log(
      `League updates complete. Updated: ${updated}, Promotions: ${promotions}, Relegations: ${relegations}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        promotions,
        relegations,
        totalPlayers: leaderboard?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-leagues:', error);

    return new Response(
      JSON.stringify({
        error: String(error instanceof Error ? error.message : error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
