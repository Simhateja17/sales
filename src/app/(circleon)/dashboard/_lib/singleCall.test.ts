import { describe, expect, it } from 'vitest';
import type { SingleCall } from '@/lib/api';
import { callResultLabel, callStage, formatCallTime, minutesUsed, resultStillArriving } from './singleCall';

const call = (overrides: Partial<SingleCall>) => ({ id: 'c', status: 'completed', ...overrides }) as SingleCall;

describe('callStage', () => {
  it('follows the call from dialling to the end', () => {
    expect(callStage('queued')).toBe('dialling');
    expect(callStage('calling')).toBe('dialling');
    expect(callStage('in_progress')).toBe('on_call');
    expect(callStage('completed')).toBe('ended');
    expect(callStage('no_answer')).toBe('ended');
    expect(callStage('failed')).toBe('failed');
    expect(callStage('scheduled')).toBe('scheduled');
  });
});

describe('callResultLabel', () => {
  it('puts a booked meeting first', () => {
    expect(callResultLabel(call({ meetings: { id: 'm', starts_at: '2026-11-05T01:00:00Z', status: 'scheduled' } }))).toBe('Meeting booked');
    expect(callResultLabel(call({ outcome_type: 'booked' }))).toBe('Meeting booked');
  });
  it('names the other results', () => {
    expect(callResultLabel(call({ status: 'no_answer' }))).toBe('No answer');
    expect(callResultLabel(call({ outcome_type: 'no_answer' }))).toBe('No answer');
    expect(callResultLabel(call({ outcome_type: 'follow_up_needed' }))).toBe('Needs follow-up');
    expect(callResultLabel(call({ outcome_type: 'do_not_call' }))).toBe('Asked not to be called');
    expect(callResultLabel(call({}))).toBe('Call ended');
  });
});

describe('resultStillArriving', () => {
  it('waits for the summary, but not forever', () => {
    expect(resultStillArriving(call({}), 10)).toBe(true);
    expect(resultStillArriving(call({}), 121)).toBe(false);
    expect(resultStillArriving(call({ summary: 'Went well' }), 10)).toBe(false);
    expect(resultStillArriving(call({ status: 'in_progress' }), 10)).toBe(false);
  });
});

describe('formatting', () => {
  it('rounds call time up to whole minutes', () => {
    expect(minutesUsed(null)).toBe(0);
    expect(minutesUsed(61)).toBe(2);
  });
  it('shows the time in the calling timezone', () => {
    expect(formatCallTime('2026-11-04T01:00:00Z', 'Asia/Singapore')).toMatch(/Wed.*4 Nov.*9:00/);
  });
});
