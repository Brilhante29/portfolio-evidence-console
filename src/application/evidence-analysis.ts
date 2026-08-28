import type { EvidenceFilters } from '@/application/evidence-repository';
import type {
  EvidenceComparison,
  EvidenceRun,
  EvidenceStatus,
  MetricDelta,
} from '@/domain/evidence';
import { primaryMetric } from '@/domain/evidence';

export interface DashboardSummary {
  runCount: number;
  projectCount: number;
  approvedCount: number;
  zeroFailureRate: number;
}

export function summarizeRuns(runs: EvidenceRun[]): DashboardSummary {
  const projects = new Set(runs.map((run) => run.project));
  const approvedCount = runs.filter((run) => run.status === 'publication_approved').length;
  const zeroFailures = runs.filter((run) => run.metrics.every((metric) => metric.failures === 0));

  return {
    runCount: runs.length,
    projectCount: projects.size,
    approvedCount,
    zeroFailureRate: runs.length === 0 ? 0 : (zeroFailures.length / runs.length) * 100,
  };
}

export function filterRuns(
  runs: EvidenceRun[],
  filters: Pick<EvidenceFilters, 'project' | 'status'> & { query?: string },
): EvidenceRun[] {
  const query = filters.query?.trim().toLowerCase() ?? '';
  return runs.filter((run) => {
    if (filters.project && run.project !== filters.project) return false;
    if (filters.status && run.status !== filters.status) return false;
    if (!query) return true;
    return [run.project, run.benchmarkId, run.runId, run.provenance.sourceCommit]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

export function listProjects(runs: EvidenceRun[]): string[] {
  return [...new Set(runs.map((run) => run.project))].sort();
}

export function listMetricNames(runs: EvidenceRun[]): string[] {
  return [...new Set(runs.flatMap((run) => run.metrics.map((metric) => metric.name)))].sort();
}

export function compareEvidenceRuns(runs: EvidenceRun[]): EvidenceComparison {
  if (runs.length !== 2) {
    return { comparable: false, reason: 'Select exactly two runs.', runs, metricDeltas: [] };
  }

  const [baseline, candidate] = runs;
  if (baseline.comparabilityKey !== candidate.comparabilityKey) {
    return {
      comparable: false,
      reason: 'Comparability keys differ. Workloads or environments are not equivalent.',
      runs,
      metricDeltas: [],
    };
  }

  const candidateByMetric = new Map(candidate.metrics.map((metric) => [metric.name, metric]));
  const metricDeltas: MetricDelta[] = baseline.metrics.flatMap((metric) => {
    const next = candidateByMetric.get(metric.name);
    if (!next || next.unit !== metric.unit) return [];
    const absoluteDelta = next.value - metric.value;
    return [
      {
        metricName: metric.name,
        unit: metric.unit,
        baselineRunId: baseline.runId,
        candidateRunId: candidate.runId,
        absoluteDelta,
        percentDelta: metric.value === 0 ? undefined : (absoluteDelta / metric.value) * 100,
      },
    ];
  });

  return {
    comparable: metricDeltas.length > 0,
    reason: metricDeltas.length > 0 ? undefined : 'Runs share no metrics with matching units.',
    comparabilityKey: baseline.comparabilityKey,
    runs,
    metricDeltas,
  };
}

export function statusLabel(status: EvidenceStatus): string {
  return {
    accepted: 'Accepted',
    quarantined: 'Quarantined',
    publication_approved: 'Approved',
    publication_rejected: 'Rejected',
  }[status];
}

export function sortByPrimaryMetric(runs: EvidenceRun[]): EvidenceRun[] {
  return [...runs].sort((left, right) => primaryMetric(left).value - primaryMetric(right).value);
}
