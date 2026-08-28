import { describe, expect, it } from 'vitest';

import { FixtureEvidenceRepository } from '@/infrastructure/fixture-evidence-repository';

describe('FixtureEvidenceRepository', () => {
  const repository = new FixtureEvidenceRepository();

  it('paginates and filters with repository semantics', async () => {
    const page = await repository.listRuns({ project: 'portfolio-evidence-api', first: 1 });
    expect(page.items).toHaveLength(1);
    expect(page.totalCount).toBe(2);
    expect(page.pageInfo.hasNextPage).toBe(true);

    const filtered = await repository.listRuns({
      benchmarkId: 'evidence-api-v2',
      comparabilityKey: 'evidence-api-node24-v2',
      status: 'accepted',
      offset: 1,
    });
    expect(filtered.totalCount).toBe(1);
    expect(filtered.items).toEqual([]);
  });

  it('returns details and comparison through the same port', async () => {
    const first = await repository.getRun('00000000-0000-4000-8000-000000000001');
    expect(first?.project).toBe('portfolio-evidence-api');

    const comparison = await repository.compareRuns([
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    ]);
    expect(comparison.comparable).toBe(true);
    expect(await repository.getRun('missing')).toBeNull();
    expect((await repository.compareRuns(['missing'])).comparable).toBe(false);
  });
});
