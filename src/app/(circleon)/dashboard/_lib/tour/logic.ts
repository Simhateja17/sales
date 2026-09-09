/**
 * Every decision the tour makes lives here as a pure function: bounds, resume,
 * navigation intent, gating, keyboard mapping, target selection and popover
 * placement. The overlay component reads DOM and renders; it does not decide
 * anything. That split is what makes the hard parts (resume after a reorder,
 * flipping a popover that would fall off-screen) testable without a browser.
 *
 * The two functions that touch DOM types — pickVisibleTarget and
 * computePopoverPosition — still take plain values in and return plain values
 * out, so they are tested with hand-built rectangles and stub elements.
 */

import type {
  CompletionState,
  KeyIntent,
  PopoverPosition,
  RouteContext,
  TourIntent,
  TourPlacement,
  TourRecord,
  TourStep,
} from './types';

/** Safe bounds. Handles NaN, fractions, negatives and an empty list. */
export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), length - 1);
}

/**
 * Where a returning user picks up.
 *
 * Resolution is by `lastStepId` FIRST and only then by `lastStepIndex`: steps
 * get inserted and reordered between releases, and an index recorded against
 * the old list points at the wrong step in the new one. The id survives that;
 * the index is the fallback for a step that has since been deleted.
 *
 * Returns 0 for any status other than in_progress — a completed or skipped
 * tour that is restarted starts at the beginning, not where it left off.
 */
export function resumeIndex(steps: TourStep[], tourState?: TourRecord | null): number {
  if (!steps.length) return 0;
  if (!tourState || tourState.status !== 'in_progress') return 0;

  if (tourState.lastStepId) {
    const byId = steps.findIndex(step => step.id === tourState.lastStepId);
    if (byId >= 0) return byId;
  }

  return clampIndex(tourState.lastStepIndex, steps.length);
}

export function isFirstStep(index: number): boolean {
  return index <= 0;
}

export function isLastStep(index: number, steps: TourStep[]): boolean {
  return index >= steps.length - 1;
}

export function nextIndex(index: number, steps: TourStep[]): number {
  return clampIndex(index + 1, steps.length);
}

export function prevIndex(index: number, steps: TourStep[]): number {
  return clampIndex(index - 1, steps.length);
}

export function progressLabel(index: number, steps: TourStep[]): string {
  if (!steps.length) return 'Step 0 of 0';
  return `Step ${clampIndex(index, steps.length) + 1} of ${steps.length}`;
}

/**
 * Intent objects rather than mutations: the caller decides whether to move or
 * to close, so both outcomes are one assertion in a test rather than a spy on
 * a setter.
 */
export function advance(index: number, steps: TourStep[]): TourIntent {
  if (!steps.length) return { action: 'stay', index: 0 };
  const current = clampIndex(index, steps.length);
  if (isLastStep(current, steps)) return { action: 'finish', index: current };
  return { action: 'move', index: nextIndex(current, steps) };
}

export function retreat(index: number, steps: TourStep[]): TourIntent {
  if (!steps.length) return { action: 'stay', index: 0 };
  const current = clampIndex(index, steps.length);
  if (isFirstStep(current)) return { action: 'stay', index: 0 };
  return { action: 'move', index: prevIndex(current, steps) };
}

/**
 * A step with no requiresId is always unlocked. A gated one is unlocked only
 * when the completion state — derived from the same data the dashboard renders
 * its own checklist from — says the task is done. The tour therefore cannot
 * claim something is finished while the app still shows it outstanding.
 */
export function isStepUnlocked(step: TourStep | null | undefined, completionState?: CompletionState | null): boolean {
  if (!step || !step.requiresId) return true;
  return Boolean(completionState?.[step.requiresId]);
}

/**
 * Context values are fully resolved routes, so a step that depends on an id
 * fetched at runtime falls back to its static route the moment that id is not
 * available yet (or does not exist at all, for a user who skipped the step
 * that would have created it).
 */
export function resolveStepRoute(step: TourStep | null | undefined, context?: RouteContext | null): string | null {
  if (!step) return null;
  if (step.dynamicRoute) {
    const resolved = context?.[step.dynamicRoute];
    if (resolved) return resolved;
  }
  return step.route;
}

