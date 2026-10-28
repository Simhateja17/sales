import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDPA — CircleOn.ai',
  description: 'How CircleOn handles personal data under the Singapore Personal Data Protection Act.',
};

const UEN = process.env.NEXT_PUBLIC_UEN;

export default function Pdpa() {
  return <main style={{ maxWidth: 800, margin: '60px auto', padding: 24, lineHeight: 1.8 }}>
    <a href="/">← CircleOn.ai</a>
    <h1>PDPA Notice</h1>
    <p>CIRCLEON PTE. LTD. handles personal data in line with Singapore&apos;s Personal Data Protection Act 2012 (PDPA). This page summarises how. See also our <a href="/privacy">Privacy Policy</a> and <a href="/dnc-policy">Do Not Call policy</a>.</p>
    <h2>Our own data</h2>
    <p>We collect account, billing and usage details to run CircleOn, plus demo or support requests you send us. We use them only for those purposes and to meet legal obligations.</p>
    <h2>Your leads and contacts</h2>
    <p>When you upload or find leads, you decide how they are contacted. You are responsible for having a lawful basis, including consent where required, to contact them. CircleOn processes that data on your instructions to provide the service.</p>
    <h2>Opt-outs</h2>
    <p>Reply detection stops a sequence when a lead replies. If someone asks not to be contacted, tell us at the address below and we will help you stop outreach to them.</p>
    <h2>Access and correction</h2>
    <p>You can ask to access or correct personal data we hold about you, or withdraw consent, by emailing <a href="mailto:info@circleon.ai">info@circleon.ai</a>. We will respond within a reasonable time.</p>
    <h2>Data protection contact</h2>
    <p>Email <a href="mailto:info@circleon.ai">info@circleon.ai</a>.</p>
    <p>CIRCLEON PTE. LTD., Singapore{UEN ? ` · UEN ${UEN}` : ''} · <a href="mailto:info@circleon.ai">info@circleon.ai</a></p>
  </main>;
}
