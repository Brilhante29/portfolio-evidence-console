import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="center-state">
      <span>404</span>
      <h1>Evidence run not found</h1>
      <Link className="primary-button" href="/">
        Return to registry
      </Link>
    </main>
  );
}
