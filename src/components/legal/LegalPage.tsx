import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

// The HTML fragments come from the approved legal pack. Edit the pack's Markdown and
// rebuild rather than changing the wording here.
export default function LegalPage({ file }: { file: 'terms-of-service' | 'privacy-policy' | 'pdpa-notice' | 'dnc-policy' }) {
  const html = readFileSync(join(process.cwd(), 'src/content/legal', `${file}.html`), 'utf8');
  return <LegalShell>
    <article dangerouslySetInnerHTML={{ __html: html }} />
    <p className="legal-foot"><a href="/terms">Terms of Service</a> · <a href="/privacy">Privacy Policy</a> · <a href="/pdpa">PDPA Notice</a> · <a href="/dnc-policy">DNC Policy</a></p>
  </LegalShell>;
}
