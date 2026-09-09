import { describe, expect, it } from 'vitest';

import {
  advance,
  clampIndex,
  computePopoverPosition,
  isStepUnlocked,
  keyIntent,
  normalizeRoute,
  pickVisibleTarget,
  progressLabel,
  resolveStepRoute,
  resumeIndex,
  retreat,
} from './logic';
import type { TourRecord, TourStep } from './types';

function step(id: string, extra: Partial<TourStep> = {}): TourStep {
  return {
    id,
    route: '/dashboard',
    target: null,
    placement: 'center',
    title: id,
    body: id,
    ...extra,
  };
}

const steps = [step('welcome'), step('connect-mailbox'), step('add-leads'), step('finish')];

function record(patch: Partial<TourRecord> = {}): TourRecord {
  return { status: 'in_progress', lastStepId: null, lastStepIndex: 0, seenStepIds: [], ...patch };
}

describe('clampIndex', () => {
  it('keeps an index inside the list', () => {
    expect(clampIndex(2, 4)).toBe(2);
    expect(clampIndex(-3, 4)).toBe(0);
    expect(clampIndex(99, 4)).toBe(3);
  });

  it('survives NaN and an empty list', () => {
    expect(clampIndex(Number.NaN, 4)).toBe(0);
    expect(clampIndex(Number.POSITIVE_INFINITY, 4)).toBe(0);
    expect(clampIndex(2, 0)).toBe(0);
  });
});

describe('resumeIndex', () => {
  it('resolves by id first, so inserting a step does not drop the user', () => {
    const reordered = [step('welcome'), step('new-step'), step('connect-mailbox'), step('add-leads'), step('finish')];
    // Recorded against the old list, where connect-mailbox was index 1.
    const state = record({ lastStepId: 'connect-mailbox', lastStepIndex: 1 });
    expect(resumeIndex(reordered, state)).toBe(2);
  });

  it('falls back to the index when the id no longer exists', () => {
    const state = record({ lastStepId: 'deleted-step', lastStepIndex: 2 });
    expect(resumeIndex(steps, state)).toBe(2);
  });

  it('clamps a stale index from a longer list', () => {
    expect(resumeIndex(steps, record({ lastStepId: null, lastStepIndex: 41 }))).toBe(3);
  });

  it('starts over unless the tour is in progress', () => {
    expect(resumeIndex(steps, record({ status: 'completed', lastStepId: 'add-leads' }))).toBe(0);
    expect(resumeIndex(steps, record({ status: 'skipped', lastStepId: 'add-leads' }))).toBe(0);
    expect(resumeIndex(steps, record({ status: 'not_started', lastStepId: 'add-leads' }))).toBe(0);
    expect(resumeIndex(steps, null)).toBe(0);
    expect(resumeIndex([], record({ lastStepId: 'welcome' }))).toBe(0);
  });
});

describe('advance and retreat', () => {
  it('moves forward and reports finish on the last step', () => {
    expect(advance(0, steps)).toEqual({ action: 'move', index: 1 });
    expect(advance(3, steps)).toEqual({ action: 'finish', index: 3 });
  });

  it('moves back and stays put on the first step', () => {
    expect(retreat(2, steps)).toEqual({ action: 'move', index: 1 });
    expect(retreat(0, steps)).toEqual({ action: 'stay', index: 0 });
  });

  it('stays put on an empty list', () => {
    expect(advance(0, [])).toEqual({ action: 'stay', index: 0 });
    expect(retreat(0, [])).toEqual({ action: 'stay', index: 0 });
  });

  it('labels progress from a clamped index', () => {
    expect(progressLabel(1, steps)).toBe('Step 2 of 4');
    expect(progressLabel(99, steps)).toBe('Step 4 of 4');
  });
});

describe('isStepUnlocked', () => {
  const gated = step('connect-mailbox', { requiresId: 'connect-mailbox' });

  it('leaves an ungated step open', () => {
    expect(isStepUnlocked(step('welcome'), {})).toBe(true);
    expect(isStepUnlocked(step('welcome'), null)).toBe(true);
  });

  it('locks a gated step until the app itself reports it done', () => {
    expect(isStepUnlocked(gated, {})).toBe(false);
    expect(isStepUnlocked(gated, { 'connect-mailbox': false })).toBe(false);
    expect(isStepUnlocked(gated, { 'add-leads': true })).toBe(false);
    expect(isStepUnlocked(gated, { 'connect-mailbox': true })).toBe(true);
  });
});

