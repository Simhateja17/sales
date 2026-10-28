import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'DNC Policy — CircleOn.ai',
  description: 'CircleOn Do Not Call policy for voice calls and messages to Singapore numbers.',
};

export default function DncPolicy() {
  return <LegalPage file="dnc-policy" />;
}
