import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Lead Generation — CircleOn.ai',
  description: 'AI prospecting that discovers, enriches and scores the right accounts before a rep touches them.',
};

export default function Page() {
  return <CircleOn page="lead-generation" />;
}
