import type { ReactNode } from 'react';

import type { Claim, Decision, Evidence, InformationRequest, Job, Memo, Score, Stage, StageEvent } from '../api/types';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ClaimsPanel, DecisionPanel, EvidenceCard, InformationRequestsPanel as CurrentInformationRequestsPanel, MemoPanel as CurrentMemoPanel, PipelineTimeline as CurrentPipelineTimeline, ScoresPanel } from './vc/DiligenceSections';
import { Badge, EmptyState, Panel, ScorePill, StatusBadge, formatDate, formatDateShort, formatNumber, humanize, slaFrom } from './vc/primitives';

export function ClaimsTable({ claims }: { claims: Claim[] }) {
  return (
    <Panel title="Claims">
      {claims.length === 0 ? (
        <EmptyState title="No claims extracted yet" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="max-w-[32rem]">{claim.claim_text}</TableCell>
                  <TableCell className="capitalize">{humanize(claim.category)}</TableCell>
                  <TableCell><StatusBadge value={claim.importance} /></TableCell>
                  <TableCell><StatusBadge value={claim.verification_status} /></TableCell>
                  <TableCell>{claim.evidence_confidence === null ? '—' : `${(claim.evidence_confidence * 100).toFixed(0)}%`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  );
}

export function EvidenceTable({ evidence }: { evidence: Evidence[]; claims?: Claim[] }) {
  return (
    <Panel title="Evidence">
      {evidence.length === 0 ? (
        <EmptyState title="No evidence collected yet" />
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <div key={item.id} className="rounded-md border border-border/60 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={item.relationship} />
                <StatusBadge value={item.validation_status} />
                {item.source_quality !== null && <span className="text-xs text-muted-foreground">Quality {formatNumber(item.source_quality)}</span>}
              </div>
              <p className="mt-2 text-sm text-foreground/90">{item.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function ScoresTable({ scores }: { scores: Score[] }) {
  return <ScoresPanel scores={scores} />;
}

export function MemoPanel({ memo }: { memo: Memo | null }) {
  return <CurrentMemoPanel memo={memo} />;
}

export function InformationRequestsPanel({ requests }: { requests: InformationRequest[] }) {
  return <CurrentInformationRequestsPanel requests={requests} />;
}

export function DecisionForm({ decisions, memoId, onSubmit }: { decisions: Decision[]; memoId?: string; onSubmit: (payload: { memoId?: string; decision: string; reason: string }) => Promise<void>; }) {
  return <DecisionPanel decisions={decisions} memoId={memoId} onSubmit={onSubmit} />;
}

export function PipelineTimeline({ events, jobs }: { events: StageEvent[]; jobs: Job[] }) {
  const currentStage = (events.at(-1)?.stage ?? 'submitted') as Stage;
  const active = jobs.some((job) => job.status === 'pending' || job.status === 'running');
  return <CurrentPipelineTimeline events={events} jobs={jobs} currentStage={currentStage} active={active} />;
}
