import type { SingleCall } from '@/lib/api';

export type CallStage = 'dialling' | 'on_call' | 'ended' | 'scheduled' | 'failed';

export const OPEN_STATUSES = ['queued', 'calling', 'ringing', 'in_progress'];

/** Which of the live steps a call is on. Retell only reports a call once it connects. */
export function callStage(status: string): CallStage {
  if (status === 'scheduled') return 'scheduled';
  if (status === 'in_progress') return 'on_call';
  if (OPEN_STATUSES.includes(status)) return 'dialling';
  if (status === 'failed' || status === 'canceled') return 'failed';
  return 'ended';
}

function outcomeOf(call: SingleCall) {
  return call.outcome_type || call.call_outcomes?.[0]?.outcome_type || null;
}

/** The result of a finished call, in plain words. */
export function callResultLabel(call: SingleCall) {
  const outcome = outcomeOf(call);
  if (outcome === 'booked' || call.meetings?.starts_at) return 'Meeting booked';
  if (call.status === 'no_answer' || call.status === 'busy' || outcome === 'no_answer') return 'No answer';
  if (call.status === 'failed') return 'Call failed';
  if (call.status === 'canceled') return 'Canceled';
  if (outcome === 'do_not_call') return 'Asked not to be called';
  if (outcome === 'not_interested') return 'Not interested';
  if (outcome === 'interested' || outcome === 'follow_up_needed' || outcome === 'booking_link_sent') return 'Needs follow-up';
  return 'Call ended';
}

/** Retell's summary arrives shortly after the call ends, so keep waiting for a while. */
export function resultStillArriving(call: SingleCall, waitedSeconds: number) {
  if (callStage(call.status) !== 'ended') return false;
  if (call.summary || call.outcome_summary || outcomeOf(call)) return false;
  return waitedSeconds < 120;
}

export function minutesUsed(seconds: number | null | undefined) {
  if (!seconds) return 0;
  return Math.ceil(seconds / 60);
}

/** "Wed 4 Nov, 9:00 am" in the calling timezone, not the browser's. */
export function formatCallTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone,
  }).format(new Date(iso)).replace(' at ', ', ');
}
