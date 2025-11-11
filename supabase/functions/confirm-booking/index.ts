import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!bookingId || !token) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update booking with confirmation
    const { error } = await supabaseClient
      .from('pro_bookings')
      .update({ 
        notes: 'Client a confirmé sa présence',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;

    // Return success HTML page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Confirmation réussie</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #8B2BB8 0%, #C71585 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              text-align: center;
              max-width: 500px;
            }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; }
            .button {
              display: inline-block;
              background: #8B2BB8;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Confirmation réussie !</h1>
            <p>
              Votre présence au rendez-vous a été confirmée.<br>
              Le professionnel a été notifié.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              Merci d'utiliser Whoof Apps !
            </p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erreur</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              text-align: center;
              max-width: 500px;
            }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Erreur</h1>
            <p>Une erreur est survenue lors de la confirmation.</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      }
    );
  }
});
