import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Send reminders
    for (const booking of bookings || []) {
      const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-booking?id=${booking.id}&token=${generateToken(booking.id)}`;
      
      // Send email using Resend API directly
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Whoof Apps <onboarding@resend.dev>',
            to: [booking.profiles.email],
            subject: '🐾 Rappel de rendez-vous demain',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Bonjour ${booking.profiles.display_name} ! 👋</h2>
                <p>Ce message est un rappel pour votre rendez-vous demain :</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Service:</strong> ${booking.pro_services.name}</p>
                  <p><strong>Professionnel:</strong> ${booking.pro_profiles.business_name}</p>
                  <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p><strong>Heure:</strong> ${booking.start_time}</p>
                </div>

                <p>Merci de confirmer votre présence :</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" 
                     style="background: #8B2BB8; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 6px; display: inline-block;">
                    ✅ Confirmer ma présence
                  </a>
                </div>

                <p style="color: #666; font-size: 14px;">
                  Si vous ne pouvez pas vous rendre à ce rendez-vous, merci de prévenir 
                  ${booking.pro_profiles.business_name} au ${booking.pro_profiles.phone}.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Whoof Apps - Votre plateforme de services canins<br>
                  contact@whoof.app
                </p>
              </div>
            `,
          }),
        });
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
      JSON.stringify({ error: error.message }),
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
