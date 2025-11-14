import { supabase } from '@/integrations/supabase/client';

export type UserSegment = 
  | 'new_user'      // J+0 à J+7
  | 'active'        // Utilise régulièrement
  | 'inactive'      // 7+ jours sans activité
  | 'premium';      // Utilisateur premium

export interface UserSegmentData {
  segment: UserSegment;
  daysSinceSignup: number;
  daysSinceLastActivity: number;
  isPremium: boolean;
  activityScore: number;
}

export const getUserSegment = async (userId: string): Promise<UserSegmentData> => {
  // Récupérer les données du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const createdAt = new Date(profile.created_at || new Date());
  const now = new Date();
  const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Pour l'instant, on considère que personne n'est premium
  // TODO: Implémenter la vérification premium via Stripe
  const isPremium = false;

  // Récupérer la dernière activité (messages, swipes, balades)
  const [lastMessage, lastSwipe, lastWalk] = await Promise.all([
    supabase
      .from('direct_messages')
      .select('created_at')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    
    supabase
      .from('friendships')
      .select('created_at')
      .or(`a_user.eq.${userId},b_user.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    
    supabase
      .from('walks')
      .select('start_at')
      .eq('user_id', userId)
      .order('start_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const lastActivities = [
    lastMessage.data?.created_at,
    lastSwipe.data?.created_at,
    lastWalk.data?.start_at,
  ].filter(Boolean).map(d => new Date(d as string));

  const lastActivity = lastActivities.length > 0
    ? new Date(Math.max(...lastActivities.map(d => d.getTime())))
    : createdAt;

  const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  // Calculer le score d'activité (nombre d'actions dans les 7 derniers jours)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const [messagesCount, swipesCount, walksCount] = await Promise.all([
    supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString()),
    
    supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`a_user.eq.${userId},b_user.eq.${userId}`)
      .gte('created_at', sevenDaysAgo.toISOString()),
    
    supabase
      .from('walks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('start_at', sevenDaysAgo.toISOString()),
  ]);

  const activityScore = (messagesCount.count || 0) + (swipesCount.count || 0) + (walksCount.count || 0);

  // Déterminer le segment
  
  let segment: UserSegment;
  
  if (isPremium) {
    segment = 'premium';
  } else if (daysSinceSignup <= 7) {
    segment = 'new_user';
  } else if (daysSinceLastActivity >= 7) {
    segment = 'inactive';
  } else {
    segment = 'active';
  }

  return {
    segment,
    daysSinceSignup,
    daysSinceLastActivity,
    isPremium,
    activityScore,
  };
};

export const getMaxNotificationsPerWeek = (segment: UserSegment): number => {
  switch (segment) {
    case 'new_user':
      return 7; // 1 par jour max
    case 'active':
      return 5; // 3-5 par semaine
    case 'inactive':
      return 2; // 1-2 par semaine
    case 'premium':
      return 2; // 1-2 par semaine, personnalisées
    default:
      return 3;
  }
};

export const shouldReceiveNotificationCategory = (
  segment: UserSegment,
  category: string
): boolean => {
  // Nouvelles utilisateurs : onboarding, découverte
  if (segment === 'new_user') {
    return ['matching', 'walks', 'gamification'].includes(category);
  }

  // Utilisateurs actifs : tout sauf réactivation
  if (segment === 'active') {
    return category !== 'reactivation';
  }

  // Utilisateurs inactifs : focus réactivation + quelques autres
  if (segment === 'inactive') {
    return ['reactivation', 'matching', 'walks'].includes(category);
  }

  // Premium : stats, exclusivités
  if (segment === 'premium') {
    return ['gamification', 'partners', 'matching'].includes(category);
  }

  return true;
};
