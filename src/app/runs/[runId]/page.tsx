import { PageHeader } from '@/components/page-header';
import { formatMetricValue, shortCommit } from '@/domain/evidence';
import { statusLabel } from '@/application/evidence-analysis';
import { createEvidenceContext } from '@/infrastructure/create-evidence-repository';
import { ArrowLeft, CheckCircle2, Container, GitCommit, Terminal } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { repository, source } = createEvidenceContext();
  const run = await repository.getRun((await params).runId);
  if (!run) notFound();

  return (
    <main>
      <PageHeader
        eyebrow={run.benchmarkId}
        title={run.project}
        source={source}
        actions={<span className={`status-badge ${run.status}`}>{statusLabel(run.status)}</span>}
      />
      <Link className="back-link" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        Evidence registry
      </Link>

      <section className="detail-metrics" aria-label="Benchmark metrics">
        {run.metrics.map((metric) => (
          <article key={metric.name}>
            <span>{metric.name}</span>
            <strong>
              {formatMetricValue(metric.value)} <small>{metric.unit}</small>
            </strong>
            <code>{metric.direction}</code>
          </article>
        ))}
      </section>

      <div className="detail-grid">
        <section className="detail-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Reproduction</p>
              <h2>Execution</h2>
            </div>
            <Terminal aria-hidden="true" size={20} />
          </div>
          <dl className="detail-list">
            <Detail label="Command" value={run.execution.command} mono />
            <Detail
              label="Started"
              value={new Date(run.execution.startedAt).toLocaleString('en-US')}
            />
            <Detail label="Duration" value={`${run.execution.durationSeconds.toFixed(2)} s`} />
            <Detail label="Repeats" value={String(run.execution.repeat)} />
            <Detail label="Exit code" value={String(run.execution.exitCode)} />
          </dl>
        </section>

        <section className="detail-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Provenance</p>
              <h2>Source integrity</h2>
            </div>
            <GitCommit aria-hidden="true" size={20} />
          </div>
          <dl className="detail-list">
            <Detail label="Source commit" value={run.provenance.sourceCommit} mono />
            <Detail
              label="Clean tree"
              value={run.provenance.cleanTree ? 'Verified' : 'No'}
              icon={CheckCircle2}
            />
            <Detail label="Image" value={run.provenance.imageRef} mono />
            <Detail label="Image digest" value={run.provenance.imageDigest} mono />
            <Detail label="Artifact digest" value={run.provenance.artifactDigest} mono />
          </dl>
        </section>

        <section className="detail-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workload</p>
              <h2>Comparability</h2>
            </div>
            <Container aria-hidden="true" size={20} />
          </div>
          <dl className="detail-list">
            <Detail label="Key" value={run.comparabilityKey} mono />
            <Detail label="Version" value={run.workload.version} />
            <Detail label="Warmups" value={String(run.workload.warmupIterations)} />
            <Detail label="Measured" value={String(run.workload.measuredIterations)} />
            <Detail label="Concurrency" value={String(run.workload.concurrency)} />
          </dl>
        </section>
      </div>
      <p className="run-footer">
        Run {run.runId} · commit {shortCommit(run.provenance.sourceCommit)}
      </p>
    </main>
  );
}

function Detail({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: typeof CheckCircle2;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? 'mono-value' : undefined}>
        {Icon ? <Icon aria-hidden="true" size={15} /> : null}
        {value}
      </dd>
    </div>
  );
}
