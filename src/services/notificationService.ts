import { supabase } from '@/integrations/supabase/client';
import { 
  NOTIFICATION_TEMPLATES, 
  NotificationTemplate,
  canSendAtCurrentTime 
} from '@/lib/notifications/templates';
import { getUserSegment, shouldReceiveNotificationCategory } from '@/lib/notifications/segmentation';
import { checkNotificationThrottle, recordNotificationSent, shouldThrottleCategory } from '@/lib/notifications/throttling';

export interface SendNotificationParams {
  userId: string;
  templateId: string;
  data?: Record<string, any>;
  force?: boolean; // Bypass throttling (pour les notifications critiques)
}

export const sendNotification = async ({
  userId,
  templateId,
  data = {},
  force = false,
}: SendNotificationParams): Promise<{ success: boolean; reason?: string }> => {
  // Récupérer le template
  const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId);
  
  if (!template) {
    return { success: false, reason: 'Template non trouvé' };
  }

  // Vérifier l'heure d'envoi
  if (!force && !canSendAtCurrentTime(template)) {
    return { success: false, reason: 'Heure d\'envoi non autorisée' };
  }

  // Vérifier le segment utilisateur
  const segmentData = await getUserSegment(userId);
  
  if (!force && !shouldReceiveNotificationCategory(segmentData.segment, template.category)) {
    return { success: false, reason: 'Catégorie non autorisée pour ce segment' };
  }

  // Vérifier le throttling
  if (!force) {
    const throttle = await checkNotificationThrottle(userId);
    
    if (!throttle.canSend) {
      return { success: false, reason: throttle.reason };
    }

    // Vérifier le throttling par catégorie
    const categoryThrottled = await shouldThrottleCategory(userId, template.category);
    
    if (categoryThrottled) {
      return { success: false, reason: 'Trop de notifications de cette catégorie récemment' };
    }
  }

  // Personnaliser le message si nécessaire
  let message = template.message;
  Object.keys(data).forEach(key => {
    message = message.replace(`{${key}}`, data[key]);
  });

  // Envoyer la notification via Supabase function
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        type: 'system',
        title: template.title,
        message,
        data: {
          ...data,
          template_id: templateId,
          category: template.category,
          priority: template.priority,
        },
      },
    });

    if (error) {
      console.error('Erreur envoi notification:', error);
      return { success: false, reason: error.message };
    }

    // Enregistrer l'envoi
    await recordNotificationSent(userId, templateId, template.category);

    return { success: true };
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    return { success: false, reason: 'Erreur technique' };
  }
};

export const sendNotificationToMultipleUsers = async (
  userIds: string[],
  templateId: string,
  data?: Record<string, any>
): Promise<{ successCount: number; failureCount: number }> => {
  const results = await Promise.allSettled(
    userIds.map(userId => sendNotification({ userId, templateId, data }))
  );

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failureCount = results.length - successCount;

  return { successCount, failureCount };
};

export const getRecommendedNotifications = async (
  userId: string,
  limit: number = 3
): Promise<NotificationTemplate[]> => {
  const segmentData = await getUserSegment(userId);
  
  // Filtrer les templates appropriés au segment
  const appropriateTemplates = NOTIFICATION_TEMPLATES.filter(template => 
    shouldReceiveNotificationCategory(segmentData.segment, template.category) &&
    canSendAtCurrentTime(template)
  );

  // Prioriser par priorité
  const sorted = appropriateTemplates.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return sorted.slice(0, limit);
};
