import React, { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Whoof Apps – Interface de Modération v2
 * ---------------------------------------------------------------
 * ✔️ Onglets : Tableau de bord, Vérifications, Signalements, Alertes, Historique, Paramètres
 * ✔️ Données mockées pour test progressif
 * ✔️ Accès restreint : admin uniquement
 */

// ————— Types de base

type AccountType = "user" | "pro";

type Verification = {
  id: string;
  accountType: AccountType;
  displayName: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  docUrl?: string;
  notes?: string;
};

type Report = {
  id: string;
  targetId: string;
  targetType: AccountType;
  reason:
    | "harassment"
    | "spam"
    | "inappropriate_content"
    | "scam"
    | "other";
  comment?: string;
  createdAt: string;
  status: "new" | "in_review" | "resolved";
};

type AlertItem = {
  id: string;
  subjectId: string;
  subjectType: AccountType;
  level: 1 | 2 | 3;
  kind:
    | "multi_reports"
    | "suspicious_activity"
    | "rate_spike"
    | "content_flag";
  createdAt: string;
  open: boolean;
};

type DecisionLog = {
  id: string;
  by: string;
  when: string;
  action: string;
  target?: string;
};

// ————— Données mockées

const MOCK_VERIFS: Verification[] = [
  {
    id: "v1",
    accountType: "pro",
    displayName: "Clinique AnimoVet",
    submittedAt: "2025-10-15T08:30:00Z",
    status: "pending",
    docUrl: "",
  },
  {
    id: "v2",
    accountType: "user",
    displayName: "Solenne B.",
    submittedAt: "2025-10-12T10:12:00Z",
    status: "approved",
  },
  {
    id: "v3",
    accountType: "pro",
    displayName: "DogWash Nantes",
    submittedAt: "2025-10-11T18:04:00Z",
    status: "rejected",
    notes: "Document illisible, nouvelle demande envoyée",
  },
];

const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    targetId: "user_112",
    targetType: "user",
    reason: "spam",
    comment: "Messages commerciaux répétés",
    createdAt: "2025-10-13T12:00:00Z",
    status: "new",
  },
  {
    id: "r2",
    targetId: "pro_77",
    targetType: "pro",
    reason: "scam",
    comment: "Demande d'acompte hors plateforme",
    createdAt: "2025-10-10T09:20:00Z",
    status: "in_review",
  },
];

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "a1",
    subjectId: "pro_77",
    subjectType: "pro",
    level: 3,
    kind: "multi_reports",
    createdAt: "2025-10-14T07:00:00Z",
    open: true,
  },
  {
    id: "a2",
    subjectId: "user_112",
    subjectType: "user",
    level: 2,
    kind: "suspicious_activity",
    createdAt: "2025-10-12T19:42:00Z",
    open: true,
  },
];

const MOCK_LOGS: DecisionLog[] = [
  {
    id: "d1",
    by: "Alice (mod)",
    when: "2025-10-12T11:10:00Z",
    action: "Validation identité",
    target: "Solenne B.",
  },
  {
    id: "d2",
    by: "Marc (mod)",
    when: "2025-10-12T12:30:00Z",
    action: "Avertissement envoyé",
    target: "user_112",
  },
];

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
  const { data: roleData, isLoading: roleLoading } = useAdminRole();
  const [tab, setTab] = useState<TabKey>("dashboard");

  const pendingVerifs = useMemo(() => MOCK_VERIFS.filter(v => v.status === "pending").length, []);
  const openReports = useMemo(() => MOCK_REPORTS.filter(r => r.status !== "resolved").length, []);
  const openAlerts = useMemo(() => MOCK_ALERTS.filter(a => a.open).length, []);

  // Protection admin
  if (!roleLoading && !roleData?.hasAccess) {
    return <Navigate to="/" replace />;
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Modération v2</h1>
          <p className="text-muted-foreground">Gérez les vérifications, signalements et alertes pour protéger la communauté Whoof.</p>
        </div>
        <span className="hidden rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-400 md:block">
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
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  tab === (k as TabKey)
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "dashboard" && <DashboardView pending={pendingVerifs} reports={openReports} alerts={openAlerts} />}
      {tab === "verifications" && <VerificationsView />}
      {tab === "reports" && <ReportsView />}
      {tab === "alerts" && <AlertsView />}
      {tab === "history" && <HistoryView />}
      {tab === "settings" && <SettingsView />}
    </main>
  );
}

// ————— Vues détaillées

