import type { ReactNode } from 'react';
import CircleOn from '@/components/circleon/CircleOn';
import './legal.css';

// Wraps a text page in the site's nav, footer and theme.
export function LegalShell({ children }: { children: ReactNode }) {
  return <CircleOn page="legal">
    <main className="legal-page">
      <div className="legal-card">{children}</div>
    </main>
  </CircleOn>;
}
