import type { EvidenceRepository, EvidenceSource } from '@/application/evidence-repository';
import { FixtureEvidenceRepository } from '@/infrastructure/fixture-evidence-repository';
import { GraphqlEvidenceRepository } from '@/infrastructure/graphql-evidence-repository';

export interface EvidenceContext {
  repository: EvidenceRepository;
  source: EvidenceSource;
}

export function createEvidenceContext(): EvidenceContext {
  const endpoint = process.env.EVIDENCE_API_URL?.trim();
  if (endpoint) {
    return {
      repository: new GraphqlEvidenceRepository(endpoint),
      source: { mode: 'graphql', label: 'Live GraphQL' },
    };
  }

  return {
    repository: new FixtureEvidenceRepository(),
    source: { mode: 'fixture', label: 'Verified fixture' },
  };
}
