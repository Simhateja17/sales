import type { Metadata } from 'next';

import AdminGate from './_components/AdminGate';
import './admin.css';

export const metadata: Metadata = {
  title: 'CircleOn admin',
  robots: { index: false, follow: false, nocache: true },
};

// The API lives on a different origin, so its session cookie is invisible
// here. The gate checks access client-side before rendering anything, and
// every admin endpoint enforces the same rules server-side regardless.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
