import { PageHeader } from '@/components/page-header';
import { CheckCircle2, GitBranch, Scale, ShieldCheck } from 'lucide-react';

const controls = [
  {
    icon: ShieldCheck,
    title: 'V2 contract',
    text: 'Workload, metrics, environment, execution, and provenance are required.',
  },
  {
    icon: Scale,
    title: 'Comparability key',
    text: 'Deltas are valid only for equivalent workload and environment definitions.',
  },
  {
    icon: GitBranch,
    title: 'Clean source',
    text: 'Publication evidence names a clean source commit, image, lockfile, and artifact digest.',
  },
  {
    icon: CheckCircle2,
    title: 'Failure accounting',
    text: 'Samples and failures travel with every metric; missing evidence fails closed.',
  },
];

export default function MethodologyPage() {
  return (
    <main>
      <PageHeader eyebrow="Benchmark governance" title="Evidence methodology" />
      <section className="methodology-list">
        {controls.map(({ icon: Icon, title, text }, index) => (
          <article key={title}>
            <span className="method-index">0{index + 1}</span>
            <Icon aria-hidden="true" size={22} />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="contract-band">
        <div>
          <p className="eyebrow">Contract</p>
          <h2>benchmark-result-v2</h2>
        </div>
        <code>schema_version: 2 · clean_tree: true · failures: 0</code>
      </section>
    </main>
  );
}
