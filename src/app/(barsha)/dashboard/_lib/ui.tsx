import type { Campaign } from '@/lib/api';

export type Page = 'overview' | 'campaigns' | 'leads' | 'inbox' | 'meetings' | 'analytics' | 'settings' | 'billing' | 'support';

export const navItems: Array<{ id: Page; label: string; marker: string }> = [
  { id: 'overview', label: 'Home', marker: 'Ho' },
  { id: 'campaigns', label: 'Campaigns', marker: 'Ca' },
  { id: 'leads', label: 'Leads', marker: 'Le' },
  { id: 'inbox', label: 'Conversations', marker: 'Co' },
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
      {items.map(([label, value, marker], index) => (
        <div className="kpi-card" key={label}>
          <div className={`kpi-icon ${['ki-p', 'ki-g', 'ki-gr', 'ki-b'][index]}`}>{marker}</div>
          <div className="kpi-val">{value}</div>
          <div className="kpi-lbl">{label}</div>
          <span className="kpi-delta kd-neutral">Live</span>
        </div>
      ))}
    </div>
  );
}

export function CampaignRow({ campaign, active, onClick }: { campaign: Campaign; active?: boolean; onClick: () => void }) {
  return (
    <button
      className="mtr"
      type="button"
      onClick={onClick}
      style={{ width: '100%', border: 0, textAlign: 'left', background: active ? 'var(--purple-pale)' : 'transparent' }}
    >
      <div className="mtr-av">{initials(campaign.name)}</div>
      <div className="mtr-info">
        <div className="mtr-name">{campaign.name}</div>
        <div className="mtr-detail">{campaign.daily_send_cap}/day · {campaign.sending_hours_start || '09:00'}–{campaign.sending_hours_end || '18:00'} · {campaign.timezone || 'Asia/Singapore'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={`badge ${statusBadge(campaign.status)}`}><span className="bdot" />{campaign.status}</span>
        <span className="card-action">Open →</span>
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
