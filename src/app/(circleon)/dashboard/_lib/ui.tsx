import type { Campaign } from '@/lib/api';

export type Page = 'overview' | 'campaigns' | 'leads' | 'inbox' | 'meetings' | 'analytics' | 'settings' | 'billing' | 'support';

export const navItems: Array<{ id: Page; label: string; marker: string }> = [
  { id: 'overview', label: 'Home', marker: 'Ho' },
  { id: 'campaigns', label: 'Campaigns', marker: 'Ca' },
  { id: 'leads', label: 'Leads', marker: 'Le' },
  { id: 'inbox', label: 'Inbox', marker: 'In' },
  { id: 'meetings', label: 'Meetings', marker: 'Me' },
  { id: 'analytics', label: 'Analytics', marker: 'An' },
  { id: 'settings', label: 'Settings', marker: 'Se' },
  { id: 'billing', label: 'Billing', marker: 'Bi' },
  { id: 'support', label: 'Support', marker: 'Su' },
];

export function initials(name?: string | null) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'NA';
}

/**
 * Campaign status uses its own palette: the design reads "active" as the brand
 * purple, not the green that statusBadge() gives it. Green is reserved there
 * for genuinely positive outcomes (booked meetings, positive replies), and a
 * campaign merely running is not one of those.
 */
export function campaignStatusBadge(status?: string | null) {
  if (['active', 'ready'].includes(status || '')) return 'b-interested';
  if (['draft', 'generating'].includes(status || '')) return 'b-pending';
  return 'b-noanswer';
}

/**
 * Initials for a campaign name, which is a label rather than a person's name.
 * A leading short or numeric token reads better kept whole ("Q3 Investor
 * Outreach" -> "Q3", "LP Renewal Sequence" -> "LP") than reduced to one letter
 * each, which gives the unhelpful "QI" / "LR".
 */
export function campaignInitials(name?: string | null) {
  const words = String(name || '').split(' ').filter(Boolean);
  if (!words.length) return 'NA';
  const first = words[0];
  if (first.length <= 2 || /\d/.test(first)) return first.slice(0, 2).toUpperCase();
  return words.slice(0, 2).map(word => word[0]?.toUpperCase()).join('');
}

/**
 * Reply intent, using the design's palette: positive reads purple, a pricing
 * question gold, everything else neutral.
 */
export function intentBadge(intent?: string | null) {
  if (intent === 'positive') return 'b-interested';
  if (intent === 'pricing') return 'b-pending';
  return 'b-noanswer';
}

export function statusBadge(status?: string | null) {
  if (!status) return 'b-noanswer';
  if (['active', 'sent', 'auto_sent', 'booked', 'positive'].includes(status)) return 'b-booked';
  if (['ready', 'approved', 'interested'].includes(status)) return 'b-interested';
  if (['draft', 'pending_approval', 'generating', 'queued', 'needs_reply', 'draft_ready'].includes(status)) return 'b-pending';
  if (['failed', 'rejected', 'not_interested', 'dnc_request', 'unsubscribed'].includes(status)) return 'b-noanswer';
  return 'b-new';
}

export function fmtDate(value?: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-SG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function KpiRow({ items }: { items: Array<[string, number, string]> }) {
  return (
    <div className="kpi-row">
      {items.map(([label, value, marker]) => (
        <div className="kpi-card" key={label}>
          <div className="kpi-icon">{marker}</div>
          <div className="kpi-val">{value}</div>
          <div className="kpi-lbl">{label}</div>
          <span className="kpi-live">Live</span>
        </div>
      ))}
    </div>
  );
}

export function CampaignRow({ campaign, active, onClick }: { campaign: Campaign; active?: boolean; onClick: () => void }) {
  return (
    <button
      className={`mtr${active ? ' is-active' : ''}`}
      type="button"
      onClick={onClick}
    >
      <div className="mtr-av">{campaignInitials(campaign.name)}</div>
      <div className="mtr-info">
        <div className="mtr-name">{campaign.name}</div>
        <div className="mtr-detail">{campaign.daily_send_cap}/day · {campaign.sending_hours_start || '09:00'}–{campaign.sending_hours_end || '18:00'}</div>
        {campaign.attention_required ? <div className="mtr-detail" style={{ marginTop: 4, color: 'var(--purple)' }}>Requires your attention before Autopilot can use it</div> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={`badge ${campaignStatusBadge(campaign.status)}`}>{campaign.status}</span>
        <span className="card-action">Open <span className="ca-arrow" aria-hidden="true">→</span></span>
      </div>
    </button>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="msl-row">
      <span className="msl-lbl">{label}</span>
      <span className="msl-val">{value}</span>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="sf-hint" style={{ padding: 20 }}>{text}</div>;
}
