import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Do Not Call Policy — CircleOn.ai',
  description: 'CircleOn Do Not Call policy for calls, texts and email outreach in Singapore.',
};

const UEN = process.env.NEXT_PUBLIC_UEN;

export default function DncPolicy() {
  return <main style={{ maxWidth: 800, margin: '60px auto', padding: 24, lineHeight: 1.8 }}>
    <a href="/">← CircleOn.ai</a>
    <h1>Do Not Call (DNC) Policy</h1>
    <p>Singapore&apos;s Do Not Call Registry lets people opt out of unsolicited marketing calls and text messages. This policy explains how CircleOn approaches it.</p>
    <h2>Your responsibility</h2>
    <p>Customers must only call or message numbers where they have clear consent or where the number is not on the DNC Registry, and must follow the PDPA. Do not use CircleOn to contact people who have asked not to be contacted.</p>
    <h2>What CircleOn does</h2>
    <p>Where DNC checking is enabled for your workspace, voice outreach is checked against the DNC Registry before calls are made. Email sequences stop automatically when a lead replies, and opt-out requests should be honoured promptly. WhatsApp and SMS are not available yet.</p>
    <h2>Report a concern</h2>
    <p>If you received outreach sent through CircleOn that you did not want, email <a href="mailto:info@circleon.ai">info@circleon.ai</a> with the details and we will act on it.</p>
    <p>CIRCLEON PTE. LTD., Singapore{UEN ? ` · UEN ${UEN}` : ''} · <a href="mailto:info@circleon.ai">info@circleon.ai</a></p>
  </main>;
}
