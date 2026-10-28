import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import './legal.css';

// The HTML fragments come from the approved legal pack. Edit the pack's Markdown and
// rebuild rather than changing the wording here.
export default function LegalPage({ file }: { file: 'terms-of-service' | 'privacy-policy' | 'pdpa-notice' | 'dnc-policy' }) {
  const html = readFileSync(join(process.cwd(), 'src/content/legal', `${file}.html`), 'utf8');
  return <main className="legal-page">
    <a href="/">← CircleOn.ai</a>
    <article dangerouslySetInnerHTML={{ __html: html }} />
    <p className="legal-foot"><a href="/terms">Terms of Service</a> · <a href="/privacy">Privacy Policy</a> · <a href="/pdpa">PDPA Notice</a> · <a href="/dnc-policy">DNC Policy</a></p>
  </main>;
}
