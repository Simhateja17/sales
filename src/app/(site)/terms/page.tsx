import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — CircleOn.ai',
  description: 'The terms for using CircleOn, including subscriptions, trials, billing and acceptable use.',
};

export default function Terms() {
  return <LegalPage file="terms-of-service" />;
}
