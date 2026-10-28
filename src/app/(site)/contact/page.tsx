import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — CircleOn.ai',
  description: 'Contact CircleOn by email, request a voice agent demo, and see support hours.',
};

const UEN = process.env.NEXT_PUBLIC_UEN;

export default function Contact() {
  return <main style={{ maxWidth: 800, margin: '60px auto', padding: 24, lineHeight: 1.8 }}>
    <a href="/">← CircleOn.ai</a>
    <h1>Contact CircleOn</h1>
    <p>CIRCLEON PTE. LTD. is a Singapore company. For sales, support or privacy questions, email <a href="mailto:info@circleon.ai">info@circleon.ai</a>.</p>
    <h2>Book a voice agent demo</h2>
    <p>The Voice Agent starts with a demo call so we can confirm your phone setup. <a href="/demo">Request a demo</a>.</p>
    <h2>Free trial</h2>
    <p>Follow Up and All-in-one start with a 7-day free trial. Card required, cancel anytime before day 7. <a href="/pricing">See pricing</a>.</p>
    <h2>Support hours</h2>
    <p>Monday to Friday, 9am to 6pm Singapore time, excluding Singapore public holidays.</p>
    <p>CIRCLEON PTE. LTD., Singapore{UEN ? ` · UEN ${UEN}` : ''} · <a href="mailto:info@circleon.ai">info@circleon.ai</a></p>
  </main>;
}
