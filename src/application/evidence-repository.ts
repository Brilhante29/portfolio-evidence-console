import type { EvidenceComparison, EvidenceRun, EvidenceStatus } from '@/domain/evidence';

export interface EvidenceFilters {
  first?: number;
  offset?: number;
  project?: string;
  benchmarkId?: string;
  comparabilityKey?: string;
  status?: EvidenceStatus;
}

export interface EvidencePage {
  items: EvidenceRun[];
  totalCount: number;
  pageInfo: {
    offset: number;
    first: number;
    hasNextPage: boolean;
  };
}

export interface EvidenceRepository {
  listRuns(filters?: EvidenceFilters): Promise<EvidencePage>;
  getRun(runId: string): Promise<EvidenceRun | null>;
  compareRuns(runIds: string[]): Promise<EvidenceComparison>;
}

export interface EvidenceSource {
  mode: 'fixture' | 'graphql';
  label: string;
}
