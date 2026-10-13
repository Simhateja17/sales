import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Pricing — CircleOn.ai',
  description:
    'Monthly SGD plans for AI email outreach and voice calls. Compare Starter, Growth and Pro.',
};

export default function Page() {
  return <CircleOn page="pricing" />;
}
