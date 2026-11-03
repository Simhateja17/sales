import type { Metadata } from 'next';
import BookingClient from './BookingClient';

export const metadata: Metadata = {
  title: 'Book a meeting',
  robots: { index: false, follow: false },
};

export default async function BookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <BookingClient token={token} />;
}
