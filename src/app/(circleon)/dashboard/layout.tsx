import { Suspense } from 'react';

import { TourProvider } from './_lib/tour/TourProvider';
import TourAutoStart from './_lib/tour/TourAutoStart';
import TourOverlay from './_lib/tour/TourOverlay';

/**
 * The tour lives here rather than inside the dashboard page so it survives
 * navigation to a campaign's own route, which is a sibling page rather than a
 * view of /dashboard.
 *
 * The two route-aware pieces sit inside their own Suspense boundary: they read
 * useSearchParams, which client-renders everything up to the nearest boundary,
 * and the dashboard itself should not pay for that.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      {children}
      <Suspense fallback={null}>
        <TourAutoStart />
        <TourOverlay />
      </Suspense>
    </TourProvider>
  );
}
