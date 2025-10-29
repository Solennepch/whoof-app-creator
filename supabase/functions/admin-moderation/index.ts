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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin or moderator
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    const isModerator = roles?.some(r => r.role === 'moderator');

    if (!isAdmin && !isModerator) {
      throw new Error('Insufficient permissions');
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log('Admin moderation action:', action);

    // Handle verification approval/rejection
    if (action === 'verify') {
      const { verificationId, status, notes } = await req.json();
      
      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status');
      }

      // Audit log - before
      const { data: oldVerif } = await supabase
        .from('verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      // Update verification
      const { data: verification, error: verifError } = await supabase
        .from('verifications')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId)
        .select()
        .single();

      if (verifError) throw verifError;

      // Award badge and XP if approved
      if (status === 'approved') {
        // Add XP event
        await supabase.rpc('add_xp_event', {
          p_user_id: verification.user_id,
          p_type: 'verification_approved',
          p_points: 100,
          p_ref_id: verification.id,
          p_metadata: {}
        });

        // Check and award badges
        await supabase.rpc('check_and_award_badges', {
          p_user_id: verification.user_id
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: `verification.${status}`,
        entity_type: 'verification',
        entity_id: verificationId,
        before: oldVerif,
        after: verification
      });

      return new Response(JSON.stringify({ success: true, verification }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle report resolution
    if (action === 'resolve-report') {
      const { reportId, status, action: reportAction, sanctionData } = await req.json();

      if (!['resolved', 'ignored'].includes(status)) {
        throw new Error('Invalid status');
      }

      // Get report before
      const { data: oldReport } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      // Update report
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .update({
          status,
          handled_by: user.id,
          handled_at: new Date().toISOString(),
          notes: oldReport.notes 
            ? [...oldReport.notes, { author: user.id, text: `Action: ${reportAction}`, timestamp: new Date().toISOString() }]
            : [{ author: user.id, text: `Action: ${reportAction}`, timestamp: new Date().toISOString() }]
        })
        .eq('id', reportId)
        .select()
        .single();

      if (reportError) throw reportError;

      // Apply sanction if needed
      if (sanctionData && isAdmin) {
        const { data: sanction } = await supabase
          .from('sanctions')
          .insert({
            user_id: report.entity_id,
            type: sanctionData.type,
            reason: sanctionData.reason,
            end_at: sanctionData.end_at || null,
            created_by: user.id
          })
          .select()
          .single();

        // Audit sanction
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: `sanction.${sanctionData.type}`,
          entity_type: 'sanction',
          entity_id: sanction.id,
          before: null,
          after: sanction
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: `report.${status}`,
        entity_type: 'report',
        entity_id: reportId,
        before: oldReport,
        after: report
      });

      return new Response(JSON.stringify({ success: true, report }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle alert validation
    if (action === 'validate-alert') {
      const { alertId, action: alertAction } = await req.json();

      const { data: oldAlert } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      const updates: any = {
        validated_by: user.id,
        updated_at: new Date().toISOString()
      };

      if (alertAction === 'resolve' && oldAlert.type === 'lost_dog') {
        updates.status = 'resolved';
        updates.resolved_by = user.id;
        
        // Award XP to alert creator
        await supabase.rpc('add_xp_event', {
          p_user_id: oldAlert.user_id,
          p_type: 'lost_dog_resolved',
          p_points: 50,
          p_ref_id: alertId,
          p_metadata: {}
        });
      } else if (alertAction === 'hide') {
        updates.status = 'inactive';
      }

      const { data: alert, error: alertError } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', alertId)
        .select()
        .single();

      if (alertError) throw alertError;

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: `alert.${alertAction}`,
        entity_type: 'alert',
        entity_id: alertId,
        before: oldAlert,
        after: alert
      });

      return new Response(JSON.stringify({ success: true, alert }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin moderation error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
