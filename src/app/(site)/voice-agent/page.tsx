import type { Metadata } from 'next';
import CircleOn from '@/components/circleon/CircleOn';

export const metadata: Metadata = {
  title: 'Voice Agent — CircleOn.ai',
  description: 'Human-sounding voice agents that answer and place calls, qualify, and book meetings around the clock.',
};

export default function Page() {
  return <CircleOn page="voice-agent" />;
}
