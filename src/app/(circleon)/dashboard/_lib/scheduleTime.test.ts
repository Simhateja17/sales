import { describe, expect, it } from 'vitest';
import { formatScheduledTime, rescheduleResultMessage, sendingWindowText } from './scheduleTime';

const SG = 'Asia/Singapore';
const IN = 'Asia/Kolkata';
const campaign = { sending_hours_start: '09:00:00', sending_hours_end: '17:30:00', timezone: SG, active_days: [1, 2, 3, 4, 5] };
const now = new Date('2026-11-03T16:24:00Z');
const clean = (text: string) => text.replace(/ /g, ' ');

describe('formatScheduledTime', () => {
  it('names the campaign time and the viewer time', () => {
    expect(clean(formatScheduledTime('2026-11-04T01:00:00Z', SG, IN))).toBe('4 Nov 2026, 9:00 am Singapore time (6:30 am your time)');
  });
  it('shows one time when both zones match', () => {
    expect(clean(formatScheduledTime('2026-11-04T01:00:00Z', SG, SG))).toBe('4 Nov 2026, 9:00 am Singapore time');
  });
  it('shows the viewer date when it falls on a different day', () => {
    expect(clean(formatScheduledTime('2026-11-04T01:00:00Z', SG, 'America/New_York'))).toBe('4 Nov 2026, 9:00 am Singapore time (3 Nov, 8:00 pm your time)');
  });
});

describe('sendingWindowText', () => {
  it('converts the hours for the viewer', () => {
    expect(clean(sendingWindowText(campaign, IN, now))).toBe('Mon to Fri, 9:00 am to 5:30 pm Singapore time (6:30 am to 3:00 pm your time)');
  });
  it('leaves out the conversion for a viewer in the same zone', () => {
    expect(clean(sendingWindowText(campaign, SG, now))).toBe('Mon to Fri, 9:00 am to 5:30 pm Singapore time');
  });
  it('lists unusual days', () => {
    expect(clean(sendingWindowText({ ...campaign, active_days: [6, 1] }, SG, now))).toContain('Mon, Sat, 9:00 am');
  });
});

describe('rescheduleResultMessage', () => {
  it('confirms a time that was kept', () => {
    expect(clean(rescheduleResultMessage('2026-11-04T02:00:00Z', '2026-11-04T02:00:00Z', SG, IN))).toBe('Email rescheduled for 4 Nov 2026, 10:00 am Singapore time (7:30 am your time).');
  });
  it('says so when the time was moved', () => {
    expect(clean(rescheduleResultMessage('2026-11-03T16:30:00Z', '2026-11-04T01:00:00Z', SG, IN))).toBe("That time is outside this campaign's sending hours or limits, so this email will go out on 4 Nov 2026, 9:00 am Singapore time (6:30 am your time).");
  });
});
