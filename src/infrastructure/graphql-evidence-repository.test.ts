import { describe, expect, it, vi } from 'vitest';

import { GraphqlEvidenceRepository } from '@/infrastructure/graphql-evidence-repository';

const graphqlRun = {
  runId: 'run-1',
  schemaVersion: 2,
  project: 'demo',
  benchmarkId: 'demo-v2',
  comparabilityKey: 'demo-key',
  status: 'PUBLICATION_APPROVED',
  workload: {
    version: '2',
    fixtureDigest: 'sha256:a',
    configDigest: 'sha256:b',
    warmupIterations: 1,
    measuredIterations: 10,
    concurrency: 2,
  },
  metrics: [
    {
      name: 'latency_ms',
      value: 4.2,
      unit: 'ms',
      direction: 'LOWER_IS_BETTER',
      samples: [4.2],
      failures: 0,
      summary: {},
    },
  ],
  execution: {
    command: 'benchmark',
    startedAt: '2026-08-28T00:00:00Z',
    durationSeconds: 1,
    exitCode: 0,
    repeat: 1,
  },
  environment: {},
  provenance: {
    sourceCommit: 'a'.repeat(40),
    cleanTree: true,
    imageRef: 'demo:latest',
    imageDigest: 'sha256:a',
    dependencyLockDigest: 'sha256:b',
    producer: 'github-actions',
    ciRunUrl: null,
    artifactDigest: 'sha256:c',
  },
};

describe('GraphqlEvidenceRepository', () => {
  it('validates and maps GraphQL enum casing at the adapter boundary', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        data: {
          benchmarkRuns: {
            items: [graphqlRun],
            totalCount: 1,
            pageInfo: { offset: 0, first: 50, hasNextPage: false },
          },
        },
      }),
    );
    const repository = new GraphqlEvidenceRepository('http://example.test/graphql', fetchImpl);
    const result = await repository.listRuns();

    expect(result.items[0]?.status).toBe('publication_approved');
    expect(result.items[0]?.metrics[0]?.direction).toBe('lower_is_better');
    const request = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(request[1].body)).variables).toEqual({});
  });

  it('loads details and maps nullable comparison fields', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ data: { benchmarkRun: graphqlRun } }))
      .mockResolvedValueOnce(Response.json({ data: { benchmarkRun: null } }))
      .mockResolvedValueOnce(
        Response.json({
          data: {
            compareBenchmarkRuns: {
              comparable: true,
              reason: null,
              comparabilityKey: 'demo-key',
              runs: [graphqlRun, graphqlRun],
              metricDeltas: [
                {
                  metricName: 'latency_ms',
                  unit: 'ms',
                  baselineRunId: 'run-1',
                  candidateRunId: 'run-2',
                  absoluteDelta: -0.2,
                  percentDelta: null,
                },
              ],
            },
          },
        }),
      );
    const repository = new GraphqlEvidenceRepository('http://example.test/graphql', fetchImpl);

    expect((await repository.getRun('run-1'))?.status).toBe('publication_approved');
    expect(await repository.getRun('missing')).toBeNull();
    const comparison = await repository.compareRuns(['run-1', 'run-2']);
    expect(comparison.reason).toBeUndefined();
    expect(comparison.metricDeltas[0]?.percentDelta).toBeUndefined();
  });

  it('fails closed on malformed data and GraphQL errors', async () => {
    const malformed = new GraphqlEvidenceRepository(
      'http://example.test/graphql',
      vi.fn(async () => Response.json({ data: { benchmarkRuns: { items: [] } } })),
    );
    await expect(malformed.listRuns()).rejects.toThrow();

    const errored = new GraphqlEvidenceRepository(
      'http://example.test/graphql',
      vi.fn(async () => Response.json({ errors: [{ message: 'denied' }] })),
    );
    await expect(errored.listRuns()).rejects.toThrow('denied');

    const failedHttp = new GraphqlEvidenceRepository(
      'http://example.test/graphql',
      vi.fn(async () => Response.json({}, { status: 503 })),
    );
    await expect(failedHttp.listRuns()).rejects.toThrow('HTTP 503');

    const noData = new GraphqlEvidenceRepository(
      'http://example.test/graphql',
      vi.fn(async () => Response.json({})),
    );
    await expect(noData.listRuns()).rejects.toThrow('has no data');
  });
});
