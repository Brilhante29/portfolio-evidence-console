import { PageHeader } from '@/components/page-header';
import { ComparisonWorkspace } from '@/features/comparison/comparison-workspace';
import { createEvidenceContext } from '@/infrastructure/create-evidence-repository';

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ runs?: string }>;
}) {
  const { repository, source } = createEvidenceContext();
  const ids = (await searchParams).runs?.split(',').filter(Boolean).slice(0, 2) ?? [];
  const page = await repository.listRuns({ first: 100 });
  const comparison = ids.length === 2 ? await repository.compareRuns(ids) : undefined;

  return (
    <main>
      <PageHeader eyebrow="Controlled comparison" title="Run comparison" source={source} />
      <ComparisonWorkspace runs={page.items} initialIds={ids} comparison={comparison} />
    </main>
  );
}
