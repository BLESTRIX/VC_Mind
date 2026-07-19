import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { ApplicationSummary } from "@/api/types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CoverageBar,
  EmptyState,
  ErrorState,
  KpiCard,
  Panel,
  ScorePill,
  StatusBadge,
  TableSkeleton,
  formatDateShort,
  slaFrom,
} from "@/components/vc/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Deal Flow — VC Mind" },
      {
        name: "description",
        content:
          "Deal flow dashboard for venture-capital applications: active diligence, memo-ready deals, and approaching decision deadlines.",
      },
    ],
  }),
  component: ApplicationsPage,
});

async function listApplications(): Promise<ApplicationSummary[]> {
  if (!supabase) throw new Error("Supabase authentication is not configured.");
  const { data, error } = await supabase
    .from("application_summary_view")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApplicationSummary[];
}

const ACTIVE_STAGES = new Set([
  "extracting",
  "claims_ready",
  "screened",
  "diligence_running",
  "evidence_ready",
  "memo_draft",
]);

function ApplicationsPage() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["applications", session?.user.id],
    queryFn: listApplications,
  });

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [rec, setRec] = useState<string>("all");
  const [sla, setSla] = useState<string>("all");

  const rows = query.data ?? [];

  const kpis = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => ACTIVE_STAGES.has(r.current_stage)).length;
    const memoReady = rows.filter((r) => r.current_stage === "memo_ready").length;
    const approaching = rows.filter((r) => {
      const s = slaFrom(r.decision_deadline);
      return s.urgent || s.overdue;
    }).length;
    return { total, active, memoReady, approaching };
  }, [rows]);

  const stages = useMemo(
    () => Array.from(new Set(rows.map((r) => r.current_stage))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.company_name.toLowerCase().includes(q) && !r.application_id.toLowerCase().includes(q))
        return false;
      if (stage !== "all" && r.current_stage !== stage) return false;
      if (rec !== "all" && (r.recommendation ?? "") !== rec) return false;
      if (sla !== "all") {
        const s = slaFrom(r.decision_deadline);
        if (sla === "overdue" && !s.overdue) return false;
        if (sla === "urgent" && !(s.urgent && !s.overdue)) return false;
        if (sla === "ontrack" && (s.urgent || s.overdue)) return false;
      }
      return true;
    });
  }, [rows, search, stage, rec, sla]);

  return (
    <AppShell
      breadcrumbs={[{ label: "Deal Flow" }]}
      pageActions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", query.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link to="/applications/new">
              <Plus className="h-3.5 w-3.5" />
              New application
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deal Flow</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review incoming applications, monitor diligence, and act on committee-ready deals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total applications" value={kpis.total} icon={<Briefcase className="h-4 w-4" />} tone="primary" />
          <KpiCard label="Active diligence" value={kpis.active} icon={<Sparkles className="h-4 w-4" />} tone="info" />
          <KpiCard label="Memo ready" value={kpis.memoReady} icon={<FileText className="h-4 w-4" />} tone="success" />
          <KpiCard label="Approaching deadline" value={kpis.approaching} icon={<Clock className="h-4 w-4" />} tone="warning" />
        </div>

        <Panel
          title="Applications"
          description="All applications from the authenticated summary view."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or application ID…"
                className="pl-8"
                aria-label="Search applications"
              />
            </div>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger aria-label="Filter by stage"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {stages.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rec} onValueChange={setRec}>
              <SelectTrigger aria-label="Filter by recommendation"><SelectValue placeholder="Recommendation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All recommendations</SelectItem>
                <SelectItem value="invest">Invest</SelectItem>
                <SelectItem value="needs_more_info">Needs more info</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sla} onValueChange={setSla}>
              <SelectTrigger aria-label="Filter by SLA"><SelectValue placeholder="SLA state" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SLA states</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="urgent">Approaching</SelectItem>
                <SelectItem value="ontrack">On track</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {query.isLoading ? (
            <TableSkeleton rows={6} />
          ) : query.error ? (
            <ErrorState error={query.error} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="New applications will appear here."
              action={
                <Button asChild size="sm">
                  <Link to="/applications/new">
                    <Plus className="h-3.5 w-3.5" /> New application
                  </Link>
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="No matches" description="Try clearing filters or search." />
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Company</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="w-[180px]">Evidence coverage</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const sla = slaFrom(r.decision_deadline);
                    return (
                      <TableRow key={r.application_id} className="group">
                        <TableCell className="min-w-[220px]">
                          <Link
                            to="/applications/$id"
                            params={{ id: r.application_id }}
                            className="block"
                          >
                            <div className="font-medium text-foreground group-hover:text-primary">
                              {r.company_name}
                            </div>
                            <code
                              className="text-[10px] text-muted-foreground/80"
                              title={r.application_id}
                            >
                              {r.application_id.slice(0, 8)}…
                            </code>
                          </Link>
                        </TableCell>
                        <TableCell><StatusBadge value={r.current_stage} /></TableCell>
                        <TableCell><StatusBadge value={r.recommendation} kind="recommendation" /></TableCell>
                        <TableCell className="text-right"><ScorePill value={r.investment_score} /></TableCell>
                        <TableCell className="min-w-[180px]">
                          <CoverageBar value={r.calculated_evidence_coverage} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular">
                          {formatDateShort(r.submitted_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular">
                          {formatDateShort(r.decision_deadline)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs font-medium tabular",
                              sla.overdue && "text-destructive",
                              sla.urgent && !sla.overdue && "text-warning",
                              !sla.urgent && !sla.overdue && "text-muted-foreground",
                            )}
                          >
                            {sla.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/applications/$id" params={{ id: r.application_id }}>
                              Open <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
