import type { ReactNode } from 'react';

import { Badge, EmptyState, ErrorState, LoadingBlock, Panel, formatDate, formatNumber } from './vc/primitives';

export { Badge, formatDate, formatNumber };

export function Loading() {
  return <LoadingBlock />;
}

export function ErrorMessage({ error }: { error: unknown }) {
  return <ErrorState error={error} />;
}

export function Empty({ children }: { children: ReactNode }) {
  return <EmptyState title={typeof children === 'string' ? children : 'No data'} />;
}

export function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return <Panel title={title}>{children}</Panel>;
}