function DashboardView({ pending, reports, alerts }: { pending: number; reports: number; alerts: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Vérifications en attente" value={pending} />
        <Stat label="Signalements ouverts" value={reports} />
        <Stat label="Alertes actives" value={alerts} />
      </div>

      <SectionCard title="Vérifications récentes" subtitle="Traitements prioritaires">
        <SimpleTable
          headers={["Profil", "Type", "Soumis", "Statut", "Actions"]}
          rows={MOCK_VERIFS.slice(0, 5).map(v => [
            v.displayName,
            v.accountType === "pro" ? "Pro" : "Particulier",
            new Date(v.submittedAt).toLocaleString(),
            statusBadge(v.status),
            <div key={v.id} className="flex gap-2">
              <Btn size="sm">Ouvrir</Btn>
              <Btn size="sm" variant="success">Valider</Btn>
              <Btn size="sm" variant="danger">Refuser</Btn>
            </div>,
          ])}
        />
      </SectionCard>

      <SectionCard title="Signalements récents" subtitle="Actions recommandées">
        <SimpleTable
          headers={["Cible", "Type", "Raison", "Créé le", "Statut", "Actions"]}
          rows={MOCK_REPORTS.slice(0, 5).map(r => [
            r.targetId,
            r.targetType === "pro" ? "Pro" : "Particulier",
            reasonLabel(r.reason),
            new Date(r.createdAt).toLocaleString(),
            reportBadge(r.status),
            <div key={r.id} className="flex gap-2">
              <Btn size="sm">Inspecter</Btn>
              <Btn size="sm" variant="warning">Avertir</Btn>
              <Btn size="sm" variant="success">Résoudre</Btn>
            </div>,
          ])}
        />
      </SectionCard>
    </div>
  );
}

function VerificationsView() {
  const [filter, setFilter] = useState<"all" | AccountType>("all");
  const [status, setStatus] = useState<"all" | Verification["status"]>("all");

  const data = useMemo(() =>
    MOCK_VERIFS.filter(v => (filter === "all" ? true : v.accountType === filter) && (status === "all" ? true : v.status === status)),
    [filter, status]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select 
          value={filter} 
          onChange={(v) => setFilter(v as typeof filter)} 
          options={[
            { value: "all", label: "Tous les comptes" },
            { value: "user", label: "Particuliers" },
            { value: "pro", label: "Professionnels" },
          ]} 
        />
        <Select 
          value={status} 
          onChange={(v) => setStatus(v as typeof status)} 
          options={[
            { value: "all", label: "Tous statuts" },
            { value: "pending", label: "En attente" },
            { value: "approved", label: "Validés" },
            { value: "rejected", label: "Refusés" },
          ]} 
        />
      </div>

      <SectionCard title="Demandes de vérification" subtitle={`${data.length} résultat(s)`}>
        <SimpleTable
          headers={["Profil", "Type", "Soumis", "Statut", "Notes", "Actions"]}
          rows={data.map(v => [
            v.displayName,
            v.accountType === "pro" ? "Pro" : "Particulier",
            new Date(v.submittedAt).toLocaleString(),
            statusBadge(v.status),
            v.notes || "-",
            <div key={v.id} className="flex gap-2">
              <Btn size="sm">Voir doc</Btn>
              <Btn size="sm" variant="success">Valider</Btn>
              <Btn size="sm" variant="danger">Refuser</Btn>
            </div>,
          ])}
        />
      </SectionCard>
    </div>
  );
}

function ReportsView() {
  const [type, setType] = useState<"all" | AccountType>("all");
  const [status, setStatus] = useState<"all" | Report["status"]>("all");

  const data = useMemo(() =>
    MOCK_REPORTS.filter(r => (type === "all" ? true : r.targetType === type) && (status === "all" ? true : r.status === status)),
    [type, status]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select 
          value={type} 
          onChange={(v) => setType(v as typeof type)} 
          options={[
            { value: "all", label: "Tous les comptes" },
            { value: "user", label: "Particuliers" },
            { value: "pro", label: "Professionnels" },
          ]} 
        />
        <Select 
          value={status} 
          onChange={(v) => setStatus(v as typeof status)} 
          options={[
            { value: "all", label: "Tous statuts" },
            { value: "new", label: "Nouveaux" },
            { value: "in_review", label: "En cours" },
            { value: "resolved", label: "Résolus" },
          ]} 
        />
      </div>

      <SectionCard title="Signalements" subtitle={`${data.length} résultat(s)`}>
        <SimpleTable
          headers={["Cible", "Type", "Raison", "Créé le", "Statut", "Actions"]}
          rows={data.map(r => [
            r.targetId,
            r.targetType === "pro" ? "Pro" : "Particulier",
            reasonLabel(r.reason),
            new Date(r.createdAt).toLocaleString(),
            reportBadge(r.status),
            <div key={r.id} className="flex gap-2">
              <Btn size="sm">Inspecter</Btn>
              <Btn size="sm" variant="warning">Avertir</Btn>
              <Btn size="sm" variant="success">Résoudre</Btn>
            </div>,
          ])}
        />
      </SectionCard>
    </div>
  );
}

