import { supabase } from '@/integrations/supabase/client';

export const addXPToGuild = async (userId: string, xpAmount: number) => {
  try {
    // Get user's guild membership
    const { data: membership, error: memberError } = await supabase
      .from('guild_members')
      .select('guild_id, xp_contributed')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError || !membership) {
      return; // User not in a guild
    }

    // Update member's contributed XP
    const { error: updateError } = await supabase
      .from('guild_members')
      .update({
        xp_contributed: (membership.xp_contributed || 0) + xpAmount,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating guild XP:', updateError);
    }

    // The trigger will automatically update the guild's total_xp
  } catch (error) {
    console.error('Error in addXPToGuild:', error);
  }
};

export const checkGuildLevel = async (guildId: string) => {
  try {
    const { data: guild, error } = await supabase
      .from('guilds')
      .select('total_xp, level')
      .eq('id', guildId)
      .single();

    if (error || !guild) return;

    // Simple level calculation: 1000 XP per level
    const newLevel = Math.floor(guild.total_xp / 1000) + 1;

    if (newLevel > guild.level) {
      await supabase
        .from('guilds')
        .update({ level: newLevel })
        .eq('id', guildId);
    }
  } catch (error) {
    console.error('Error checking guild level:', error);
  }
};
