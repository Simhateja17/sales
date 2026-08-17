import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Safety & Trust — CircleOn.ai',
  description: 'How CircleOn keeps your data and your customers protected.',
};

export default function Page() {
  return <CircleOn page="safety" />;
}
