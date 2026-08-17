import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'CircleOn.ai — Every lead gets a call',
  description: 'A living AI team that sources opportunities, speaks with them, and keeps moving until the work is done.',
};

export default function Page() {
  return <CircleOn page="home" />;
}
