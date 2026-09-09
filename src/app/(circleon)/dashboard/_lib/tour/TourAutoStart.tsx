'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useTour } from './TourProvider';

/**
 * First-run trigger, kept apart from the provider for one reason: reading
 * useSearchParams pushes everything up to the nearest Suspense boundary into
 * client rendering. As a leaf inside its own boundary it costs the dashboard
 * nothing, where the same hook inside the provider would take the whole
 * subtree with it.
 *
 * It fires once, only after the stored record has actually been read (waiting
 * on the read rather than on a timer is what keeps it out of the loading
 * flash), only when the tour has never been started, and only on the landing
 * route with no query — someone who deep-linked into a sub-page is left alone.
 */
export default function TourAutoStart() {
  const tour = useTour();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  const loading = tour?.loading ?? true;
  const loadFailed = tour?.loadFailed ?? true;
  const status = tour?.record.status;
  const startTour = tour?.startTour;
  const query = searchParams.toString();

  useEffect(() => {
    if (firedRef.current || loading || loadFailed || !startTour) return;
    if (status !== 'not_started') return;
    if (pathname !== '/dashboard' || query !== '') return;
    firedRef.current = true;
    startTour();
  }, [loading, loadFailed, status, pathname, query, startTour]);

  return null;
}
