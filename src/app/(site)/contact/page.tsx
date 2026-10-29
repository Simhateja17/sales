import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Contact — CircleOn.ai',
  description: 'Contact CircleOn by email, request a voice agent demo, and see support hours.',
};

export default function Contact() {
  return <LegalShell>
    <h1>Contact CircleOn</h1>
    <p>CIRCLEON PTE. LTD. (UEN 202627473C) is a Singapore company. For sales, support or privacy questions, email <a href="mailto:info@circleon.ai">info@circleon.ai</a>.</p>
    <h2>Book a voice agent demo</h2>
    <p>The Voice Agent starts with a demo call so we can confirm your phone setup. <a href="/demo">Request a demo</a>.</p>
    <h2>Free trial</h2>
    <p>Follow Up and All-in-one start with a 7-day free trial. Card required, cancel anytime before day 7. <a href="/pricing">See pricing</a>.</p>
    <h2>Support hours</h2>
    <p>Monday to Friday, 9am to 6pm Singapore time, excluding Singapore public holidays.</p>
  </LegalShell>;
}
