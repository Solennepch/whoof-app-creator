import { supabase } from '@/integrations/supabase/client';

const NOTIFICATION_LIMIT_PER_DAY = 1;
const NOTIFICATION_LIMIT_PER_WEEK = 7;

export interface NotificationThrottle {
  canSend: boolean;
  reason?: string;
  nextAvailableTime?: Date;
}

export const checkNotificationThrottle = async (
  userId: string
): Promise<NotificationThrottle> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Vérifier les notifications envoyées aujourd'hui
  const { count: todayCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString());

  if (todayCount && todayCount >= NOTIFICATION_LIMIT_PER_DAY) {
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      canSend: false,
      reason: 'Limite quotidienne atteinte',
      nextAvailableTime: tomorrow,
    };
  }

  // Vérifier les notifications envoyées cette semaine
  const { count: weekCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString());

  if (weekCount && weekCount >= NOTIFICATION_LIMIT_PER_WEEK) {
    return {
      canSend: false,
      reason: 'Limite hebdomadaire atteinte',
    };
  }

  // Vérifier l'heure (pas après 21h)
  const currentHour = now.getHours();
  if (currentHour >= 21 || currentHour < 8) {
    const nextMorning = new Date(todayStart);
    nextMorning.setDate(nextMorning.getDate() + (currentHour >= 21 ? 1 : 0));
    nextMorning.setHours(8, 0, 0, 0);
    
    return {
      canSend: false,
      reason: 'Heure non autorisée (8h-21h uniquement)',
      nextAvailableTime: nextMorning,
    };
  }

  return { canSend: true };
};

export const recordNotificationSent = async (
  userId: string,
  templateId: string,
  category: string
): Promise<void> => {
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'system',
      title: templateId,
      message: category,
      data: { template_id: templateId, category },
      is_read: false,
    });
};

export const getLastNotificationTime = async (
  userId: string,
  category?: string
): Promise<Date | null> => {
  let query = supabase
    .from('notifications')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (category) {
    query = query.eq('message', category);
  }

  const { data } = await query.single();

  return data ? new Date(data.created_at) : null;
};

export const shouldThrottleCategory = async (
  userId: string,
  category: string,
  minHoursBetween: number = 24
): Promise<boolean> => {
  const lastTime = await getLastNotificationTime(userId, category);
  
  if (!lastTime) return false;

  const now = new Date();
  const hoursSinceLastNotification = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastNotification < minHoursBetween;
};
