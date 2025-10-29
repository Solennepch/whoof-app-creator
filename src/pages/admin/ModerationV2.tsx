import React, { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchVerifications,
  fetchReports,
  fetchAlerts,
  fetchModerationLogs,
  approveVerification,
  rejectVerification,
  resolveReport,
  setReportInReview,
  closeAlert,
  archiveAlert,
  warnUser,
  type Verification as VerificationType,
  type Report as ReportType,
  type Alert as AlertType,
  type AccountType,
} from "@/lib/moderation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Whoof Apps – Interface de Modération v2
 * ---------------------------------------------------------------
 * ✔️ Onglets : Tableau de bord, Vérifications, Signalements, Alertes, Historique, Paramètres
 * ✔️ Données réelles depuis Supabase
 * ✔️ Accès restreint : admin uniquement
 * ✔️ Toasts + confirmations
 */

// ————— Helpers

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-2xl font-extrabold text-foreground">{value}</div>
      </div>
      {icon || <span className="text-muted-foreground">🛡️</span>}
    </div>
  );
}

// ————— Vues

type TabKey = "dashboard" | "verifications" | "reports" | "alerts" | "history" | "settings";

export default function ModerationV2() {
  const adminData = useAdminRole();
  const isAdmin = adminData.data?.isAdmin || false;
  const adminLoading = adminData.isLoading;
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "dashboard";
  const [tab, setTab] = useState<TabKey>(initialTab);
  const { toast } = useToast();

  const [verifications, setVerifications] = useState<VerificationType[]>([]);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [verificationsData, reportsData, alertsData] = await Promise.all([
        fetchVerifications(),
        fetchReports(),
        fetchAlerts(),
      ]);
      setVerifications(verificationsData);
      setReports(reportsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading moderation data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-64" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingVerifs = verifications.filter(v => v.status === "pending").length;
  const openReports = reports.filter(r => r.status === "open").length;
  const activeAlerts = alerts.filter(a => a.status === "active").length;

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Modération</h1>
          <p className="text-muted-foreground">Gérez les vérifications, signalements et alertes pour protéger la communauté Whoof.</p>
        </div>
        <span className="hidden rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600 md:block">
          Espace sécurisé
        </span>
      </header>

      {/* Tabs */}
      <nav className="mb-6 overflow-x-auto">
        <ul className="flex gap-2">
          {[
            { k: "dashboard", label: "Tableau de bord" },
            { k: "verifications", label: "Vérifications" },
            { k: "reports", label: "Signalements" },
            { k: "alerts", label: "Alertes" },
            { k: "history", label: "Historique" },
            { k: "settings", label: "Paramètres" },
          ].map(({ k, label }) => (
            <li key={k as string}>
              <button
                onClick={() => setTab(k as TabKey)}
                className={classNames(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === (k as TabKey)
                    ? "bg-gradient-to-r from-purple-500 to-orange-400 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {tab === "dashboard" && <DashboardView pending={pendingVerifs} reports={openReports} alerts={activeAlerts} verifications={verifications} reportsList={reports} toast={toast} onRefresh={loadData} />}
          {tab === "verifications" && <VerificationsView verifications={verifications} toast={toast} onRefresh={loadData} />}
          {tab === "reports" && <ReportsView reports={reports} toast={toast} onRefresh={loadData} />}
          {tab === "alerts" && <AlertsView alerts={alerts} toast={toast} onRefresh={loadData} />}
          {tab === "history" && <HistoryView />}
          {tab === "settings" && <SettingsView />}
        </>
      )}
    </main>
  );
}

// ————— Vues détaillées

function DashboardView({ 
  pending, 
  reports, 
  alerts, 
  verifications, 
  reportsList,
  toast,
  onRefresh
}: { 
  pending: number; 
  reports: number; 
  alerts: number; 
  verifications: VerificationType[];
  reportsList: ReportType[];
  toast: any;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Vérifications en attente" value={pending} />
        <Stat label="Signalements ouverts" value={reports} />
        <Stat label="Alertes actives" value={alerts} />
      </div>

      <SectionCard title="Vérifications récentes" subtitle="Traitements prioritaires">
        {verifications.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Aucune vérification pour l'instant</p>
        ) : (
          <SimpleTable
            headers={["Utilisateur", "Type", "Soumis", "Statut", "Actions"]}
            rows={verifications.slice(0, 5).map(v => [
              v.user_id.slice(0, 8),
              v.type,
              new Date(v.created_at).toLocaleString(),
              statusBadge(v.status),
              <VerificationActions key={v.id} verification={v} toast={toast} onRefresh={onRefresh} />,
            ])}
          />
        )}
      </SectionCard>

      <SectionCard title="Signalements récents" subtitle="Actions recommandées">
        {reportsList.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Rien à traiter — tout est calme 🐾</p>
        ) : (
          <SimpleTable
            headers={["Cible", "Type", "Raison", "Créé le", "Statut", "Actions"]}
            rows={reportsList.slice(0, 5).map(r => [
              r.entity_id?.slice(0, 8) || "—",
              r.entity_type || "—",
              r.kind,
              new Date(r.created_at).toLocaleString(),
              reportBadge(r.status),
              <ReportActions key={r.id} report={r} toast={toast} onRefresh={onRefresh} />,
            ])}
          />
        )}
      </SectionCard>
    </div>
  );
}

function VerificationActions({ verification, toast, onRefresh }: { verification: VerificationType; toast: any; onRefresh: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    setIsProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const actorId = user?.id || "";

    try {
      if (action === "approve") {
        await approveVerification(verification.id, actorId);
        toast({
          title: "✅ Vérification approuvée",
          description: "L'utilisateur a été notifié",
        });
      } else {
        await rejectVerification(verification.id, actorId, "Document non conforme");
        toast({
          title: "❌ Vérification rejetée",
          description: "L'utilisateur a été notifié",
        });
      }
      setShowConfirm(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (verification.status !== "pending") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <>
      <div className="flex gap-2">
        <Btn size="sm" variant="success" onClick={() => { setAction("approve"); setShowConfirm(true); }}>
          Valider
        </Btn>
        <Btn size="sm" variant="danger" onClick={() => { setAction("reject"); setShowConfirm(true); }}>
          Refuser
        </Btn>
      </div>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Approuver cette vérification ?" : "Rejeter cette vérification ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. L'utilisateur sera notifié de votre décision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isProcessing}>
              {isProcessing ? "En cours..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ReportActions({ report, toast, onRefresh }: { report: ReportType; toast: any; onRefresh: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<"review" | "resolve">("review");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    setIsProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const actorId = user?.id || "";

    try {
      if (action === "review") {
        await setReportInReview(report.id, actorId);
        toast({
          title: "📋 Signalement en cours d'examen",
        });
      } else {
        await resolveReport(report.id, actorId);
        toast({
          title: "✅ Signalement résolu",
        });
      }
      setShowConfirm(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Btn size="sm" onClick={() => { setAction("review"); setShowConfirm(true); }}>
          Examiner
        </Btn>
        <Btn size="sm" variant="success" onClick={() => { setAction("resolve"); setShowConfirm(true); }}>
          Résoudre
        </Btn>
      </div>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "review" ? "Marquer en cours d'examen ?" : "Résoudre ce signalement ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action sera enregistrée dans l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isProcessing}>
              {isProcessing ? "En cours..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function VerificationsView({ verifications, toast, onRefresh }: { verifications: VerificationType[]; toast: any; onRefresh: () => void }) {
  const [filter, setFilter] = useState<"all" | string>("all");
  const [status, setStatus] = useState<"all" | string>("all");

  const data = verifications.filter(v => 
    (filter === "all" || v.type === filter) && 
    (status === "all" || v.status === status)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={filter} onChange={setFilter} options={[
          { value: "all", label: "Tous les types" },
          { value: "identity", label: "Identité" },
          { value: "business", label: "Professionnel" },
        ]} />
        <Select value={status} onChange={setStatus} options={[
          { value: "all", label: "Tous statuts" },
          { value: "pending", label: "En attente" },
          { value: "approved", label: "Validés" },
          { value: "rejected", label: "Refusés" },
        ]} />
      </div>

      <SectionCard title="Demandes de vérification" subtitle={`${data.length} résultat(s)`}>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Aucune vérification pour l'instant.</p>
        ) : (
          <SimpleTable
            headers={["Utilisateur", "Type", "Soumis", "Statut", "Notes", "Actions"]}
            rows={data.map(v => [
              v.user_id.slice(0, 8),
              v.type,
              new Date(v.created_at).toLocaleString(),
              statusBadge(v.status),
              v.notes || "—",
              <VerificationActions key={v.id} verification={v} toast={toast} onRefresh={onRefresh} />,
            ])}
          />
        )}
      </SectionCard>
    </div>
  );
}

function ReportsView({ reports, toast, onRefresh }: { reports: ReportType[]; toast: any; onRefresh: () => void }) {
  const [status, setStatus] = useState<"all" | string>("all");

  const data = reports.filter(r => status === "all" || r.status === status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={status} onChange={setStatus} options={[
          { value: "all", label: "Tous statuts" },
          { value: "open", label: "Nouveaux" },
          { value: "in_review", label: "En cours" },
          { value: "resolved", label: "Résolus" },
        ]} />
      </div>

      <SectionCard title="Signalements" subtitle={`${data.length} résultat(s)`}>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Rien à traiter — tout est calme 🐾</p>
        ) : (
          <SimpleTable
            headers={["Cible", "Type", "Raison", "Créé le", "Statut", "Actions"]}
            rows={data.map(r => [
              r.entity_id?.slice(0, 8) || "—",
              r.entity_type || "—",
              r.kind,
              new Date(r.created_at).toLocaleString(),
              reportBadge(r.status),
              <ReportActions key={r.id} report={r} toast={toast} onRefresh={onRefresh} />,
            ])}
          />
        )}
      </SectionCard>
    </div>
  );
}

function AlertsView({ alerts, toast, onRefresh }: { alerts: AlertType[]; toast: any; onRefresh: () => void }) {
  const [onlyOpen, setOnlyOpen] = useState(true);

  const data = alerts.filter(a => !onlyOpen || a.status === "active");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle checked={onlyOpen} onChange={setOnlyOpen} label="Afficher seulement actives" />
      </div>

      <SectionCard title="Alertes">
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Aucune alerte active.</p>
        ) : (
          <SimpleTable
            headers={["Utilisateur", "Type", "Titre", "Créé le", "État"]}
            rows={data.map(a => [
              a.user_id.slice(0, 8),
              a.type,
              a.title,
              new Date(a.created_at).toLocaleString(),
              a.status === "active" ? badge("Active", "orange") : badge("Fermée", "gray"),
            ])}
          />
        )}
      </SectionCard>
    </div>
  );
}

function HistoryView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await fetchModerationLogs();
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Historique des décisions" subtitle={`${logs.length} évènement(s)`}>
        {logs.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Aucun historique disponible.</p>
        ) : (
          <SimpleTable
            headers={["Quand", "Modérateur", "Action", "Cible"]}
            rows={logs.map(l => [
              new Date(l.created_at).toLocaleString(),
              l.actor_id?.slice(0, 8) || "—",
              l.action,
              l.entity_id?.slice(0, 8) || "—",
            ])}
          />
        )}
      </SectionCard>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <SectionCard title="Seuils & politiques">
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledInput label="Seuil d'alerte multi-signalements" placeholder="ex: 3 en 24h" />
          <LabeledInput label="Durée suspension par défaut" placeholder="ex: 72h" />
          <LabeledInput label="Niveau critique (1-3)" placeholder="ex: 3" />
          <LabeledInput label="Délai de vérification moyenne" placeholder="ex: 48h" />
        </div>
      </SectionCard>

      <SectionCard title="Modèles de messages">
        <div className="grid gap-4 md:grid-cols-2">
          <Textarea label="Avertissement standard" placeholder="Bonjour, suite à des signalements…" />
          <Textarea label="Refus de vérification" placeholder="Bonjour, votre document n'a pas pu être validé car…" />
        </div>
        <div className="mt-4 flex gap-2">
          <Btn variant="secondary">Réinitialiser</Btn>
          <Btn variant="success">Enregistrer</Btn>
        </div>
      </SectionCard>
    </div>
  );
}

