'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  advance,
  computePopoverPosition,
  isFirstStep,
  isLastStep,
  isStepUnlocked,
  keyIntent,
  normalizeRoute,
  pickVisibleTarget,
  progressLabel,
  resolveStepRoute,
  retreat,
} from './logic';
import { TOUR_STEPS } from './steps';
import { useTour } from './TourProvider';
import type { PopoverPosition } from './types';
import './tour.css';

/** A target can render late while the page fetches, so poll for ~6s before giving up. */
const LOCATE_INTERVAL_MS = 150;
const LOCATE_ATTEMPTS = 40;
/** Long enough for scrollIntoView's smooth scroll to settle before measuring. */
const SETTLE_MS = 300;
const SPOTLIGHT_PADDING = 8;
const GATE_POLL_MS = 3000;
/** Matches circleon.css, where the sidebar and the multi-column layouts collapse. */
const NARROW_BREAKPOINT = 768;

type Rect = { top: number; left: number; width: number; height: number };

function readRect(element: Element): Rect {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function isTypingTarget(node: EventTarget | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName);
}

export default function TourOverlay() {
  const tour = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, placement: 'center' });

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<Element | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const tourOpen = Boolean(tour?.tourOpen);
  const tourIndex = tour?.tourIndex ?? 0;
  const step = tourOpen ? TOUR_STEPS[tourIndex] ?? null : null;
  const unlocked = isStepUnlocked(step, tour?.completion);
  const gateId = step?.requiresId ?? null;

  const stepRoute = resolveStepRoute(step, tour?.routeContext);
  const currentRoute = normalizeRoute(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  const targetRoute = normalizeRoute(stepRoute);

  const finishTour = tour?.finishTour;
  const goToTourStep = tour?.goToTourStep;
  const refreshGate = tour?.refreshGate;

  const handleNext = useCallback(() => {
    if (!step || !goToTourStep || !finishTour) return;
    if (!isStepUnlocked(step, tour?.completion)) return;
    const intent = advance(tourIndex, TOUR_STEPS);
    if (intent.action === 'finish') finishTour('completed');
    else if (intent.action === 'move') goToTourStep(intent.index);
  }, [step, tour?.completion, tourIndex, goToTourStep, finishTour]);

  const handleSkipStep = useCallback(() => {
    if (!goToTourStep || !finishTour) return;
    const intent = advance(tourIndex, TOUR_STEPS);
    if (intent.action === 'finish') finishTour('completed');
    else if (intent.action === 'move') goToTourStep(intent.index);
  }, [tourIndex, goToTourStep, finishTour]);

  const handleBack = useCallback(() => {
    if (!goToTourStep) return;
    const intent = retreat(tourIndex, TOUR_STEPS);
    if (intent.action === 'move') goToTourStep(intent.index);
  }, [tourIndex, goToTourStep]);

  const handleEnd = useCallback(() => { finishTour?.('skipped'); }, [finishTour]);

  // 1. Navigate. The step's route is resolved against live context first, so a
  //    step that points at a record which does not exist yet falls back to its
  //    static route rather than navigating nowhere.
  useEffect(() => {
    if (!tourOpen || !targetRoute) { setNavigating(false); return; }
    if (currentRoute === targetRoute) { setNavigating(false); return; }
    setNavigating(true);
    setRect(null);
    targetRef.current = null;
    router.push(targetRoute);
  }, [tourOpen, targetRoute, currentRoute, router]);

  // 2. Locate the target, once the page it lives on is actually open. Pages
  //    render skeletons first, so poll rather than measuring once and failing.
  //    A target that never appears leaves the rect null, which renders the step
  //    as a centred card: the explanation still lands.
  useEffect(() => {
    if (!tourOpen || !step || navigating) return;

    const selector = step.target;
    if (!selector) {
      targetRef.current = null;
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    const attempt = () => {
      if (cancelled) return;
      const found = pickVisibleTarget<HTMLElement>(document.querySelectorAll<HTMLElement>(selector));
      if (found) {
        targetRef.current = found;
        found.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        timer = window.setTimeout(() => {
          if (!cancelled) setRect(readRect(found));
        }, SETTLE_MS);
        return;
      }
      attempts += 1;
      if (attempts >= LOCATE_ATTEMPTS) {
        targetRef.current = null;
        setRect(null);
        return;
      }
      timer = window.setTimeout(attempt, LOCATE_INTERVAL_MS);
    };

    attempt();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [tourOpen, step, navigating]);

  // 3. Track. Scroll is captured so movement inside a nested scroll container
  //    counts too, not only the document scrolling.
  useEffect(() => {
    if (!tourOpen) return;
    const remeasure = () => {
      const element = targetRef.current;
      if (!element) return;
      setRect(readRect(element));
    };
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, true);
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, true);
    };
  }, [tourOpen]);

  // 4. Position, after layout, against the popover's real rendered size rather
  //    than an assumed one.
  useLayoutEffect(() => {
    if (!tourOpen || !step) return;
    const node = popoverRef.current;
    if (!node) return;

    const { width, height } = node.getBoundingClientRect();
    const narrow = window.innerWidth < NARROW_BREAKPOINT;

    setPosition(computePopoverPosition({
      rect,
      // At narrow widths there is no room beside anything: force the card below
      // its target so it never covers the control it is describing.
      placement: rect ? (narrow ? 'bottom' : step.placement) : 'center',
      popoverWidth: width,
      popoverHeight: height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));
  }, [tourOpen, step, rect, navigating, unlocked]);

  // 5. Keyboard. Escape always exits; everything else is ignored while the user
  //    is typing, or the tour would hijack Enter and the arrow keys inside the
  //    very field the current step is pointing at.
  useEffect(() => {
    if (!tourOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const intent = keyIntent(event.key);
      if (!intent) return;
      if (intent !== 'skip' && isTypingTarget(event.target)) return;
      event.preventDefault();
      if (intent === 'next') handleNext();
      else if (intent === 'prev') handleBack();
      else handleEnd();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tourOpen, handleNext, handleBack, handleEnd]);

  // 6. Auto-unlock. While a gated step is locked, re-read that gate's own source
  //    so Next unlocks itself the moment the user finishes the task. No manual
  //    refresh, and nothing to poll once the step is open.
  useEffect(() => {
    if (!tourOpen || !gateId || unlocked || !refreshGate) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      refreshGate(gateId).catch(() => undefined);
    };
    const timer = window.setInterval(tick, GATE_POLL_MS);
    window.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('visibilitychange', tick);
    };
  }, [tourOpen, gateId, unlocked, refreshGate]);

  if (!mounted || !tourOpen || !step) return null;

  const anchorless = !rect;
  const first = isFirstStep(tourIndex);
  const last = isLastStep(tourIndex, TOUR_STEPS);
  const locked = !unlocked;
  const titleId = `tour-title-${step.id}`;
  const bodyId = `tour-body-${step.id}`;

  return createPortal(
    <div className="tour-root">
      <div
        className={`tour-scrim${anchorless ? ' is-dimmed' : ''}`}
        aria-hidden="true"
        onClick={anchorless ? handleEnd : undefined}
      />

      {rect ? (
        <div
          className="tour-spotlight"
          aria-hidden="true"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      ) : null}

      <div
        ref={popoverRef}
        className={`tour-popover tour-placement-${position.placement}`}
        style={{ top: position.top, left: position.left }}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <div className="tour-step-count">{progressLabel(tourIndex, TOUR_STEPS)}</div>
        <h2 className="tour-title" id={titleId}>{step.title}</h2>
        <p className="tour-body" id={bodyId}>{step.body}</p>
        {step.footnote ? <p className="tour-footnote">{step.footnote}</p> : null}

        {navigating ? <p className="tour-status">Opening {step.title.toLowerCase()}…</p> : null}

        {locked ? (
          <p className="tour-locked" role="status">
            Waiting for this to be done — it unlocks automatically, no need to come back here.
          </p>
        ) : null}

        <div className="tour-dots" aria-hidden="true">
          {TOUR_STEPS.map((item, index) => (
            <span
              key={item.id}
              className={`tour-dot${index === tourIndex ? ' is-active' : ''}${index < tourIndex ? ' is-done' : ''}`}
            />
          ))}
        </div>

        <div className="tour-actions">
          <button type="button" className="tour-end" onClick={handleEnd}>End tour</button>
          <div className="tour-action-group">
            <button type="button" className="btn-outline tour-btn" onClick={handleBack} disabled={first}>Back</button>
            {locked && step.skippable ? (
              <button type="button" className="btn-outline tour-btn" onClick={handleSkipStep}>Skip for now</button>
            ) : null}
            <button
              type="button"
              className="btn-primary tour-btn"
              onClick={handleNext}
              disabled={locked}
              title={locked ? 'Finish this step in the app and it unlocks on its own' : undefined}
            >
              {last ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
