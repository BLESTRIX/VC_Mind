import { useMemo, useState, type FormEvent } from "react";
import { ExternalLink, ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react";
import type {
  Claim,
  Decision,
  Evidence,
  InformationRequest,
  Job,
  Memo,
  Score,
  Stage,
  StageEvent,
} from "@/api/types";
import {
  StatusBadge,
  CoverageBar,
  EmptyState,
  Panel,
  DefList,
  ScorePill,
  JsonList,
  formatDate,
  formatDateShort,
  formatNumber,
  humanize,
  slaFrom,
} from "@/components/vc/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** ---------- Pipeline timeline ---------- */

const STAGE_ORDER: Stage[] = [
  "submitted",
  "extracting",
  "claims_ready",
  "screened",
  "diligence_running",
  "evidence_ready",
  "memo_draft",
  "memo_ready",
];

function stageState(
  stage: Stage,
  currentStage: Stage,
  events: StageEvent[],
): "completed" | "active" | "failed" | "pending" {
  const failedEvent = events.find((e) => e.stage === stage && e.status === "failed");
  if (failedEvent) return "failed";
  if (currentStage === "failed") {
    const idxCurrent = STAGE_ORDER.indexOf(stage);
    const lastCompleted = events
      .filter((e) => e.status === "completed" && STAGE_ORDER.includes(e.stage))
      .map((e) => STAGE_ORDER.indexOf(e.stage))
      .reduce((max, x) => Math.max(max, x), -1);
    if (idxCurrent <= lastCompleted) return "completed";
    return "pending";
  }
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const stageIdx = STAGE_ORDER.indexOf(stage);
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "active";
  return "pending";
}

export function PipelineTimeline({
  events,
  jobs,
  currentStage,
  active,
}: {
  events: StageEvent[];
  jobs: Job[];
  currentStage: Stage;
  active: boolean;
}) {
  const stages = STAGE_ORDER;

  return (
    <Panel
      title="Pipeline"
      description="Diligence pipeline stages with attempts, duration, and errors."
      actions={
        active ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-info">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-info" />
            Running
          </span>
        ) : null
      }
    >
      <ol className="relative space-y-3 border-l border-border/70 pl-6">
        {stages.map((stage) => {
          const state = stageState(stage, currentStage, events);
          const event = [...events].reverse().find((e) => e.stage === stage);
          return (
            <li key={stage} className="relative">
              <span
                className={cn(
                  "absolute -left-[29px] top-1 grid h-4 w-4 place-items-center rounded-full ring-4 ring-background",
                  state === "completed" && "bg-success",
                  state === "active" && "bg-info pulse-dot",
                  state === "failed" && "bg-destructive",
                  state === "pending" && "bg-muted",
                )}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium capitalize text-foreground">
                  {humanize(stage)}
                </span>
                <StatusBadge value={state} />
              </div>
              {event && (
                <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-3">
                  <span>Attempt {event.attempt_number}</span>
                  <span>Started {formatDate(event.started_at)}</span>
                  <span>
                    Duration{" "}
                    {event.duration_ms !== null ? `${event.duration_ms.toLocaleString()} ms` : "—"}
                  </span>
                </div>
              )}
              {event?.error_message && (
                <p className="mt-1 text-xs text-destructive">{event.error_message}</p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Processing jobs
        </h3>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs yet" description="Jobs appear here once diligence starts." />
        ) : (
          <ul className="space-y-1.5">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs"
              >
                <StatusBadge value={job.status} />
                <span className="font-medium text-foreground">{job.job_type}</span>
                <span className="text-muted-foreground">· attempt {job.attempt_number}</span>
                <span className="text-muted-foreground">· {formatDate(job.started_at)}</span>
                {job.error_message && (
                  <span className="text-destructive">— {job.error_message}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

/** ---------- Claims & Evidence ---------- */

export function ClaimsPanel({ claims, evidence }: { claims: Claim[]; evidence: Evidence[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const evByClaim = useMemo(() => {
    const map = new Map<string, Evidence[]>();
    evidence.forEach((e) => {
      const list = map.get(e.claim_id) ?? [];
      list.push(e);
      map.set(e.claim_id, list);
    });
    return map;
  }, [evidence]);

  return (
    <Panel
      title="Claims & Evidence"
      description="Expand a claim to see supporting, contradicting, and neutral evidence."
    >
      {claims.length === 0 ? (
        <EmptyState title="No claims extracted yet" />
      ) : (
        <div className="divide-y divide-border/60 rounded-md border border-border/60">
          {claims.map((claim) => {
            const list = evByClaim.get(claim.id) ?? [];
            const isOpen = openId === claim.id;
            return (
              <Collapsible
                key={claim.id}
                open={isOpen}
                onOpenChange={(v) => setOpenId(v ? claim.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <ChevronDown
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-0",
                        !isOpen && "-rotate-90",
                      )}
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm leading-snug text-foreground">{claim.claim_text}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="capitalize">{humanize(claim.category)}</span>
                        <StatusBadge value={claim.importance} />
                        <StatusBadge value={claim.verification_status} />
                        {claim.evidence_confidence !== null && (
                          <span className="tabular">
                            Confidence {(claim.evidence_confidence * 100).toFixed(0)}%
                          </span>
                        )}
                        <span>{list.length} evidence</span>
                      </div>
                      {claim.evidence_confidence !== null && (
                        <CoverageBar value={claim.evidence_confidence * 100} showLabel={false} />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 border-t border-border/60 bg-muted/30 px-4 py-3">
                    {claim.source_excerpt && (
                      <div className="rounded border border-border/60 bg-background p-3 text-xs">
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Source excerpt
                        </div>
                        <p className="text-foreground/90">{claim.source_excerpt}</p>
                      </div>
                    )}
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No evidence recorded.</p>
                    ) : (
                      <ul className="space-y-2">
                        {list.map((e) => (
                          <EvidenceCard key={e.id} evidence={e} />
                        ))}
                      </ul>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const src = evidence.evidence_sources;
  const rel = (evidence.relationship ?? "").toLowerCase();
  const relTone =
    rel === "supports" || rel === "supporting"
      ? "border-l-success"
      : rel === "contradicts" || rel === "contradicting"
        ? "border-l-destructive"
        : "border-l-muted-foreground/40";
  return (
    <li
      className={cn(
        "rounded border border-border/60 border-l-2 bg-background p-3 text-xs",
        relTone,
        evidence.validation_status === "invalid" && "ring-1 ring-destructive/30",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={evidence.relationship} />
          <StatusBadge value={evidence.validation_status} />
          {src?.founder_controlled ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.42_0.12_60)] dark:text-warning">
              <ShieldAlert className="h-3 w-3" /> Founder-controlled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Independent
            </span>
          )}
          {src?.authoritative_source && (
            <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
              <ShieldCheck className="h-3 w-3" /> Authoritative
            </span>
          )}
        </div>
        {src?.canonical_url && (
          <a
            href={src.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {src.source_title ?? src.source_domain ?? "Source"}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {src?.source_domain && (
        <div className="mt-1 text-[10px] text-muted-foreground">{src.source_domain}</div>
      )}
      <p className="mt-2 leading-relaxed text-foreground/90">{evidence.excerpt}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span>Quality {formatNumber(evidence.source_quality)}</span>
        <span>Entity match {formatNumber(evidence.entity_match)}</span>
      </div>
      {evidence.validation_error && (
        <p className="mt-1 text-[11px] text-destructive">{evidence.validation_error}</p>
      )}
    </li>
  );
}

/** ---------- Scores ---------- */

export function ScoresPanel({ scores }: { scores: Score[] }) {
  const current = scores.filter((s) => s.is_current);
  const overall = useMemo(() => {
    if (!current.length) return null;
    const totalWeight = current.reduce((s, x) => s + (x.weight ?? 0), 0);
    if (totalWeight <= 0) return null;
    const weighted = current.reduce((s, x) => s + (x.weighted_score ?? 0), 0);
    return weighted / totalWeight;
  }, [current]);

  return (
    <Panel
      title="Scoring"
      description="Current diligence dimensions with weighted contribution."
      actions={
        overall !== null ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Weighted mean
            <ScorePill value={overall} />
          </div>
        ) : null
      }
    >
      {current.length === 0 ? (
        <EmptyState title="No scores yet" description="Scores appear once the pipeline completes scoring." />
      ) : (
        <ul className="space-y-3">
          {current.map((s) => (
            <li key={s.id} className="rounded-md border border-border/60 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium capitalize">{humanize(s.dimension)}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Weight {formatNumber(s.weight)}</span>
                  <span>Weighted {formatNumber(s.weighted_score)}</span>
                  <span>{s.evidence_count} evidence</span>
                  <ScorePill value={s.score} />
                </div>
              </div>
              <div className="mt-2">
                <CoverageBar value={(s.score / 10) * 100} showLabel={false} />
              </div>
              {s.explanation && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.explanation}</p>
              )}
              <div className="mt-1 text-[10px] text-muted-foreground">Version {s.scoring_version}</div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** ---------- Memo ---------- */

export function MemoPanel({ memo }: { memo: Memo | null }) {
  if (!memo)
    return (
      <Panel title="Investment memo">
        <EmptyState title="No memo yet" description="Memo drafts appear here once ready." />
      </Panel>
    );
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/70 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Investment memo · v{memo.version}
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Investment committee brief</h2>
            <div className="mt-1 text-xs text-muted-foreground">Created {formatDate(memo.created_at)}</div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge value={memo.recommendation} kind="recommendation" />
            {memo.confidence !== null && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Confidence
                </div>
                <div className="text-sm font-semibold tabular">
                  {(memo.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Investment hypothesis
            </h3>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed">
              {memo.investment_hypothesis ?? "—"}
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Thesis alignment
            </h3>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed">
              {memo.thesis_alignment ?? "—"}
            </p>
          </div>
        </div>

        {memo.strongest_reason_to_pass && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              <span className="font-semibold">Strongest reason to pass: </span>
              {memo.strongest_reason_to_pass}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Strengths"><JsonList value={memo.strengths} /></Panel>
        <Panel title="Weaknesses & key risks"><JsonList value={memo.weaknesses} /></Panel>
        <Panel title="Opportunities"><JsonList value={memo.opportunities} /></Panel>
        <Panel title="Threats"><JsonList value={memo.threats} /></Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel title="Verified claims"><JsonList value={memo.verified_claims} /></Panel>
        <Panel title="Unverified / partial"><JsonList value={memo.unverified_claims} /></Panel>
        <Panel title="Contradicted claims"><JsonList value={memo.contradicted_claims} /></Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Key questions"><JsonList value={memo.key_questions} /></Panel>
        <Panel title="Validation flags"><JsonList value={memo.validation_flags} /></Panel>
      </div>

      {memo.recommendation_reason && (
        <Panel title="Recommendation reasoning">
          <p className="max-w-[72ch] text-sm leading-relaxed">{memo.recommendation_reason}</p>
        </Panel>
      )}
    </div>
  );
}

/** ---------- Information requests ---------- */

export function InformationRequestsPanel({ requests }: { requests: InformationRequest[] }) {
  return (
    <Panel
      title="Information requests"
      description="Outstanding follow-ups sent to the founding team."
    >
      {requests.length === 0 ? (
        <EmptyState title="No information requests" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Claim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const sla = slaFrom(r.due_at);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="max-w-[26rem] text-muted-foreground">
                      {r.description ?? "—"}
                    </TableCell>
                    <TableCell>{r.requested_document_type ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.claim_id ? r.claim_id.slice(0, 8) : "—"}
                    </TableCell>
                    <TableCell><StatusBadge value={r.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{formatDateShort(r.due_at)}</span>
                        {r.due_at && (
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              sla.overdue && "text-destructive",
                              sla.urgent && !sla.overdue && "text-warning",
                            )}
                          >
                            {sla.label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  );
}

/** ---------- Decision form ---------- */

type DecisionKind = "approved" | "passed" | "needs_more_info" | "conditional_approval";

const DECISION_LABEL: Record<DecisionKind, string> = {
  approved: "Approve",
  passed: "Pass",
  needs_more_info: "Request more information",
  conditional_approval: "Conditional approval",
};

export function DecisionPanel({
  decisions,
  memoId,
  onSubmit,
}: {
  decisions: Decision[];
  memoId?: string;
  onSubmit: (v: { memoId?: string; decision: string; reason: string }) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<DecisionKind | null>(null);

  async function record(decision: DecisionKind) {
    if (reason.trim().length < 3) {
      setError("A decision reason of at least 3 characters is required.");
      setPending(null);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...(memoId ? { memoId } : {}), decision, reason: reason.trim() });
      setReason("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Decision failed.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Human decision"
        description="Record the investment-committee outcome. All choices require a reason."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Decision reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={3}
              rows={4}
              className="mt-1.5"
              placeholder="Summarise the committee's reasoning, key evidence, and any conditions."
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="success"
              disabled={busy}
              onClick={() => setPending("approved")}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={busy}
              onClick={() => setPending("needs_more_info")}
            >
              Request more information
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setPending("conditional_approval")}
            >
              Conditional approval
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => setPending("passed")}
            >
              Pass
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="Decision history">
        {decisions.length === 0 ? (
          <EmptyState title="No decisions recorded yet" />
        ) : (
          <ol className="relative space-y-3 border-l border-border/70 pl-6">
            {decisions.map((d) => (
              <li key={d.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={d.decision} />
                  {d.is_current && (
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Current
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
                </div>
                {d.decision_reason && (
                  <p className="mt-1 max-w-[72ch] text-sm text-foreground/90">{d.decision_reason}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(v) => {
          if (!v) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Record decision: {pending ? DECISION_LABEL[pending] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will be stored as the current decision for this application. You can add follow-up
              decisions later, but this action is auditable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                if (pending) void record(pending);
              }}
            >
              {busy ? "Recording…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { DefList };