// ————— UI utilitaires

function SimpleTable({ headers, rows }: { headers: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr className="text-left text-sm text-muted-foreground">
            {headers.map((h, i) => (
              <th key={i} className="border-b border-border px-3 pb-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="text-sm text-foreground">
              {r.map((c, j) => (
                <td key={j} className="border-b border-border/50 px-3 py-3 align-top">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Btn({
  children,
  size = "md",
  variant = "primary",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
  }[size];

  const variants: Record<string, string> = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
  };

  return (
    <button 
      className={classNames("rounded-lg font-medium transition", sizes, variants[variant], disabled && "opacity-50 cursor-not-allowed")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <span 
        className={classNames("h-6 w-10 rounded-full p-1 transition", checked ? "bg-purple-500" : "bg-muted")}
        onClick={() => onChange(!checked)}
      >
        <span className={classNames("block h-4 w-4 rounded-full bg-white shadow transition", checked ? "translate-x-4" : "translate-x-0")} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

function LabeledInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Textarea({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      <textarea
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

// ————— Badges & libellés

function badge(text: string, color: "gray" | "green" | "red" | "orange") {
  const map: Record<string, string> = {
    gray: "bg-muted text-muted-foreground",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return <span className={classNames("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", map[color])}>{text}</span>;
}

function statusBadge(s: string) {
  switch (s) {
    case "pending":
      return badge("En attente", "orange");
    case "approved":
      return badge("Validé", "green");
    case "rejected":
      return badge("Refusé", "red");
    default:
      return badge(s, "gray");
  }
}

function reportBadge(s: string) {
  switch (s) {
    case "open":
      return badge("Nouveau", "orange");
    case "in_review":
      return badge("En cours", "gray");
    case "resolved":
      return badge("Résolu", "green");
    default:
      return badge(s, "gray");
  }
}
