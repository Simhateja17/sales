// Campaign sending hours are set in the campaign's timezone, while the person
// reading the page may be elsewhere. These helpers always name both.

const LOCALE = 'en-SG';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function zoneName(timeZone: string) {
  return (timeZone.split('/').pop() || timeZone).replace(/_/g, ' ');
}

function format(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone, ...options }).format(date);
}

const timeOnly = (date: Date, timeZone: string) => format(date, timeZone, { hour: 'numeric', minute: '2-digit' });
const dayOnly = (date: Date, timeZone: string) => format(date, timeZone, { day: 'numeric', month: 'short', year: 'numeric' });

function sameClock(date: Date, a: string, b: string) {
  return dayOnly(date, a) === dayOnly(date, b) && timeOnly(date, a) === timeOnly(date, b);
}

/** e.g. "4 Nov 2026, 9:00 am Singapore time (6:30 am your time)". */
export function formatScheduledTime(value: string | Date, campaignTimeZone: string, viewerTimeZone = browserTimeZone()) {
  const date = new Date(value);
  const campaignText = `${dayOnly(date, campaignTimeZone)}, ${timeOnly(date, campaignTimeZone)} ${zoneName(campaignTimeZone)} time`;
  if (sameClock(date, campaignTimeZone, viewerTimeZone)) return campaignText;
  const sameDay = dayOnly(date, campaignTimeZone) === dayOnly(date, viewerTimeZone);
  const viewerDay = sameDay ? '' : `${format(date, viewerTimeZone, { day: 'numeric', month: 'short' })}, `;
  return `${campaignText} (${viewerDay}${timeOnly(date, viewerTimeZone)} your time)`;
}

/** The instant a wall-clock time happens in a timezone, on the day containing `on`. */
function wallClockToDate(hhmm: string, timeZone: string, on: Date) {
  const [hour, minute] = hhmm.split(':').map(Number);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(on);
  const part = (type: string) => Number(parts.find(item => item.type === type)?.value);
  const target = Date.UTC(part('year'), part('month') - 1, part('day'), hour, minute);
  const asUtc = (date: Date) => {
    const shown = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => Number(shown.find(item => item.type === type)?.value);
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  };
  const guess = new Date(target);
  return new Date(target - (asUtc(guess) - target));
}

function activeDaysText(activeDays: number[] | null | undefined) {
  const days = [...(activeDays?.length ? activeDays : [1, 2, 3, 4, 5])].sort((a, b) => a - b);
  if (days.join() === '1,2,3,4,5') return 'Mon to Fri';
  if (days.length === 7) return 'every day';
  return days.map(day => DAY_NAMES[day]).join(', ');
}

/** e.g. "Mon to Fri, 9:00 am to 5:30 pm Singapore time (6:30 am to 3:00 pm your time)". */
export function sendingWindowText(
  campaign: { sending_hours_start?: string | null; sending_hours_end?: string | null; timezone?: string | null; active_days?: number[] | null },
  viewerTimeZone = browserTimeZone(),
  now = new Date(),
) {
  const timeZone = campaign.timezone || 'Asia/Singapore';
  const start = wallClockToDate(campaign.sending_hours_start || '09:00', timeZone, now);
  const end = wallClockToDate(campaign.sending_hours_end || '18:00', timeZone, now);
  const hours = `${activeDaysText(campaign.active_days)}, ${timeOnly(start, timeZone)} to ${timeOnly(end, timeZone)} ${zoneName(timeZone)} time`;
  if (sameClock(start, timeZone, viewerTimeZone)) return hours;
  return `${hours} (${timeOnly(start, viewerTimeZone)} to ${timeOnly(end, viewerTimeZone)} your time)`;
}

/** Says plainly when the scheduler could not use the time that was asked for. */
export function rescheduleResultMessage(requested: string | Date, saved: string | Date, campaignTimeZone: string, viewerTimeZone = browserTimeZone()) {
  const when = formatScheduledTime(saved, campaignTimeZone, viewerTimeZone);
  const moved = Math.abs(new Date(saved).getTime() - new Date(requested).getTime()) >= 60000;
  return moved
    ? `That time is outside this campaign's sending hours or limits, so this email will go out on ${when}.`
    : `Email rescheduled for ${when}.`;
}
