import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — CircleOn.ai',
  description: 'How CIRCLEON PTE. LTD. collects, uses and protects personal data, including Google sign-in data.',
};

export default function Privacy() {
  return <LegalPage file="privacy-policy" />;
}
