'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBillingStatus, getCallingStatus, type BillingUsage, type Campaign, type CallRecord, type EmailMessage, type Lead, type Meeting } from '@/lib/api';

type Range = 7 | 14 | 30;

const DAY_MS = 86400000;
const RANGES: Range[] = [7, 14, 30];
const INTENTS: Array<[string, string]> = [['positive', 'Positive'], ['pricing', 'Asked about pricing'], ['not_interested', 'Not interested'], ['auto_reply', 'Auto reply'], ['dnc_request', 'Opt-out request']];
const CAMPAIGN_STATUSES: Array<[string, string]> = [['draft', 'Draft'], ['active', 'Active'], ['paused', 'Paused'], ['completed', 'Completed']];

const sentAt = (message: EmailMessage) => new Date(message.sent_at || message.created_at).getTime();
const receivedAt = (message: EmailMessage) => new Date(message.received_at || message.created_at).getTime();
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 1000) / 10}%` : null);

/** Patterns that can be stated truthfully from the replies themselves; nothing here is guessed. */
function insightsFor(replies: EmailMessage[]) {
  if (replies.length < 3) return [];
  const out: string[] = [];
  const weekdays = new Map<string, number>();
  const hours = new Map<number, number>();
  for (const reply of replies) {
    const at = new Date(receivedAt(reply));
    const day = new Intl.DateTimeFormat('en-SG', { weekday: 'long', timeZone: 'Asia/Singapore' }).format(at);
    const hour = Number(new Intl.DateTimeFormat('en-SG', { hour: 'numeric', hour12: false, timeZone: 'Asia/Singapore' }).format(at)) % 24;
    weekdays.set(day, (weekdays.get(day) || 0) + 1);
    hours.set(hour, (hours.get(hour) || 0) + 1);
  }
  const topDay = [...weekdays.entries()].sort((a, b) => b[1] - a[1])[0];
  const topHour = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];
  const clock = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? 'am' : 'pm'}`;
  if (topDay) out.push(`${topDay[0]} brought the most replies (${topDay[1]} of ${replies.length}).`);
  if (topHour) out.push(`Replies peak around ${clock(topHour[0])} SGT.`);
  const positive = replies.filter(reply => reply.intent_classification === 'positive').length;
  out.push(positive ? `${pct(positive, replies.length)} of replies showed interest.` : 'No reply has shown interest yet. A sharper first line may help.');
  return out;
}

