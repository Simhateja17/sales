import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'About — CircleOn.ai',
  description: 'Our mission and the team building AI agents for small sales teams.',
};

export default function Page() {
  return <CircleOn page="about" />;
}
