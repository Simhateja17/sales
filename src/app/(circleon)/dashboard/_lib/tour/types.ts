/**
 * Shared tour types. These live apart from both the step data and the logic so
 * neither has to import the other: steps.ts is pure data, logic.ts is pure
 * functions, and a cycle between them would be the only thing forcing one of
 * them to know about the other.
 */

export type TourStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  /**
   * Stable slug. Never reuse or recycle one: it is how a half-finished tour
   * finds its way back to the right step after the list is reordered, and it
   * is what any later analytics would be keyed on.
   */
  id: string;
  /** Full path including query string, e.g. '/dashboard?page=leads'. null = stay put. */
  route: string | null;
  /** CSS selector of the element to spotlight. null = anchorless centred card. */
  target: string | null;
  placement: TourPlacement;
  title: string;
  body: string;
  /** Optional secondary note, rendered in a tinted box under the body. */
  footnote?: string;
  /**
   * Optional gate. Next stays disabled until this id is true in the completion
   * state derived from the app's own data — never from tour-local bookkeeping.
   */
  requiresId?: string;
  /** While locked, offer "Skip for now" instead of trapping the user. */
  skippable?: boolean;
  /**
   * Key into the live route context. The context holds fully resolved routes,
   * not raw ids, so this module never has to know how a URL is spelled.
   */
  dynamicRoute?: string;
}

/** The persisted record. Stored as a jsonb blob on workspaces.tour_state. */
export interface TourRecord {
  status: TourStatus;
  lastStepId: string | null;
  lastStepIndex: number;
  seenStepIds: string[];
  updatedAt?: string | null;
}

/** gate id -> whether the app itself considers that task done. */
export type CompletionState = Record<string, boolean>;

/** dynamicRoute key -> resolved route, or null when it cannot be resolved yet. */
export type RouteContext = Record<string, string | null | undefined>;

export type TourIntent =
  | { action: 'move'; index: number }
  | { action: 'finish'; index: number }
  | { action: 'stay'; index: number };

export type KeyIntent = 'next' | 'prev' | 'skip' | null;

export interface PopoverPosition {
  top: number;
  left: number;
  placement: TourPlacement;
}
