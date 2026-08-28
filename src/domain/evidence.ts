export type EvidenceStatus =
  'accepted' | 'quarantined' | 'publication_approved' | 'publication_rejected';

export type MetricDirection = 'higher_is_better' | 'lower_is_better' | 'target';

export interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  direction: MetricDirection;
  samples: number[];
  failures: number;
  summary: Record<string, unknown>;
}

export interface EvidenceRun {
  runId: string;
  schemaVersion: number;
  project: string;
  benchmarkId: string;
  comparabilityKey: string;
  status: EvidenceStatus;
  workload: {
    version: string;
    fixtureDigest: string;
    configDigest: string;
    warmupIterations: number;
    measuredIterations: number;
    concurrency: number;
  };
  metrics: BenchmarkMetric[];
  execution: {
    command: string;
    startedAt: string;
    durationSeconds: number;
    exitCode: number;
    repeat: number;
  };
  environment: Record<string, unknown>;
  provenance: {
    sourceCommit: string;
    cleanTree: boolean;
    imageRef: string;
    imageDigest: string;
    dependencyLockDigest: string;
    producer: string;
    ciRunUrl?: string;
    artifactDigest: string;
  };
}

export interface MetricDelta {
  metricName: string;
  unit: string;
  baselineRunId: string;
  candidateRunId: string;
  absoluteDelta: number;
  percentDelta?: number;
}

export interface EvidenceComparison {
  comparable: boolean;
  reason?: string;
  comparabilityKey?: string;
  runs: EvidenceRun[];
  metricDeltas: MetricDelta[];
}

export function primaryMetric(run: EvidenceRun): BenchmarkMetric {
  const metric = run.metrics[0];
  if (!metric) throw new Error(`evidence run ${run.runId} has no metrics`);
  return metric;
}

export function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}

export function formatMetricValue(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  return value.toFixed(3);
}
