'use client';

import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="center-state">
      <AlertTriangle aria-hidden="true" size={32} />
      <h1>Evidence source unavailable</h1>
      <button className="primary-button" onClick={reset} type="button">
        Retry
      </button>
    </main>
  );
}
