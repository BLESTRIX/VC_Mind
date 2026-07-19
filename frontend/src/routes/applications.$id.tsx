import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Trash2,
} from "lucide-react";
import { applicationsApi } from "@/api/applications";
import type { Stage, StageEvent } from "@/api/types";
import { supabase } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CoverageBar,
  DefList,
  ErrorState,
  KpiCard,
  LoadingBlock,
  Panel,
  ScorePill,
  StatusBadge,
  Unavailable,
  formatDate,
  formatDateShort,
  formatNumber,
  slaFrom,
} from "@/components/vc/primitives";
import {
  ClaimsPanel,
  DecisionPanel,
  InformationRequestsPanel,
  MemoPanel,
  PipelineTimeline,
  ScoresPanel,
} from "@/components/vc/DiligenceSections";
import { cn } from "@/lib/utils";
import { PrivateDiligencePanel } from "@/components/vc/PrivateDiligencePanel";

export const Route = createFileRoute("/applications/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Application ${params.id.slice(0, 8)} — VC Mind` },
      {
        name: "description",
        content:
          "Diligence workspace: pipeline, claims and evidence, scoring, memo, information requests, and decision.",
      },
    ],
  }),
  component: ApplicationDetailPage,
});

export const TERMINAL_STAGES = new Set<Stage>([
  "memo_ready",
  "approved",
  "passed",
  "needs_more_info",
  "failed",
]);
export const shouldPoll = (stage: Stage | undefined) =>
  Boolean(stage && !TERMINAL_STAGES.has(stage));

async function timeline(id: string): Promise<StageEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("application_stage_events")
    .select("*")
    .eq("application_id", id)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as StageEvent[];
}

function ApplicationDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [stopOpen, setStopOpen] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [stopError, setStopError] = useState("");

  const status = useQuery({
    queryKey: ["status", id],
    queryFn: () => applicationsApi.status(id),
    refetchInterval: (q) => (shouldPoll(q.state.data?.current_stage) ? 4000 : false),
  });
  const polling = shouldPoll(status.data?.current_stage);
  const interval: number | false = polling ? 4000 : false;

  const application = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationsApi.get(id),
    refetchInterval: interval,
  });
  const events = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => timeline(id),
    refetchInterval: interval,
  });
  const claims = useQuery({
    queryKey: ["claims", id],
    queryFn: () => applicationsApi.claims(id),
    refetchInterval: interval,
  });
  const evidence = useQuery({
    queryKey: ["evidence", id],
    queryFn: () => applicationsApi.evidence(id),
    refetchInterval: interval,
  });
  const scores = useQuery({
    queryKey: ["scores", id],
    queryFn: () => applicationsApi.scores(id),
    refetchInterval: interval,
  });
  const scoreFactors=useQuery({queryKey:["score-factors",id],queryFn:()=>applicationsApi.scoreFactors(id),refetchInterval:interval});
  const slaStatus=useQuery({queryKey:["sla",id],queryFn:()=>applicationsApi.sla(id),refetchInterval:interval});
  const modelRuns=useQuery({queryKey:["model-runs",id],queryFn:()=>applicationsApi.modelRuns(id),enabled:import.meta.env.DEV,refetchInterval:interval});
  const memos = useQuery({
    queryKey: ["memos", id],
    queryFn: () => applicationsApi.memos(id),
    refetchInterval: interval,
  });
  const requests = useQuery({
    queryKey: ["requests", id],
    queryFn: () => applicationsApi.requests(id),
    refetchInterval: interval,
  });
  const decisions = useQuery({
    queryKey: ["decisions", id],
    queryFn: () => applicationsApi.decisions(id),
  });

  const active = status.data?.jobs.some((j) => j.status === "pending" || j.status === "running");
  const currentMemo = memos.data?.find((m) => m.is_current) ?? null;

  const refresh = () =>
    queryClient.invalidateQueries({
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.includes(id),
    });
  const run = async () => {
    await applicationsApi.run(id);
    await refresh();
  };
  const resume = async () => {
    await applicationsApi.resume(id);
    await refresh();
  };
  const stop = async () => {
    setStopping(true);
    setStopError("");
    try {
      await applicationsApi.cancel(id);
      await refresh();
      setStopOpen(false);
    } catch (error) {
      setStopError(error instanceof Error ? error.message : "Diligence could not be stopped.");
    } finally {
      setStopping(false);
    }
  };
  const remove = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await applicationsApi.remove(id);
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await navigate({ to: "/" });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Application deletion failed.");
      setDeleting(false);
    }
  };

  if (application.isLoading || status.isLoading)
    return (
      <AppShell breadcrumbs={[{ label: "Deal Flow", to: "/" }, { label: "Loading…" }]}>
        <LoadingBlock label="Loading application…" />
      </AppShell>
    );

  if (application.error)
    return (
      <AppShell breadcrumbs={[{ label: "Deal Flow", to: "/" }, { label: "Error" }]}>
        <ErrorState error={application.error} />
      </AppShell>
    );

  const app = application.data!;
  const sla = slaFrom(app.decision_deadline);
  const stage = status.data?.current_stage ?? app.current_stage;
  const primary = app.application_founders.find((f) => f.is_primary_contact) ?? app.application_founders[0];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Deal Flow", to: "/" },
        { label: app.companies.name },
      ]}
      pageActions={
        <>
          {active && (
            <AlertDialog open={stopOpen} onOpenChange={(open) => { setStopOpen(open); if (!open) setStopError(""); }}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Square className="h-3.5 w-3.5 fill-current" /> Stop diligence
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Stop diligence for {app.companies.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pending and running pipeline jobs will be cancelled. You can start diligence again later or delete the application after it stops.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {stopError && (
                  <Alert variant="destructive">
                    <AlertTitle>Could not stop diligence</AlertTitle>
                    <AlertDescription>{stopError}</AlertDescription>
                  </Alert>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={stopping}>Keep running</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={stopping}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(event) => { event.preventDefault(); void stop(); }}
                  >
                    {stopping ? "Stopping…" : "Stop diligence"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteError(""); }}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {app.companies.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the application, its pitch deck, diligence jobs, claims,
                  evidence, scores, memos, and decisions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && (
                <Alert variant="destructive">
                  <AlertTitle>Deletion failed</AlertTitle>
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={(event) => { event.preventDefault(); void remove(); }}
                >
                  {deleting ? "Deleting…" : "Delete application"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            disabled={application.isFetching}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", application.isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          {!TERMINAL_STAGES.has(app.current_stage) && app.current_stage !== "failed" && (
            <Button size="sm" onClick={() => void run()} disabled={active}>
              <Play className="h-3.5 w-3.5" />
              {active ? "Diligence running" : "Start diligence"}
            </Button>
          )}
          {app.current_stage === "failed" && (
            <Button size="sm" variant="destructive" onClick={() => void resume()}>
              <RotateCcw className="h-3.5 w-3.5" /> Resume failed stage
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <header className="rounded-lg border border-border/70 bg-card p-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Deal Flow
          </Link>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                  {app.companies.name}
                </h1>
                <StatusBadge value={stage} />
                {active && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-info/30 bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-info" />
                    Diligence running
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {app.companies.stage && <span className="capitalize">{app.companies.stage}</span>}
                {app.companies.sector && <span>· {app.companies.sector}</span>}
                {app.companies.geography && <span>· {app.companies.geography}</span>}
                {app.companies.website_url && (
                  <a
                    href={app.companies.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {new URL(app.companies.website_url).hostname}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <span>·</span>
                <code className="text-[10px]" title={app.id}>{app.id}</code>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={app.recommendation} kind="recommendation" />
            </div>
          </div>

          {app.failure_reason && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Pipeline failure</AlertTitle>
              <AlertDescription>{app.failure_reason}</AlertDescription>
            </Alert>
          )}
          {app.recommendation&&<Alert className="mt-4 border-warning/40 bg-warning/10"><AlertTitle>Experimental MVP Recommendation</AlertTitle><AlertDescription>This recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes.<br/><span className="text-xs">MVP v1 — uncalibrated heuristic thresholds</span></AlertDescription></Alert>}

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Recommendation"
              value={<StatusBadge value={app.recommendation} kind="recommendation" className="text-sm" />}
              hint={`Stage · ${(stage ?? "").replaceAll("_", " ")}`}
            />
            <KpiCard
              label="Investment score"
              value={<ScorePill value={app.investment_score} className="text-lg" />}
              hint="0–10 weighted score"
            />
            <KpiCard
              label="Evidence coverage"
              value={
                <span className="tabular">
                  {app.evidence_coverage !== null
                    ? `${Number(app.evidence_coverage).toFixed(0)}%`
                    : "—"}
                </span>
              }
              hint={<CoverageBar value={app.evidence_coverage ?? 0} showLabel={false} />}
            />
            <KpiCard
              label="SLA"
              value={<span className={cn(sla.overdue && "text-destructive", sla.urgent && !sla.overdue && "text-warning")}>{sla.label}</span>}
              hint={`Deadline ${formatDateShort(app.decision_deadline)}`}
              tone={sla.overdue ? "destructive" : sla.urgent ? "warning" : "muted"}
            />
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="sticky top-12 z-20 -mx-2 border-b border-border/70 bg-background/85 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {[
                { v: "overview", l: "Overview" },
                { v: "pipeline", l: "Pipeline" },
                { v: "claims", l: "Claims & Evidence" },
                { v: "scoring", l: "Scoring" },
                { v: "memo", l: "Memo" },
                { v: "requests", l: "Information requests" },
                { v: "private", l: "Private diligence" },
                { v: "decision", l: "Decision" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Panel title="Company & application">
              <DefList
                items={[
                  { label: "Company", value: app.companies.name },
                  { label: "Sector", value: app.companies.sector ?? <Unavailable /> },
                  { label: "Stage", value: app.companies.stage ?? <Unavailable /> },
                  { label: "Geography", value: app.companies.geography ?? <Unavailable /> },
                  {
                    label: "Website",
                    value: app.companies.website_url ? (
                      <a
                        href={app.companies.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {new URL(app.companies.website_url).hostname}
                      </a>
                    ) : (
                      <Unavailable />
                    ),
                  },
                  { label: "Submitted", value: formatDate(app.submitted_at) },
                  { label: "Deadline", value: formatDate(app.decision_deadline) },
                  { label: "Application ID", value: <code className="text-xs">{app.id}</code> },
                  {
                    label: "Primary contact",
                    value: primary?.founders?.full_name ?? <Unavailable />,
                  },
                ]}
              />
              {app.companies.product_description && (
                <div className="mt-5 rounded-md border border-border/60 bg-background p-4">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Product description
                  </div>
                  <p className="max-w-[72ch] text-sm leading-relaxed">
                    {app.companies.product_description}
                  </p>
                </div>
              )}
            </Panel>

            <Panel title="Founders">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {app.application_founders.map((f, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border/60 bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{f.founders.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {f.role_at_submission ?? "—"}
                        </div>
                      </div>
                      {f.is_primary_contact && (
                        <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {f.founders.email && (
                        <a href={`mailto:${f.founders.email}`} className="text-primary hover:underline">
                          {f.founders.email}
                        </a>
                      )}
                      {f.founders.linkedin_url && (
                        <a
                          href={f.founders.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {f.founders.github_url && (
                        <a
                          href={f.founders.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Diligence signals">
              <DefList
                items={[
                  { label: "Current stage", value: <StatusBadge value={stage} /> },
                  {
                    label: "Recommendation",
                    value: <StatusBadge value={app.recommendation} kind="recommendation" />,
                  },
                  {
                    label: "Investment score",
                    value: <ScorePill value={app.investment_score} />,
                  },
                  {
                    label: "Evidence coverage",
                    value: formatNumber(app.evidence_coverage, 1) + "%",
                  },
                  { label: "Critical contradiction", value: <Unavailable>Not exposed by API</Unavailable> },
                  { label: "Triggered rules", value: <Unavailable>Not exposed by API</Unavailable> },
                  { label: "Blocking issues", value: <Unavailable>Not exposed by API</Unavailable> },
                ]}
              />
            </Panel>

            {status.error && <ErrorState error={status.error} />}
          </TabsContent>

          <TabsContent value="pipeline">
            {slaStatus.data&&<Panel title="24-hour SLA" description="Operational deadline protection and stage budgets."><DefList items={[{label:"24-hour deadline",value:formatDate(slaStatus.data.deadline)},{label:"Overall SLA state",value:<StatusBadge value={slaStatus.data.status}/>},{label:"Time remaining",value:`${Math.floor(slaStatus.data.totalRemainingSeconds/3600)}h ${Math.floor(slaStatus.data.totalRemainingSeconds%3600/60)}m`},{label:"Current-stage budget",value:`${slaStatus.data.currentStageBudgetSeconds}s`},{label:"Stage budget consumed",value:`${slaStatus.data.currentStageBudgetUsedPercentage.toFixed(1)}%`},{label:"Blocking item",value:slaStatus.data.blockingReasons.join(" · ")||"None"},{label:"Fallback actions taken",value:slaStatus.data.fallbackActions.join(" · ")||"None"}]}/></Panel>}
            {import.meta.env.DEV&&modelRuns.data&&<Panel title="AI execution details" description="Developer diagnostics; prompts and private source content are not exposed."><ul className="space-y-2">{modelRuns.data.map(run=><li key={run.id} className="rounded border border-border/60 p-2 text-xs"><span className="font-medium">{run.is_fallback?'Fallback':'Primary'} · {run.provider} · {run.model_name}</span><span className="ml-2 text-muted-foreground">{run.prompt_version} · {run.latency_ms??'—'} ms · {run.status}{run.fallback_reason?` · ${run.fallback_reason}`:''}</span></li>)}</ul></Panel>}
            <PipelineTimeline
              events={events.data ?? []}
              jobs={status.data?.jobs ?? []}
              currentStage={stage}
              active={Boolean(active)}
            />
          </TabsContent>

          <TabsContent value="claims">
            {claims.error ? (
              <ErrorState error={claims.error} />
            ) : (
              <ClaimsPanel claims={claims.data ?? []} evidence={evidence.data ?? []} />
            )}
          </TabsContent>

          <TabsContent value="scoring">
            {scores.error ? <ErrorState error={scores.error} /> : <ScoresPanel scores={scores.data ?? []} factors={scoreFactors.data??[]} />}
          </TabsContent>

          <TabsContent value="memo">
            {memos.error ? <ErrorState error={memos.error} /> : <MemoPanel memo={currentMemo} />}
          </TabsContent>

          <TabsContent value="requests">
            {requests.error ? (
              <ErrorState error={requests.error} />
            ) : (
              <InformationRequestsPanel requests={requests.data ?? []} />
            )}
          </TabsContent>

          <TabsContent value="decision">
            {decisions.error ? (
              <ErrorState error={decisions.error} />
            ) : (
              <DecisionPanel
                decisions={decisions.data ?? []}
                {...(currentMemo ? { memoId: currentMemo.id } : {})}
                onSubmit={async (payload) => {
                  await applicationsApi.decide(id, payload);
                  await refresh();
                }}
              />
            )}
          </TabsContent>
          <TabsContent value="private">
            <PrivateDiligencePanel applicationId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

// Silence unused-import warning; kept for future memo cross-linking.
void FileText;
