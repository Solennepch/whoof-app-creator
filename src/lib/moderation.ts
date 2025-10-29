import { supabase } from "@/integrations/supabase/client";

// ————— Types
export type AccountType = "user" | "pro";

export type Verification = {
  id: string;
  user_id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  file_url: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  entity_id?: string;
  entity_type?: string;
  kind: string;
  reason?: string;
  details?: string;
  status: "open" | "resolved";
  handled_by?: string;
  handled_at?: string;
  created_at: string;
  updated_at: string;
};

export type Alert = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  status: "active" | "resolved" | "archived";
  validated_by?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
};

// ————— Utils
async function logModerationAction(
  actorId: string,
  action: string,
  entityId: string,
  entityType: string,
  meta: Record<string, any> = {}
) {
  try {
    await supabase.from("audit_logs").insert([
      {
        actor_id: actorId,
        action,
        entity_id: entityId,
        entity_type: entityType,
        after: meta,
      },
    ]);
  } catch (error) {
    console.error("Failed to log moderation action:", error);
  }
}

// ————— Vérifications
export async function fetchVerifications(filters?: {
  status?: string;
  type?: string;
}) {
  let query = supabase
    .from("verifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Verification[];
}

export async function approveVerification(
  verificationId: string,
  actorId: string
) {
  const { data, error } = await supabase
    .from("verifications")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
      notes: "Approuvé par modération",
    })
    .eq("id", verificationId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(
    actorId,
    "verification_approved",
    verificationId,
    "verification",
    { status: "approved" }
  );

  return data;
}

export async function rejectVerification(
  verificationId: string,
  actorId: string,
  notes = ""
) {
  const { data, error } = await supabase
    .from("verifications")
    .update({
      status: "rejected",
      notes: notes || "Rejeté par modération",
      updated_at: new Date().toISOString(),
    })
    .eq("id", verificationId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(
    actorId,
    "verification_rejected",
    verificationId,
    "verification",
    { notes }
  );

  return data;
}

// ————— Signalements
export async function fetchReports(filters?: { status?: string }) {
  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    // Cast to any to avoid type issues with enum
    query = query.eq("status", filters.status as any);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Report[];
}

export async function resolveReport(reportId: string, actorId: string) {
  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      handled_by: actorId,
      handled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(actorId, "report_resolved", reportId, "report");

  return data;
}

export async function setReportInReview(reportId: string, actorId: string) {
  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "open",
      handled_by: actorId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(actorId, "report_in_review", reportId, "report");

  return data;
}

// ————— Alertes
export async function fetchAlerts(filters?: { status?: string }) {
  let query = supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    // Map status values to match database schema
    const dbStatus = filters.status === "active" ? "active" : filters.status === "resolved" ? "resolved" : "active";
    query = query.eq("status", dbStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Alert[];
}

export async function closeAlert(alertId: string, actorId: string) {
  const { data, error } = await supabase
    .from("alerts")
    .update({
      status: "resolved",
      resolved_by: actorId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(actorId, "alert_closed", alertId, "alert");

  return data;
}

export async function archiveAlert(alertId: string, actorId: string) {
  const { data, error } = await supabase
    .from("alerts")
    .update({
      status: "resolved",
      resolved_by: actorId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(actorId, "alert_archived", alertId, "alert");

  return data;
}

// ————— Historique
export async function fetchModerationLogs(limit = 50) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ————— Avertissement
export async function warnUser(
  targetId: string,
  actorId: string,
  message: string
) {
  const { data, error } = await supabase
    .from("alerts")
    .insert([
      {
        user_id: targetId,
        type: "warning",
        title: "Avertissement de modération",
        description: message,
        status: "active",
        validated_by: actorId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(actorId, "warning_sent", targetId, "user", {
    message,
  });

  return data;
}
