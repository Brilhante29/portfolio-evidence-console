import type { EvidenceSource } from '@/application/evidence-repository';
import { Database, Radio } from 'lucide-react';

export function PageHeader({
  eyebrow,
  title,
  source,
  actions,
}: {
  eyebrow: string;
  title: string;
  source?: EvidenceSource;
  actions?: React.ReactNode;
}) {
  const SourceIcon = source?.mode === 'graphql' ? Radio : Database;
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="page-header-actions">
        {source ? (
          <span className={`source-indicator ${source.mode}`}>
            <SourceIcon aria-hidden="true" size={15} />
            {source.label}
          </span>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