/**
 * Routes are compared as pathname plus sorted query, because this app's pages
 * are query parameters ('/dashboard?page=leads') and '?page=settings&section=x'
 * and '?section=x&page=settings' are the same page. Comparing the raw strings
 * would navigate in a loop.
 */
export function normalizeRoute(route: string | null | undefined): string {
  if (!route) return '';
  const [pathname, query = ''] = route.split('?');
  const params = new URLSearchParams(query);
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const search = sorted.map(([key, value]) => `${key}=${value}`).join('&');
  return search ? `${pathname}?${search}` : pathname;
}

export function keyIntent(key: string): KeyIntent {
  if (key === 'ArrowRight' || key === 'Enter') return 'next';
  if (key === 'ArrowLeft') return 'prev';
  if (key === 'Escape') return 'skip';
  return null;
}

type MeasurableElement = {
  getBoundingClientRect: () => { width: number; height: number };
  offsetParent?: unknown;
};

/**
 * A selector can match several nodes: responsive layouts routinely render the
 * same control twice and hide one. Pick the first candidate that is actually
 * on screen — a non-zero box AND an offsetParent, since a null offsetParent
 * means the node sits inside a display:none subtree and would measure as a
 * zero rect at the top-left corner.
 */
export function pickVisibleTarget<T extends MeasurableElement>(candidates: ArrayLike<T> | null | undefined): T | null {
  if (!candidates) return null;
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (!candidate) continue;
    if (candidate.offsetParent === null) continue;
    const rect = candidate.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return candidate;
  }
  return null;
}

export interface PopoverPositionInput {
  rect: { top: number; left: number; width: number; height: number } | null;
  placement: TourPlacement;
  popoverWidth: number;
  popoverHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  gap?: number;
  margin?: number;
}

const OPPOSITE: Record<Exclude<TourPlacement, 'center'>, Exclude<TourPlacement, 'center'>> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Measure the available space on all four sides, then try the requested side,
 * its opposite, and the remaining sides in a fixed order, falling back to a
 * centred card when nothing fits. The result is clamped inside the viewport so
 * a popover next to an element at the very edge still lands fully on screen.
 */
export function computePopoverPosition({
  rect,
  placement,
  popoverWidth,
  popoverHeight,
  viewportWidth,
  viewportHeight,
  gap = 14,
  margin = 12,
}: PopoverPositionInput): PopoverPosition {
  const centred = (): PopoverPosition => ({
    top: Math.max(margin, Math.round((viewportHeight - popoverHeight) / 2)),
    left: Math.max(margin, Math.round((viewportWidth - popoverWidth) / 2)),
    placement: 'center',
  });

  if (!rect || placement === 'center') return centred();

  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;

  const fits: Record<Exclude<TourPlacement, 'center'>, boolean> = {
    top: rect.top - gap - popoverHeight >= margin,
    bottom: bottom + gap + popoverHeight <= viewportHeight - margin,
    left: rect.left - gap - popoverWidth >= margin,
    right: right + gap + popoverWidth <= viewportWidth - margin,
  };

  const requested = placement as Exclude<TourPlacement, 'center'>;
  const order: Array<Exclude<TourPlacement, 'center'>> = [];
  for (const candidate of [requested, OPPOSITE[requested], 'bottom', 'top', 'right', 'left'] as const) {
    if (!order.includes(candidate)) order.push(candidate);
  }

  const chosen = order.find(candidate => fits[candidate]);
  if (!chosen) return centred();

  let top: number;
  let left: number;

  if (chosen === 'top') {
    top = rect.top - gap - popoverHeight;
    left = rect.left + rect.width / 2 - popoverWidth / 2;
  } else if (chosen === 'bottom') {
    top = bottom + gap;
    left = rect.left + rect.width / 2 - popoverWidth / 2;
  } else if (chosen === 'left') {
    top = rect.top + rect.height / 2 - popoverHeight / 2;
    left = rect.left - gap - popoverWidth;
  } else {
    top = rect.top + rect.height / 2 - popoverHeight / 2;
    left = right + gap;
  }

  return {
    top: Math.round(clamp(top, margin, viewportHeight - popoverHeight - margin)),
    left: Math.round(clamp(left, margin, viewportWidth - popoverWidth - margin)),
    placement: chosen,
  };
}
