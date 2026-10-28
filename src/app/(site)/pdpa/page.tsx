import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'PDPA Notice — CircleOn.ai',
  description: 'How CircleOn handles personal data under the Singapore Personal Data Protection Act.',
};

export default function Pdpa() {
  return <LegalPage file="pdpa-notice" />;
}
