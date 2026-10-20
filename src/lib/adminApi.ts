const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class AdminError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = 'AdminError';
    this.status = status;
    this.code = code;
  }
}

/** Fired when the backend says the admin's two-factor session is missing or expired. */
export const ADMIN_MFA_EVENT = 'circleon:admin-mfa-required';

export async function adminFetch<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new AdminError(data.error || 'Request failed', res.status, data.code || null);
    if (error.code === 'mfa_required' || error.code === 'mfa_expired') window.dispatchEvent(new CustomEvent(ADMIN_MFA_EVENT));
    throw error;
  }
  return data as T;
}

export type Paged = { total: number; page: number; page_size: number };

export type AdminMe = {
  user: { id: string; email: string };
  mfa: { enrolled: boolean; aal2: boolean; fresh: boolean; verified_at: string | null };
};

export type Metrics = {
  workspaces: number; signups_7d: number; signups_30d: number;
  paying: number; legacy?: number; trialing: number; suspended: number; payment_failed: number;
  mrr_cents: number; active_campaigns: number; emails_sent_30d: number;
  voice_minutes_30d: number; open_tickets: number;
};

export type AuditEntry = {
  id: string; action: string; target_type: string; target_id: string | null;
  before?: Record<string, unknown> | null; after?: Record<string, unknown> | null;
  ip?: string | null; created_at: string;
};

export type BillingSummary = {
  plan: string | null; subscription_status: string; payment_failed: boolean;
  suspended_at: string | null; trial_end: string | null;
};

export type Organization = {
  id: string; name: string; owner_id: string; owner_email: string | null;
  created_at: string; onboarding_completed: boolean; billing: BillingSummary | null;
};

export type OrganizationDetail = {
  workspace: { id: string; name: string; owner_email: string | null; created_at: string; onboarding_completed: boolean };
  billing: (BillingSummary & Record<string, unknown> & { suspended_reason: string | null }) | null;
  members: { user_id: string; email: string | null; role: string; status: string }[];
  campaigns: { id: string; name: string; status: string; created_at: string }[];
  counts: { leads: number; emails_sent: number };
  usage: { period_start: string; leads: number; emails: number; voice_seconds: number }[];
  tickets: Ticket[];
  history: AuditEntry[];
  telephony?: { from_number: string | null; phone_number_status: string; last_error: string | null } | null;
  call_credits?: { balance_cents: number };
};

export type Customer = {
  workspace_id: string; name: string; plan: string | null; subscription_status?: string;
  voice_ready?: boolean; voice_approved?: boolean; trial_approved?: boolean;
  fallback_number?: string | null; company_trial_key?: string | null; suspended_at?: string | null;
};

export type Ticket = {
  id: string; subject: string; status: 'open' | 'answered' | 'closed';
  last_message_at: string; created_at?: string; workspace_id?: string; workspaces?: { name: string } | null;
};

export type SupportMessage = { id: string; sender: 'user' | 'admin'; body: string; created_at: string };

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
}

export function formatMoney(cents: number) {
  // en-SG renders SGD as a bare "$", which reads as US dollars.
  return `S$${new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 }).format(cents / 100)}`;
}

export function humanize(key: string) {
  return key.replaceAll('_', ' ').replaceAll('.', ' · ');
}
