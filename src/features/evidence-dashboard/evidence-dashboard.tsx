'use client';

import {
  filterRuns,
  listProjects,
  statusLabel,
  summarizeRuns,
} from '@/application/evidence-analysis';
import type { EvidenceSource } from '@/application/evidence-repository';
import { formatMetricValue, primaryMetric, shortCommit } from '@/domain/evidence';
import type { EvidenceRun, EvidenceStatus } from '@/domain/evidence';
import { EvidenceChart } from '@/features/evidence-dashboard/evidence-chart';
import {
  ArrowRight,
  CheckCircle2,
  FilterX,
  GitCompareArrows,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react';

const statuses: EvidenceStatus[] = [
  'publication_approved',
  'accepted',
  'quarantined',
  'publication_rejected',
];

export function EvidenceDashboard({
  runs,
  source,
}: {
  runs: EvidenceRun[];
  source: EvidenceSource;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState<EvidenceStatus | ''>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const projects = useMemo(() => listProjects(runs), [runs]);
  const visibleRuns = useMemo(
    () =>
      filterRuns(runs, {
        query: deferredQuery,
        project: project || undefined,
        status: status || undefined,
      }),
    [deferredQuery, project, runs, status],
  );
  const summary = useMemo(() => summarizeRuns(visibleRuns), [visibleRuns]);

  function applyFilter(update: () => void) {
    update();
    setRevision((current) => current + 1);
  }

  function toggleRun(runId: string) {
    setSelected((current) => {
      if (current.includes(runId)) return current.filter((id) => id !== runId);
      if (current.length >= 2) return [current[1], runId];
      return [...current, runId];
    });
  }

  function clearFilters() {
    setQuery('');
    setProject('');
    setStatus('');
    setRevision((current) => current + 1);
  }

  return (
    <>
      <div className="dashboard-summary" aria-label="Evidence summary">
        <SummaryItem label="Visible runs" value={String(summary.runCount)} icon={ShieldCheck} />
        <SummaryItem label="Projects" value={String(summary.projectCount)} icon={CheckCircle2} />
        <SummaryItem label="Approved" value={String(summary.approvedCount)} icon={CheckCircle2} />
        <SummaryItem
          label="Zero-failure runs"
          value={`${summary.zeroFailureRate.toFixed(0)}%`}
          icon={ShieldCheck}
        />
      </div>

      <section className="toolbar" aria-label="Evidence filters">
        <label className="search-control">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Search evidence</span>
          <input
            data-testid="evidence-search"
            value={query}
            onChange={(event) => applyFilter(() => setQuery(event.target.value))}
            placeholder="Search project, benchmark, run, commit"
          />
        </label>
        <label>
          <span className="sr-only">Filter project</span>
          <select
            data-testid="project-filter"
            value={project}
            onChange={(event) => applyFilter(() => setProject(event.target.value))}
          >
            <option value="">All projects</option>
            {projects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter status</span>
          <select
            data-testid="status-filter"
            value={status}
            onChange={(event) =>
              applyFilter(() => setStatus(event.target.value as EvidenceStatus | ''))
            }
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <button className="icon-button" onClick={clearFilters} title="Clear filters" type="button">
          <FilterX aria-hidden="true" size={18} />
          <span className="sr-only">Clear filters</span>
        </button>
      </section>

      <div className="dashboard-grid">
        <section className="panel chart-panel" aria-labelledby="coverage-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Coverage</p>
              <h2 id="coverage-heading">Evidence by project</h2>
            </div>
            <span className="result-count">{visibleRuns.length} runs</span>
          </div>
          <EvidenceChart runs={visibleRuns} revision={revision} />
        </section>

        <aside className="panel compare-panel" aria-labelledby="selection-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Selection</p>
              <h2 id="selection-heading">Compare runs</h2>
            </div>
            <GitCompareArrows aria-hidden="true" size={20} />
          </div>
          <div className="selection-list">
            {[0, 1].map((index) => {
              const run = runs.find((candidate) => candidate.runId === selected[index]);
              return run ? (
                <button key={run.runId} type="button" onClick={() => toggleRun(run.runId)}>
                  <span>{run.project}</span>
                  <strong>{primaryMetric(run).name}</strong>
                </button>
              ) : (
                <div className="empty-selection" key={index}>
                  Run {index + 1}
                </div>
              );
            })}
          </div>
          <button
            className="primary-button"
            type="button"
            disabled={selected.length !== 2}
            onClick={() => router.push(`/compare?runs=${selected.join(',')}`)}
          >
            Compare selected
            <ArrowRight aria-hidden="true" size={17} />
          </button>
          <p className="source-note">Source: {source.label}</p>
        </aside>
      </div>

      <section className="evidence-table-section" aria-labelledby="runs-heading">
        <div className="section-heading table-heading">
          <div>
            <p className="eyebrow">Registry</p>
            <h2 id="runs-heading">Benchmark runs</h2>
          </div>
          <span className="result-count">{visibleRuns.length} visible</span>
        </div>
        <div className="table-scroll">
          <table className="evidence-table">
            <thead>
              <tr>
                <th className="select-column">
                  <span className="sr-only">Select</span>
                </th>
                <th>Project</th>
                <th>Benchmark</th>
                <th>Primary result</th>
                <th>Status</th>
                <th>Commit</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRuns.map((run) => {
                const metric = primaryMetric(run);
                const checked = selected.includes(run.runId);
                return (
                  <tr key={run.runId} data-testid="evidence-row">
                    <td>
                      <input
                        aria-label={`Select ${run.project} run ${run.runId}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRun(run.runId)}
                      />
                    </td>
                    <td>
                      <strong>{run.project}</strong>
                      <span className="run-id">{run.runId.slice(-8)}</span>
                    </td>
                    <td>{run.benchmarkId}</td>
                    <td>
                      <strong className="metric-value">{formatMetricValue(metric.value)}</strong>{' '}
                      <span>{metric.unit}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${run.status}`}>
                        {statusLabel(run.status)}
                      </span>
                    </td>
                    <td>
                      <code>{shortCommit(run.provenance.sourceCommit)}</code>
                    </td>
                    <td>
                      <Link
                        className="row-link"
                        href={`/runs/${run.runId}`}
                        title="Open run details"
                      >
                        <ArrowRight aria-hidden="true" size={17} />
                        <span className="sr-only">Open run details</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {visibleRuns.length === 0 ? (
                <tr>
                  <td className="empty-table" colSpan={7}>
                    No evidence matches the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function SummaryItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="summary-item">
      <span className="summary-icon">
        <Icon aria-hidden="true" size={18} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
