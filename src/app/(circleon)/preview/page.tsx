import { notFound } from 'next/navigation';
import PreviewClient from './PreviewClient';

/**
 * Dev-only visual harness for the dashboard reskin.
 *
 * The real dashboard sits behind a login and talks to the production backend,
 * so this route renders the same primitives and page sections against the
 * fixtures in dashboard/_lib/fixtures.ts — including the empty, loading and
 * error states the design mockup never showed.
 *
 * It 404s in production so it can never be reached from a deployed build.
 */
export default function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <PreviewClient />;
}
