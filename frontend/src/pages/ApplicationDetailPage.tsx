import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { applicationsApi } from '../api/applications';
import type { Stage, StageEvent } from '../api/types';
import { supabase } from '../lib/supabase';
import { Badge, ErrorMessage, formatDate, formatNumber, Loading, Section } from '../components/Common';
import { ClaimsTable, DecisionForm, EvidenceTable, InformationRequestsPanel, MemoPanel, PipelineTimeline, ScoresTable } from '../components/DiligenceSections';

export const TERMINAL_STAGES = new Set<Stage>(['memo_ready', 'approved', 'passed', 'needs_more_info', 'failed']);
export const shouldPoll = (stage: Stage | undefined) => Boolean(stage && !TERMINAL_STAGES.has(stage));

async function timeline(id: string): Promise<StageEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('application_stage_events').select('*').eq('application_id', id).order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as StageEvent[];
}

export function ApplicationDetailPage() {
  const { id: routeId } = useParams();
  const queryClient = useQueryClient();
  if (!routeId) return <main><ErrorMessage error={new Error('Application ID is missing.')} /></main>;
  const id = routeId;
  const status = useQuery({ queryKey: ['status', id], queryFn: () => applicationsApi.status(id), refetchInterval: (query) => shouldPoll(query.state.data?.current_stage) ? 4000 : false });
  const polling = shouldPoll(status.data?.current_stage);
  const interval = polling ? 4000 : false;
  const application = useQuery({ queryKey: ['application', id], queryFn: () => applicationsApi.get(id), refetchInterval: interval });
  const events = useQuery({ queryKey: ['timeline', id], queryFn: () => timeline(id), refetchInterval: interval });
  const claims = useQuery({ queryKey: ['claims', id], queryFn: () => applicationsApi.claims(id), refetchInterval: interval });
  const evidence = useQuery({ queryKey: ['evidence', id], queryFn: () => applicationsApi.evidence(id), refetchInterval: interval });
  const scores = useQuery({ queryKey: ['scores', id], queryFn: () => applicationsApi.scores(id), refetchInterval: interval });
  const memos = useQuery({ queryKey: ['memos', id], queryFn: () => applicationsApi.memos(id), refetchInterval: interval });
  const requests = useQuery({ queryKey: ['requests', id], queryFn: () => applicationsApi.requests(id), refetchInterval: interval });
  const decisions = useQuery({ queryKey: ['decisions', id], queryFn: () => applicationsApi.decisions(id) });
  const active = status.data?.jobs.some((job) => job.status === 'pending' || job.status === 'running');
  const currentMemo = memos.data?.find((memo) => memo.is_current) ?? null;
  const refresh = () => queryClient.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes(id) });
  const run = async () => { await applicationsApi.run(id); await refresh(); };
  const resume = async () => { await applicationsApi.resume(id); await refresh(); };

  if (application.isLoading || status.isLoading) return <main><Loading /></main>;
  if (application.error) return <main><ErrorMessage error={application.error} /></main>;
  const app = application.data!;
  return <main>
    <div className="page-title"><div><Link to="/">← Applications</Link><h1>{app.companies.name}</h1><code>{app.id}</code></div><div className="actions"><button className="secondary" onClick={() => void refresh()}>Refresh</button>{!TERMINAL_STAGES.has(app.current_stage) && app.current_stage !== 'failed' && <button disabled={active} onClick={() => void run()}>{active ? 'Diligence running' : 'Start Diligence'}</button>}{app.current_stage === 'failed' && <button onClick={() => void resume()}>Resume / Retry Failed Stage</button>}</div></div>
    {status.error && <ErrorMessage error={status.error} />}
    <Section title="Application summary"><dl className="summary-grid"><dt>Company</dt><dd>{app.companies.name}</dd><dt>Current stage</dt><dd><Badge value={status.data?.current_stage ?? app.current_stage} /></dd><dt>Recommendation</dt><dd><Badge value={app.recommendation} /></dd><dt>Investment score</dt><dd>{formatNumber(app.investment_score)}</dd><dt>Evidence coverage</dt><dd>{formatNumber(app.evidence_coverage)}%</dd><dt>Decision deadline</dt><dd>{formatDate(app.decision_deadline)}</dd><dt>Remaining SLA</dt><dd>{new Date(app.decision_deadline).getTime() > Date.now() ? `${Math.ceil((new Date(app.decision_deadline).getTime() - Date.now()) / 3600000)} hours` : 'Expired'}</dd><dt>Critical contradiction</dt><dd>Not exposed by backend API</dd><dt>Triggered rules</dt><dd>Not exposed by backend API</dd><dt>Blocking issues</dt><dd>Not exposed by backend API</dd></dl>{app.failure_reason && <p className="error">{app.failure_reason}</p>}</Section>
    <PipelineTimeline events={events.data ?? []} jobs={status.data?.jobs ?? []} />
    <ClaimsTable claims={claims.data ?? []} />
    <EvidenceTable evidence={evidence.data ?? []} claims={claims.data ?? []} />
    <ScoresTable scores={scores.data ?? []} />
    <MemoPanel memo={currentMemo} />
    <InformationRequestsPanel requests={requests.data ?? []} />
    <DecisionForm decisions={decisions.data ?? []} {...(currentMemo ? { memoId: currentMemo.id } : {})} onSubmit={async (payload) => { await applicationsApi.decide(id, payload); await refresh(); }} />
    {[events, claims, evidence, scores, memos, requests, decisions].map((query, index) => query.error ? <ErrorMessage key={index} error={query.error} /> : null)}
  </main>;
}