describe('resolveStepRoute', () => {
  const dynamic = step('campaign-review', { route: '/dashboard?page=campaigns', dynamicRoute: 'firstCampaign' });

  it('prefers the resolved route', () => {
    expect(resolveStepRoute(dynamic, { firstCampaign: '/dashboard/campaigns/abc' })).toBe('/dashboard/campaigns/abc');
  });

  it('falls back to the static route when nothing is resolved yet', () => {
    expect(resolveStepRoute(dynamic, {})).toBe('/dashboard?page=campaigns');
    expect(resolveStepRoute(dynamic, { firstCampaign: null })).toBe('/dashboard?page=campaigns');
    expect(resolveStepRoute(dynamic, null)).toBe('/dashboard?page=campaigns');
  });
});

describe('normalizeRoute', () => {
  it('treats query order as insignificant', () => {
    expect(normalizeRoute('/dashboard?page=settings&section=mailbox'))
      .toBe(normalizeRoute('/dashboard?section=mailbox&page=settings'));
  });

  it('leaves a plain path alone', () => {
    expect(normalizeRoute('/dashboard')).toBe('/dashboard');
    expect(normalizeRoute(null)).toBe('');
  });
});

describe('keyIntent', () => {
  it('maps only the keys the tour owns', () => {
    expect(keyIntent('ArrowRight')).toBe('next');
    expect(keyIntent('Enter')).toBe('next');
    expect(keyIntent('ArrowLeft')).toBe('prev');
    expect(keyIntent('Escape')).toBe('skip');
    expect(keyIntent('a')).toBeNull();
    expect(keyIntent('Tab')).toBeNull();
  });
});

describe('pickVisibleTarget', () => {
  const hiddenSubtree = { offsetParent: null, getBoundingClientRect: () => ({ width: 220, height: 40 }) };
  const zeroBox = { offsetParent: {}, getBoundingClientRect: () => ({ width: 0, height: 0 }) };
  const visible = { offsetParent: {}, getBoundingClientRect: () => ({ width: 220, height: 40 }) };

  it('skips nodes in a display:none subtree', () => {
    expect(pickVisibleTarget([hiddenSubtree, visible])).toBe(visible);
  });

  it('skips nodes with a zero box', () => {
    expect(pickVisibleTarget([zeroBox, visible])).toBe(visible);
  });

  it('returns null when nothing on screen matches', () => {
    expect(pickVisibleTarget([hiddenSubtree, zeroBox])).toBeNull();
    expect(pickVisibleTarget([])).toBeNull();
    expect(pickVisibleTarget(null)).toBeNull();
  });
});

describe('computePopoverPosition', () => {
  const base = {
    popoverWidth: 320,
    popoverHeight: 200,
    viewportWidth: 1280,
    viewportHeight: 800,
    gap: 14,
    margin: 12,
  };

  it('honours the requested side when it fits', () => {
    const result = computePopoverPosition({
      ...base,
      rect: { top: 400, left: 500, width: 200, height: 40 },
      placement: 'bottom',
    });
    expect(result.placement).toBe('bottom');
    expect(result.top).toBe(454);
    expect(result.left).toBe(440);
  });

  it('flips to the opposite side when the preferred one overflows', () => {
    // Element near the top: there is no room above for a 200px popover.
    const result = computePopoverPosition({
      ...base,
      rect: { top: 20, left: 500, width: 200, height: 40 },
      placement: 'top',
    });
    expect(result.placement).toBe('bottom');
    expect(result.top).toBe(74);
  });

  it('falls through to another side when neither the request nor its opposite fits', () => {
    // Full-height element: nothing fits above or below, but there is room to the right.
    const result = computePopoverPosition({
      ...base,
      rect: { top: 0, left: 0, width: 228, height: 800 },
      placement: 'top',
    });
    expect(result.placement).toBe('right');
    expect(result.left).toBe(242);
  });

  it('centres when no side has room', () => {
    const result = computePopoverPosition({
      ...base,
      viewportWidth: 360,
      viewportHeight: 640,
      rect: { top: 0, left: 0, width: 360, height: 640 },
      placement: 'right',
    });
    expect(result.placement).toBe('center');
    expect(result.left).toBe(20);
  });

  it('centres an anchorless step', () => {
    const result = computePopoverPosition({ ...base, rect: null, placement: 'center' });
    expect(result).toEqual({ top: 300, left: 480, placement: 'center' });
  });

  it('clamps a popover that would hang off the edge', () => {
    const result = computePopoverPosition({
      ...base,
      rect: { top: 400, left: 1180, width: 90, height: 40 },
      placement: 'bottom',
    });
    expect(result.placement).toBe('bottom');
    expect(result.left).toBe(948); // 1280 - 320 - 12
  });
});
