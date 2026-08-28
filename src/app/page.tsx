import { EvidenceDashboard } from '@/features/evidence-dashboard/evidence-dashboard';
import { createEvidenceContext } from '@/infrastructure/create-evidence-repository';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default async function EvidencePage() {
  const { repository, source } = createEvidenceContext();
  const page = await repository.listRuns({ first: 100 });

  return (
    <main>
      <PageHeader
        eyebrow="Portfolio evidence plane"
        title="Verified benchmark registry"
        source={source}
      />
      <EvidenceDashboard runs={page.items} source={source} />
    </main>
  );
}
