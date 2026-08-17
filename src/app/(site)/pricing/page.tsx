import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Pricing — CircleOn.ai',
  description:
    'Atelier, Maison and Sovereign. Billed annually, with voice minutes included and pay-as-you-go overage.',
};

export default function Page() {
  return <CircleOn page="pricing" />;
}
