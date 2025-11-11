import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// Send SMS via Twilio
async function sendSMS(to: string, message: string): Promise<boolean> {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('Twilio credentials not configured, skipping SMS');
    return false;
  }

  try {
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: twilioPhoneNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio SMS error:', error);
      return false;
    }

    console.log('SMS sent successfully to', to);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get bookings for tomorrow (24h from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: bookings, error } = await supabaseClient
      .from('pro_bookings')
      .select(`
        *,
        profiles(email, display_name),
        pro_services(name),
        pro_profiles(business_name, email, phone)
      `)
      .eq('status', 'confirmed')
      .gte('booking_date', tomorrow.toISOString())
      .lt('booking_date', dayAfter.toISOString());

    if (error) throw error;

    console.log(`Found ${bookings?.length || 0} bookings to remind`);

    // Fetch email template
    const { data: templateData } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', 'booking_reminder')
      .eq('is_active', true)
      .single();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    // Send reminders
    for (const booking of bookings || []) {
      const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-booking?id=${booking.id}&token=${generateToken(booking.id)}`;
      
      // Prepare template variables
      const variables = {
        user_name: booking.profiles.display_name,
        service_name: booking.pro_services.name,
        pro_name: booking.pro_profiles.business_name,
        booking_date: new Date(booking.booking_date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        booking_time: booking.start_time,
        confirm_url: confirmUrl,
        pro_phone: booking.pro_profiles.phone || 'N/A',
      };

      let emailSent = false;

      // Try to send email using template
      if (resendApiKey && templateData) {
        try {
          const subject = replaceVariables(templateData.subject, variables);
          const htmlBody = replaceVariables(templateData.html_body, variables);

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Whoof Apps <onboarding@resend.dev>',
              to: [booking.profiles.email],
              subject,
              html: htmlBody,
            }),
          });
          
          emailSent = true;
          console.log(`Email sent for booking ${booking.id}`);
        } catch (emailError) {
          console.error(`Failed to send email for booking ${booking.id}:`, emailError);
        }
      }

      // Fallback to SMS if email failed
      if (!emailSent && booking.pro_profiles.phone) {
        const smsMessage = `Rappel Whoof Apps: Votre rdv demain ${variables.booking_time} pour ${variables.service_name} avec ${variables.pro_name}. Confirmez: ${confirmUrl}`;
        await sendSMS(booking.pro_profiles.phone, smsMessage);
      }

      // Notification to pro
      await supabaseClient.from('notifications').insert({
        user_id: booking.pro_profiles.user_id,
        type: 'booking_reminder',
        title: 'Rendez-vous demain',
        message: `${booking.profiles.display_name} a un rendez-vous demain pour ${booking.pro_services.name}`,
        data: { booking_id: booking.id },
      });

      console.log(`Reminder sent for booking ${booking.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminded: bookings?.length || 0 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateToken(bookingId: string): string {
  return btoa(`${bookingId}-${Date.now()}`);
}
