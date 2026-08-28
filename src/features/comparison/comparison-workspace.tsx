'use client';

import type { EvidenceComparison, EvidenceRun } from '@/domain/evidence';
import { formatMetricValue, primaryMetric, shortCommit } from '@/domain/evidence';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ComparisonWorkspace({
  runs,
  initialIds,
  comparison,
}: {
  runs: EvidenceRun[];
  initialIds: string[];
  comparison?: EvidenceComparison;
}) {
  const router = useRouter();
  const [baseline, setBaseline] = useState(initialIds[0] ?? '');
  const [candidate, setCandidate] = useState(initialIds[1] ?? '');

  function compare() {
    if (baseline && candidate && baseline !== candidate) {
      router.push(`/compare?runs=${baseline},${candidate}`);
    }
  }

  return (
    <>
      <section className="comparison-controls" aria-label="Comparison selection">
        <RunSelect label="Baseline" value={baseline} onChange={setBaseline} runs={runs} />
        <ArrowRight className="comparison-arrow" aria-hidden="true" size={20} />
        <RunSelect label="Candidate" value={candidate} onChange={setCandidate} runs={runs} />
        <button
          className="primary-button"
          type="button"
          disabled={!baseline || !candidate || baseline === candidate}
          onClick={compare}
        >
          Compare
        </button>
      </section>

      {comparison ? <ComparisonResult comparison={comparison} /> : <ComparisonEmpty />}
    </>
  );
}

function RunSelect({
  label,
  value,
  onChange,
  runs,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  runs: EvidenceRun[];
}) {
  return (
    <label className="run-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select a run</option>
        {runs.map((run) => (
          <option key={run.runId} value={run.runId}>
            {run.project} · {primaryMetric(run).name} · {shortCommit(run.provenance.sourceCommit)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparisonResult({ comparison }: { comparison: EvidenceComparison }) {
  return (
    <section className="comparison-result" aria-live="polite">
      <div
        className={comparison.comparable ? 'comparison-status valid' : 'comparison-status invalid'}
      >
        {comparison.comparable ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <AlertTriangle aria-hidden="true" />
        )}
        <div>
          <strong>{comparison.comparable ? 'Comparable evidence' : 'Comparison blocked'}</strong>
          <span>{comparison.reason ?? comparison.comparabilityKey}</span>
        </div>
      </div>

      <div className="run-comparison-grid">
        {comparison.runs.map((run, index) => {
          const metric = primaryMetric(run);
          return (
            <article className="run-comparison-card" key={run.runId}>
              <span>{index === 0 ? 'Baseline' : 'Candidate'}</span>
              <h2>{run.project}</h2>
              <strong>
                {formatMetricValue(metric.value)} {metric.unit}
              </strong>
              <code>{shortCommit(run.provenance.sourceCommit)}</code>
            </article>
          );
        })}
      </div>

      {comparison.metricDeltas.length > 0 ? (
        <div className="delta-table">
          <div className="delta-row delta-header">
            <span>Metric</span>
            <span>Absolute</span>
            <span>Percent</span>
          </div>
          {comparison.metricDeltas.map((delta) => (
            <div className="delta-row" key={delta.metricName}>
              <strong>{delta.metricName}</strong>
              <span>
                {delta.absoluteDelta > 0 ? '+' : ''}
                {formatMetricValue(delta.absoluteDelta)} {delta.unit}
              </span>
              <span>
                {delta.percentDelta === undefined
                  ? 'n/a'
                  : `${delta.percentDelta > 0 ? '+' : ''}${delta.percentDelta.toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ComparisonEmpty() {
  return (
    <section className="empty-state">
      <div className="empty-state-mark">01:02</div>
      <h2>No active comparison</h2>
      <p>Select two runs. Compatibility is decided by the evidence contract.</p>
    </section>
  );
}
