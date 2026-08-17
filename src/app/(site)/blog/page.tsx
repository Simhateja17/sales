import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Blog — CircleOn.ai',
  description: 'Ideas on AI, sales, and automation to help small teams sell without hiring.',
};

export default function Page() {
  return <CircleOn page="blog" />;
}
