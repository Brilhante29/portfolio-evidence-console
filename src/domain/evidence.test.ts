import { describe, expect, it } from 'vitest';

import { formatMetricValue, primaryMetric, shortCommit } from '@/domain/evidence';
import { fixtureRuns } from '@/infrastructure/fixture-data';

describe('evidence domain formatting', () => {
  it('selects the primary metric and shortens immutable commits', () => {
    expect(primaryMetric(fixtureRuns[0]).name).toBe('ingestion_p95_ms');
    expect(shortCommit('1234567890abcdef')).toBe('1234567');
  });

  it('formats values at stable magnitude boundaries', () => {
    expect(formatMetricValue(18_450)).toBe('18,450');
    expect(formatMetricValue(120.22)).toBe('120.2');
    expect(formatMetricValue(40.201)).toBe('40.20');
    expect(formatMetricValue(0.921)).toBe('0.921');
  });

  it('rejects evidence without a metric', () => {
    expect(() => primaryMetric({ ...fixtureRuns[0], metrics: [] })).toThrow('has no metrics');
  });
});
