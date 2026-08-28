import type {
  EvidenceFilters,
  EvidencePage,
  EvidenceRepository,
} from '@/application/evidence-repository';
import { compareEvidenceRuns } from '@/application/evidence-analysis';
import type { EvidenceComparison, EvidenceRun } from '@/domain/evidence';
import { fixtureRuns } from '@/infrastructure/fixture-data';

export class FixtureEvidenceRepository implements EvidenceRepository {
  constructor(private readonly runs: EvidenceRun[] = fixtureRuns) {}

  async listRuns(filters: EvidenceFilters = {}): Promise<EvidencePage> {
    const offset = filters.offset ?? 0;
    const first = filters.first ?? 50;
    const filtered = this.runs.filter((run) => {
      if (filters.project && run.project !== filters.project) return false;
      if (filters.benchmarkId && run.benchmarkId !== filters.benchmarkId) return false;
      if (filters.comparabilityKey && run.comparabilityKey !== filters.comparabilityKey)
        return false;
      return !filters.status || run.status === filters.status;
    });

    return {
      items: filtered.slice(offset, offset + first),
      totalCount: filtered.length,
      pageInfo: { offset, first, hasNextPage: offset + first < filtered.length },
    };
  }

  async getRun(runId: string): Promise<EvidenceRun | null> {
    return this.runs.find((run) => run.runId === runId) ?? null;
  }

  async compareRuns(runIds: string[]): Promise<EvidenceComparison> {
    const selected = runIds.flatMap((runId) => {
      const run = this.runs.find((candidate) => candidate.runId === runId);
      return run ? [run] : [];
    });
    return compareEvidenceRuns(selected);
  }
}