function AlertsView() {
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [level, setLevel] = useState<"all" | 1 | 2 | 3>("all");

  const data = useMemo(() =>
    MOCK_ALERTS.filter(a => (onlyOpen ? a.open : true) && (level === "all" ? true : a.level === level)),
    [onlyOpen, level]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle checked={onlyOpen} onChange={setOnlyOpen} label="Afficher seulement ouvertes" />
        <Select 
          value={level} 
          onChange={(v) => setLevel(v as typeof level)} 
          options={[
            { value: "all", label: "Tous niveaux" },
            { value: 1, label: "Niveau 1" },
            { value: 2, label: "Niveau 2" },
            { value: 3, label: "Niveau 3 (critique)" },
          ]} 
        />
      </div>

      <SectionCard title="Alertes">
        <SimpleTable
          headers={["Cible", "Type", "Gravité", "Créé le", "État", "Actions"]}
          rows={data.map(a => [
            a.subjectId,
            a.subjectType === "pro" ? "Pro" : "Particulier",
            `Niveau ${a.level}`,
            new Date(a.createdAt).toLocaleString(),
            a.open ? badge("Ouverte", "orange") : badge("Fermée", "gray"),
            <div key={a.id} className="flex gap-2">
              <Btn size="sm">Inspecter</Btn>
              {a.open ? (
                <Btn size="sm" variant="success">Clôturer</Btn>
              ) : (
                <Btn size="sm" variant="secondary">Archiver</Btn>
              )}
              <Btn size="sm" variant="danger">Suspendre</Btn>
            </div>,
          ])}
        />
      </SectionCard>
    </div>
  );
}

function HistoryView() {
  return (
    <div className="space-y-4">
      <SectionCard title="Historique des décisions" subtitle={`${MOCK_LOGS.length} évènement(s)`}>
        <SimpleTable
          headers={["Quand", "Modérateur", "Action", "Cible"]}
          rows={MOCK_LOGS.map(l => [
            new Date(l.when).toLocaleString(),
            l.by,
            l.action,
            l.target || "-",
          ])}
        />
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
          <TextareaComp label="Avertissement standard" placeholder="Bonjour, suite à des signalements…" />
          <TextareaComp label="Refus de vérification" placeholder="Bonjour, votre document n'a pas pu être validé car…" />
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
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
}) {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
  }[size];

  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  return (
    <button className={classNames("rounded-lg font-medium transition", sizes, variants[variant])}>{children}</button>
  );
}

function Select<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select
      value={value as any}
      onChange={(e) => onChange((e.target.value as unknown) as T)}
      className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map(o => (
        <option key={String(o.value)} value={o.value as any}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <span 
        className={classNames(
          "h-6 w-10 rounded-full p-1 transition cursor-pointer", 
          checked ? "bg-primary" : "bg-muted"
        )}
        onClick={() => onChange(!checked)}
      >
        <span 
          className={classNames(
            "block h-4 w-4 rounded-full bg-white shadow transition", 
            checked ? "translate-x-4" : "translate-x-0"
          )} 
        />
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
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function TextareaComp({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      <textarea
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

// ————— Badges & libellés

function badge(text: string, color: "gray" | "green" | "red" | "orange") {
  const map: Record<string, string> = {
    gray: "bg-muted text-muted-foreground",
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    red: "bg-destructive/10 text-destructive",
    orange: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  };
  return <span className={classNames("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", map[color])}>{text}</span>;
}

function statusBadge(s: Verification["status"]) {
  switch (s) {
    case "pending":
      return badge("En attente", "orange");
    case "approved":
      return badge("Validé", "green");
    case "rejected":
      return badge("Refusé", "red");
  }
}

function reportBadge(s: Report["status"]) {
  switch (s) {
    case "new":
      return badge("Nouveau", "orange");
    case "in_review":
      return badge("En cours", "gray");
    case "resolved":
      return badge("Résolu", "green");
  }
}

function reasonLabel(r: Report["reason"]) {
  const map: Record<Report["reason"], string> = {
    harassment: "Harcèlement",
    spam: "Spam",
    inappropriate_content: "Contenu inapproprié",
    scam: "Arnaque",
    other: "Autre",
  };
  return map[r];
}