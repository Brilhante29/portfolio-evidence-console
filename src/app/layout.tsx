import type { Metadata } from 'next';

import { Navigation } from '@/components/navigation';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Evidence',
  description: 'Verified benchmark evidence, comparison, and provenance.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Navigation />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
