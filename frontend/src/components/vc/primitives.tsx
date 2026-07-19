import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Inbox } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

/** ---------- Formatting helpers ---------- */

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "—";

export const formatDateShort = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export const formatNumber = (value: number | null | undefined, digits = 2) =>
  value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });

export const formatUsd = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);

export const formatPercent = (value: number | null | undefined, digits = 0) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(digits)}%`;

export const humanize = (value: string | null | undefined) =>
  (value ?? "unknown").replaceAll("_", " ");

/** Deadline helpers */
export function slaFrom(deadline: string | null | undefined) {
  if (!deadline) return { label: "—", tone: "muted" as const, overdue: false, urgent: false };
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { label: "Overdue", tone: "destructive" as const, overdue: true, urgent: true };
  const hours = Math.ceil(ms / 3_600_000);
  if (hours < 24)
    return { label: `${hours}h left`, tone: "warning" as const, overdue: false, urgent: true };
  const days = Math.ceil(hours / 24);
  if (days <= 3)
    return { label: `${days}d left`, tone: "warning" as const, overdue: false, urgent: true };
  return { label: `${days}d left`, tone: "muted" as const, overdue: false, urgent: false };
}

/** ---------- Status / recommendation badges ---------- */

type Tone = "muted" | "info" | "success" | "warning" | "destructive" | "primary";

const toneClasses: Record<Tone, string> = {
  muted:
    "bg-muted text-muted-foreground border border-border/60",
  info: "bg-info/10 text-info border border-info/30",
  success: "bg-success/10 text-success border border-success/30",
  warning: "bg-warning/15 text-[oklch(0.42_0.12_60)] dark:text-warning border border-warning/40",
  destructive:
    "bg-destructive/10 text-destructive border border-destructive/30",
  primary: "bg-primary/10 text-primary border border-primary/30",
};

const RECOMMENDATION_TONE: Record<string, Tone> = {
  invest: "success",
  pass: "destructive",
  needs_more_info: "warning",
};

const STATUS_TONE: Record<string, Tone> = {
  submitted: "muted",
  extracting: "info",
  claims_ready: "info",
  screened: "info",
  diligence_running: "info",
  evidence_ready: "info",
  memo_draft: "info",
  memo_ready: "primary",
  approved: "success",
  passed: "destructive",
  needs_more_info: "warning",
  failed: "destructive",
  running: "info",
  pending: "muted",
  completed: "success",
  cancelled: "muted",
  valid: "success",
  invalid: "destructive",
  supports: "success",
  contradicts: "destructive",
  neutral: "muted",
  verified: "success",
  unverified: "warning",
  contradicted: "destructive",
  partial: "warning",
  low: "muted",
  medium: "info",
  high: "warning",
  critical: "destructive",
  conditional_approval: "warning",
};

function pickTone(value: string | null | undefined, kind: "status" | "recommendation"): Tone {
  const key = (value ?? "").toLowerCase();
  if (kind === "recommendation") return RECOMMENDATION_TONE[key] ?? "muted";
  return STATUS_TONE[key] ?? "muted";
}

export function StatusBadge({
  value,
  kind = "status",
  className,
}: {
  value: string | null | undefined;
  kind?: "status" | "recommendation";
  className?: string;
}) {
  const tone = pickTone(value, kind);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize tracking-tight",
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "destructive" && "bg-destructive",
          tone === "info" && "bg-info",
          tone === "primary" && "bg-primary",
          tone === "muted" && "bg-muted-foreground/50",
        )}
      />
      {humanize(value)}
    </span>
  );
}

/** ---------- Score dot ---------- */
export function ScorePill({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value === null || value === undefined)
    return <span className={cn("text-muted-foreground tabular", className)}>—</span>;
  const tone: Tone = value >= 7 ? "success" : value >= 5 ? "warning" : "destructive";
  return (
    <span
      className={cn(
        "inline-flex min-w-[3rem] items-center justify-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular",
        toneClasses[tone],
        className,
      )}
    >
      {value.toFixed(1)}
    </span>
  );
}

/** ---------- Coverage / confidence bar ---------- */

export function CoverageBar({
  value,
  className,
  showLabel = true,
}: {
  value: number | null | undefined;
  className?: string;
  showLabel?: boolean;
}) {
  const v = Math.max(0, Math.min(100, Number(value ?? 0)));
  const tone = v >= 70 ? "bg-success" : v >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${v}%` }} />
      </div>
      {showLabel && (
        <span className="min-w-[2.5rem] text-right text-xs font-medium text-muted-foreground tabular">
          {v.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

/** ---------- KPI card ---------- */

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "muted",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-4 shadow-[0_1px_0_0_oklch(0_0_0/0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md",
              tone === "success" && "bg-success/10 text-success",
              tone === "warning" && "bg-warning/15 text-[oklch(0.42_0.12_60)] dark:text-warning",
              tone === "destructive" && "bg-destructive/10 text-destructive",
              tone === "info" && "bg-info/10 text-info",
              tone === "primary" && "bg-primary/10 text-primary",
              tone === "muted" && "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/** ---------- Section / panel ---------- */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border/70 bg-card shadow-[0_1px_0_0_oklch(0_0_0/0.02)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** ---------- Def list / summary ---------- */

export function DefList({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 truncate text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Unavailable({ children = "Not available" }: { children?: ReactNode }) {
  return <span className="text-muted-foreground/70 italic">{children}</span>;
}

/** ---------- States ---------- */

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
}: {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unable to load data.";
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/** ---------- JSON list (for memo bullet lists) ---------- */
export function JsonList({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0)
    return <p className="text-sm text-muted-foreground">None reported.</p>;
  return (
    <ul className="space-y-2 text-sm">
      {value.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
          {typeof item === "string" ? (
            <span className="text-foreground/90 leading-relaxed">{item}</span>
          ) : (
            <pre className="min-w-0 flex-1 overflow-x-auto rounded bg-muted/60 p-2 text-xs">
              {JSON.stringify(item, null, 2)}
            </pre>
          )}
        </li>
      ))}
    </ul>
  );
}

export { Badge };
