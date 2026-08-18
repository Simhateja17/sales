import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Follow Up — CircleOn.ai',
  description: 'Personalized email, SMS and WhatsApp follow-up that keeps every lead warm at the right moment.',
};

export default function Page() {
  return <CircleOn page="follow-up" />;
}
