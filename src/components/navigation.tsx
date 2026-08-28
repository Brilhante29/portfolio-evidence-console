'use client';

import { BarChart3, Code2, FileSearch, GitCompareArrows } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Evidence', icon: BarChart3 },
  { href: '/compare', label: 'Compare', icon: GitCompareArrows },
  { href: '/methodology', label: 'Methodology', icon: FileSearch },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="navigation">
      <Link className="brand" href="/" aria-label="Portfolio Evidence home">
        <span className="brand-mark">GB</span>
        <span className="brand-copy">
          <strong>Portfolio Evidence</strong>
          <span>Verified benchmarks</span>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} className={active ? 'nav-link active' : 'nav-link'} href={href}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <a
        className="github-link"
        href="https://github.com/Brilhante29"
        target="_blank"
        rel="noreferrer"
        title="Open GitHub profile"
      >
        <Code2 aria-hidden="true" size={18} />
        <span>GitHub</span>
      </a>
    </aside>
  );
}