export default function AnalyticsView({ sentMail, inbox, campaigns, meetings, emailLeads }: {
  sentMail: EmailMessage[];
  inbox: EmailMessage[];
  campaigns: Campaign[];
  meetings: Meeting[];
  emailLeads: Lead[];
}) {
  const [range, setRange] = useState<Range>(14);
  const [campaignId, setCampaignId] = useState('');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [usage, setUsage] = useState<BillingUsage | null>(null);

  useEffect(() => {
    getCallingStatus().then(data => setCalls(data.calls || [])).catch(() => {});
    getBillingStatus().then(data => setUsage(data.usage)).catch(() => {});
  }, []);

  const view = useMemo(() => {
    const since = Date.now() - range * DAY_MS;
    const inCampaign = (message: EmailMessage) => !campaignId || message.campaign_id === campaignId;
    const sent = sentMail.filter(message => inCampaign(message) && sentAt(message) >= since);
    const replies = inbox.filter(message => message.direction === 'inbound' && inCampaign(message) && receivedAt(message) >= since);
    const positive = replies.filter(message => message.intent_classification === 'positive').length;
    const contacted = new Set(sent.map(message => message.lead_id)).size;
    const booked = meetings.filter(meeting => new Date(meeting.created_at).getTime() >= since && meeting.status !== 'canceled').length;
    const days = Array.from({ length: range }, (_, index) => {
      const date = new Date(Date.now() - (range - 1 - index) * DAY_MS);
      return { key: date.toDateString(), label: String(date.getDate()), sent: 0, replies: 0 };
    });
    const byKey = new Map(days.map(day => [day.key, day]));
    for (const message of sent) { const day = byKey.get(new Date(sentAt(message)).toDateString()); if (day) day.sent += 1; }
    for (const message of replies) { const day = byKey.get(new Date(receivedAt(message)).toDateString()); if (day) day.replies += 1; }
    return { sent, replies, positive, contacted, booked, days };
  }, [range, campaignId, sentMail, inbox, meetings]);

  const periodCalls = calls.filter(call => new Date(call.started_at || call.created_at).getTime() >= Date.now() - range * DAY_MS);
  const answered = periodCalls.filter(call => call.status === 'completed');
  const callBooked = periodCalls.filter(call => call.meeting_id || call.outcome_type === 'booked').length;
  const avgSeconds = answered.length ? Math.round(answered.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / answered.length) : 0;
  const insights = insightsFor(view.replies);

  const chartMax = Math.max(1, ...view.days.map(day => Math.max(day.sent, day.replies * 5)));
  const base = 200;
  const unit = 168 / chartMax;
  const step = 760 / view.days.length;
  const barWidth = Math.min(34, step * 0.62);
  const labelEvery = range === 30 ? 3 : 1;

  return (
    <section className="an2">
      <div className="page-header">
        <div>
          <div className="page-kicker">Performance</div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-sub">See what earns a reply, across email and calls.</p>
        </div>
        <div className="an2-controls">
          <div className="view-switch" role="group" aria-label="Date range">
            {RANGES.map(value => (
              <button key={value} type="button" className={`rs-pill${range === value ? ' is-active' : ''}`} aria-pressed={range === value} onClick={() => setRange(value)}>{value} days</button>
            ))}
          </div>
          <select className="an2-select" aria-label="Campaign" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
            <option value="">All campaigns</option>
            {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
          </select>
        </div>
      </div>

      <div className="an-funnel" data-tour="analytics-kpis" aria-label="Funnel">
        <div><small>Leads contacted</small><b>{view.contacted}</b><span>{emailLeads.length ? `of ${emailLeads.length} verified work emails` : 'Verified work emails'}</span></div>
        <div><small>Emails sent</small><b>{view.sent.length}</b><span>First email + follow-ups</span></div>
        <div><small>Replies</small><b>{view.replies.length}</b><span className={view.contacted ? 'is-good' : ''}>{pct(view.replies.length, view.contacted) ? `${pct(view.replies.length, view.contacted)} of leads` : 'No leads contacted yet'}</span></div>
        <div><small>Positive replies</small><b>{view.positive}</b><span className={view.replies.length ? 'is-good' : ''}>{pct(view.positive, view.replies.length) ? `${pct(view.positive, view.replies.length)} of replies` : 'No replies yet'}</span></div>
        <div className="is-hi"><small>Meetings booked</small><b>{view.booked}</b><span>{pct(view.booked, view.contacted) ? `${pct(view.booked, view.contacted)} of leads` : 'No leads contacted yet'}</span></div>
      </div>

      <div className="an2-g2">
        <div className="an2-panel">
          <div className="an2-head">
            <div><h3>Daily sending and replies</h3><p>Last {range} days.</p></div>
            <div className="an-legend"><span><i style={{ background: '#D9CCF5' }} />Sent</span><span><i style={{ background: '#7447C8' }} />Replies (x5 scale)</span></div>
          </div>
          <svg className="an-chart-svg" viewBox="0 0 760 226" width="100%" role="img" aria-label="Bar chart of emails sent and replies per day">
            <line x1="0" y1={base} x2="760" y2={base} stroke="var(--rule)" />
            {view.days.map((day, index) => {
              const x = index * step + (step - barWidth) / 2;
              return (
                <g key={day.key}>
                  <rect x={x} y={base - day.sent * unit} width={barWidth} height={day.sent * unit} rx="4" fill="#D9CCF5" />
                  <rect x={x} y={base - day.replies * 5 * unit} width={barWidth} height={day.replies * 5 * unit} rx="4" fill="#7447C8" />
                  {index % labelEvery === 0 ? <text x={x + barWidth / 2} y="218" textAnchor="middle" fontSize="11" fill="var(--ink-mute)">{day.label}</text> : null}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="an2-panel">
          <h3>What we learned</h3>
          <p className="an2-s">Patterns from your replies this period.</p>
          {insights.length ? insights.map(text => <div className="an2-ins" key={text}><i /><span>{text}</span></div>) : (
            <div className="an2-wait">
              <span className="an2-wait-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" /></svg></span>
              <b>{Math.min(view.replies.length, 3)} of 3 replies so far</b>
              <div className="an2-wait-bar" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={Math.min(view.replies.length, 3)}><i style={{ width: `${(Math.min(view.replies.length, 3) / 3) * 100}%` }} /></div>
              <p>Once three replies come in, you will see which day and time get the most replies and how many show interest.</p>
            </div>
          )}
        </div>
      </div>

      <div className="an2-g3">
        <div className="an2-panel">
          <h3>Reply intent</h3>
          <p className="an2-s">{view.replies.length} repl{view.replies.length === 1 ? 'y' : 'ies'}, classified by AI</p>
          {INTENTS.map(([key, label]) => {
            const count = view.replies.filter(reply => reply.intent_classification === key).length;
            return <div className="an-bar" key={key}><span>{label}</span><div className="an-bar-track"><i style={{ width: `${view.replies.length ? Math.round((count / view.replies.length) * 100) : 0}%` }} /></div><b>{count}</b></div>;
          })}
        </div>
        <div className="an2-panel">
          <h3>Voice agent</h3>
          <p className="an2-s">AI calls this period</p>
          <div className="an2-kv"><span>Calls answered</span><b>{answered.length}</b></div>
          <div className="an2-kv"><span>Minutes used</span><b>{usage ? (usage.limits.minutes ? `${usage.used.minutes} of ${usage.limits.minutes}` : usage.used.minutes) : '—'}</b></div>
          <div className="an2-kv"><span>Appointments booked</span><b>{callBooked}</b></div>
          <div className="an2-kv"><span>Avg. call length</span><b>{avgSeconds ? `${Math.floor(avgSeconds / 60)}m ${String(avgSeconds % 60).padStart(2, '0')}s` : '—'}</b></div>
        </div>
        <div className="an2-panel">
          <h3>Campaigns</h3>
          <p className="an2-s">Campaigns by status</p>
          {CAMPAIGN_STATUSES.map(([key, label]) => {
            const count = campaigns.filter(campaign => campaign.status === key).length;
            return <div className="an-bar an-bar-gold" key={key}><span>{label}</span><div className="an-bar-track"><i style={{ width: `${campaigns.length ? Math.round((count / campaigns.length) * 100) : 0}%` }} /></div><b>{count}</b></div>;
          })}
        </div>
      </div>
      <p className="an2-foot">Open rates are not shown because email clients block open tracking unreliably.</p>
    </section>
  );
}
