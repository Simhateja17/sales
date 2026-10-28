import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Voice Demo — CircleOn.ai',
  description: 'Request a demo of the CircleOn AI voice agent. We confirm your phone setup before paid checkout.',
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
