import { afterEach, describe, expect, it } from 'vitest';

import { createEvidenceContext } from '@/infrastructure/create-evidence-repository';
import { FixtureEvidenceRepository } from '@/infrastructure/fixture-evidence-repository';
import { GraphqlEvidenceRepository } from '@/infrastructure/graphql-evidence-repository';

describe('createEvidenceContext', () => {
  const previous = process.env.EVIDENCE_API_URL;

  afterEach(() => {
    if (previous === undefined) delete process.env.EVIDENCE_API_URL;
    else process.env.EVIDENCE_API_URL = previous;
  });

  it('defaults to verified local evidence', () => {
    delete process.env.EVIDENCE_API_URL;
    const context = createEvidenceContext();
    expect(context.repository).toBeInstanceOf(FixtureEvidenceRepository);
    expect(context.source).toEqual({ mode: 'fixture', label: 'Verified fixture' });
  });

  it('switches to GraphQL only when an endpoint is configured', () => {
    process.env.EVIDENCE_API_URL = ' http://api.test/graphql ';
    const context = createEvidenceContext();
    expect(context.repository).toBeInstanceOf(GraphqlEvidenceRepository);
    expect(context.source).toEqual({ mode: 'graphql', label: 'Live GraphQL' });
  });
});
