import type {
  EvidenceFilters,
  EvidencePage,
  EvidenceRepository,
} from '@/application/evidence-repository';
import type { EvidenceComparison, EvidenceRun } from '@/domain/evidence';
import { z } from 'zod';

const recordSchema = z.record(z.string(), z.unknown());
const metricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  direction: z.enum(['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET']),
  samples: z.array(z.number()),
  failures: z.number().int().nonnegative(),
  summary: recordSchema,
});
const runSchema = z.object({
  runId: z.string(),
  schemaVersion: z.number().int(),
  project: z.string(),
  benchmarkId: z.string(),
  comparabilityKey: z.string(),
  status: z.enum(['ACCEPTED', 'QUARANTINED', 'PUBLICATION_APPROVED', 'PUBLICATION_REJECTED']),
  workload: z.object({
    version: z.string(),
    fixtureDigest: z.string(),
    configDigest: z.string(),
    warmupIterations: z.number().int(),
    measuredIterations: z.number().int(),
    concurrency: z.number().int(),
  }),
  metrics: z.array(metricSchema).min(1),
  execution: z.object({
    command: z.string(),
    startedAt: z.string(),
    durationSeconds: z.number(),
    exitCode: z.number().int(),
    repeat: z.number().int(),
  }),
  environment: recordSchema,
  provenance: z.object({
    sourceCommit: z.string(),
    cleanTree: z.boolean(),
    imageRef: z.string(),
    imageDigest: z.string(),
    dependencyLockDigest: z.string(),
    producer: z.string(),
    ciRunUrl: z.string().nullish(),
    artifactDigest: z.string(),
  }),
});

const runFields = `
  runId schemaVersion project benchmarkId comparabilityKey status
  workload { version fixtureDigest configDigest warmupIterations measuredIterations concurrency }
  metrics { name value unit direction samples failures summary }
  execution { command startedAt durationSeconds exitCode repeat }
  environment
  provenance { sourceCommit cleanTree imageRef imageDigest dependencyLockDigest producer ciRunUrl artifactDigest }
`;

const listQuery = `
  query EvidenceRuns($first: Int, $offset: Int, $project: String, $benchmarkId: String, $comparabilityKey: String, $status: EvidenceStatus) {
    benchmarkRuns(first: $first, offset: $offset, project: $project, benchmarkId: $benchmarkId, comparabilityKey: $comparabilityKey, status: $status) {
      items { ${runFields} }
      totalCount
      pageInfo { offset first hasNextPage }
    }
  }
`;

const detailQuery = `query EvidenceRun($runId: ID!) { benchmarkRun(runId: $runId) { ${runFields} } }`;
const comparisonQuery = `
  query CompareEvidenceRuns($runIds: [ID!]!) {
    compareBenchmarkRuns(runIds: $runIds) {
      comparable reason comparabilityKey
      runs { ${runFields} }
      metricDeltas { metricName unit baselineRunId candidateRunId absoluteDelta percentDelta }
    }
  }
`;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class GraphqlEvidenceRepository implements EvidenceRepository {
  constructor(
    private readonly endpoint: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async listRuns(filters: EvidenceFilters = {}): Promise<EvidencePage> {
    const response = await this.request(listQuery, {
      ...filters,
      status: filters.status?.toUpperCase(),
    });
    const parsed = z
      .object({
        benchmarkRuns: z.object({
          items: z.array(runSchema),
          totalCount: z.number().int().nonnegative(),
          pageInfo: z.object({
            offset: z.number().int().nonnegative(),
            first: z.number().int().positive(),
            hasNextPage: z.boolean(),
          }),
        }),
      })
      .parse(response);

    return {
      ...parsed.benchmarkRuns,
      items: parsed.benchmarkRuns.items.map(mapRun),
    };
  }

  async getRun(runId: string): Promise<EvidenceRun | null> {
    const response = await this.request(detailQuery, { runId });
    const parsed = z.object({ benchmarkRun: runSchema.nullable() }).parse(response);
    return parsed.benchmarkRun ? mapRun(parsed.benchmarkRun) : null;
  }

  async compareRuns(runIds: string[]): Promise<EvidenceComparison> {
    const response = await this.request(comparisonQuery, { runIds });
    const parsed = z
      .object({
        compareBenchmarkRuns: z.object({
          comparable: z.boolean(),
          reason: z.string().nullish(),
          comparabilityKey: z.string().nullish(),
          runs: z.array(runSchema),
          metricDeltas: z.array(
            z.object({
              metricName: z.string(),
              unit: z.string(),
              baselineRunId: z.string(),
              candidateRunId: z.string(),
              absoluteDelta: z.number(),
              percentDelta: z.number().nullish(),
            }),
          ),
        }),
      })
      .parse(response).compareBenchmarkRuns;

    return {
      comparable: parsed.comparable,
      reason: parsed.reason ?? undefined,
      comparabilityKey: parsed.comparabilityKey ?? undefined,
      runs: parsed.runs.map(mapRun),
      metricDeltas: parsed.metricDeltas.map((delta) => ({
        ...delta,
        percentDelta: delta.percentDelta ?? undefined,
      })),
    };
  }

  private async request(query: string, variables: Record<string, unknown>): Promise<unknown> {
    const response = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    const payload = (await response.json()) as unknown;
    if (!response.ok)
      throw new Error(`evidence GraphQL request failed with HTTP ${response.status}`);

    const envelope = z
      .object({
        data: z.unknown().optional(),
        errors: z.array(z.object({ message: z.string() })).optional(),
      })
      .parse(payload);
    if (envelope.errors?.length) {
      throw new Error(
        `evidence GraphQL error: ${envelope.errors.map((error) => error.message).join('; ')}`,
      );
    }
    if (envelope.data === undefined) throw new Error('evidence GraphQL response has no data');
    return envelope.data;
  }
}

function mapRun(run: z.infer<typeof runSchema>): EvidenceRun {
  return {
    ...run,
    status: run.status.toLowerCase() as EvidenceRun['status'],
    metrics: run.metrics.map((metric) => ({
      ...metric,
      direction: metric.direction.toLowerCase() as EvidenceRun['metrics'][number]['direction'],
    })),
    provenance: {
      ...run.provenance,
      ciRunUrl: run.provenance.ciRunUrl ?? undefined,
    },
  };
}
