import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Help Center — CircleOn.ai',
  description: 'Answers, guides and documentation for getting the most out of CircleOn.',
};

export default function Page() {
  return <CircleOn page="help" />;
}
