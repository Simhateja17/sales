import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Customer Stories — CircleOn.ai',
  description: 'Teams growing faster with CircleOn.',
};

export default function Page() {
  return <CircleOn page="stories" />;
}
