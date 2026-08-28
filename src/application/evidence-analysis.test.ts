import { describe, expect, it } from 'vitest';

import {
  compareEvidenceRuns,
  filterRuns,
  listMetricNames,
  listProjects,
  sortByPrimaryMetric,
  statusLabel,
  summarizeRuns,
} from '@/application/evidence-analysis';
import { fixtureRuns } from '@/infrastructure/fixture-data';

describe('evidence analysis', () => {
  it('summarizes projects, approvals, and zero-failure evidence', () => {
    const summary = summarizeRuns(fixtureRuns);
    expect(summary.runCount).toBe(12);
    expect(summary.projectCount).toBe(11);
    expect(summary.approvedCount).toBe(9);
    expect(summary.zeroFailureRate).toBe(100);
    expect(summarizeRuns([]).zeroFailureRate).toBe(0);
  });

  it('filters by project, status, and free-text provenance', () => {
    expect(filterRuns(fixtureRuns, { project: 'portfolio-evidence-api' })).toHaveLength(2);
    expect(filterRuns(fixtureRuns, { status: 'quarantined' })).toHaveLength(1);
    expect(filterRuns(fixtureRuns, { query: '14e43ef' })[0]?.project).toBe(
      'portfolio-evidence-api',
    );
    expect(filterRuns(fixtureRuns, { query: 'not-present' })).toEqual([]);
  });

  it('lists unique metric names', () => {
    const metrics = listMetricNames(fixtureRuns);
    expect(metrics).toContain('ingestion_p95_ms');
    expect(new Set(metrics).size).toBe(metrics.length);
    expect(listProjects(fixtureRuns)[0]).toBe('embeddings-benchmark');
    expect(sortByPrimaryMetric(fixtureRuns)[0].project).toBe('model-drift-detector');
    expect(statusLabel('publication_rejected')).toBe('Rejected');
  });

  it('compares only equivalent runs', () => {
    const comparable = compareEvidenceRuns(fixtureRuns.slice(0, 2));
    expect(comparable.comparable).toBe(true);
    expect(comparable.metricDeltas[0]?.absoluteDelta).toBeCloseTo(3.681);

    const incompatible = compareEvidenceRuns([fixtureRuns[0], fixtureRuns[2]]);
    expect(incompatible.comparable).toBe(false);
    expect(incompatible.reason).toContain('keys differ');

    expect(compareEvidenceRuns([fixtureRuns[0]]).reason).toContain('exactly two');
    const unitMismatch = compareEvidenceRuns([
      fixtureRuns[0],
      {
        ...fixtureRuns[1],
        metrics: [{ ...fixtureRuns[1].metrics[0], unit: 'seconds' }],
      },
    ]);
    expect(unitMismatch.reason).toContain('no metrics');

    const zeroBaseline = compareEvidenceRuns([
      { ...fixtureRuns[0], metrics: [{ ...fixtureRuns[0].metrics[0], value: 0 }] },
      fixtureRuns[1],
    ]);
    expect(zeroBaseline.metricDeltas[0]?.percentDelta).toBeUndefined();
  });
});
