'use client';

import Link from 'next/link';

import { formatDate, formatMoney, humanize, type AuditEntry, type Metrics, type Ticket } from '@/lib/adminApi';
import { Header, LoadState, useAdmin } from './_components/ui';

type Overview = { metrics: Metrics; recent: AuditEntry[]; tickets: Ticket[] };

export default function AdminOverview() {
  const { data, error, loading } = useAdmin<Overview>('/overview');
  const m = data?.metrics;

  return (
    <>
      <Header title="Overview" />
      <LoadState loading={loading && !data} error={error} />
      {m ? (
        <>
          <section className="adm-stats">
            <Stat label="MRR" value={formatMoney(m.mrr_cents)} hint="Active, paid, not suspended" />
            <Stat label="Paying" value={m.paying} />
            <Stat label="Trialing" value={m.trialing} />
            <Stat label="Organizations" value={m.workspaces} hint={`${m.signups_7d} new this week · ${m.signups_30d} in 30 days`} />
            <Stat label="Active campaigns" value={m.active_campaigns} />
            <Stat label="Emails sent (30d)" value={m.emails_sent_30d.toLocaleString()} />
            <Stat label="Voice minutes (30d)" value={m.voice_minutes_30d.toLocaleString()} />
            <Stat label="Open tickets" value={m.open_tickets} href="/admin/support" />
          </section>
          {m.payment_failed || m.suspended ? (
            <p className="adm-callout">
              {m.payment_failed ? `${m.payment_failed} with a failed payment. ` : ''}
              {m.suspended ? `${m.suspended} suspended.` : ''}
            </p>
          ) : null}
          <div className="adm-grid2">
            <section className="adm-card">
              <h2>Waiting on a reply</h2>
              {data.tickets.length ? (
                <ul className="adm-list">
                  {data.tickets.map(t => (
                    <li key={t.id}>
                      <Link href={`/admin/support/${t.id}`}>{t.subject}</Link>
                      <span className="adm-muted adm-small">{t.workspaces?.name} · {formatDate(t.last_message_at, true)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="adm-muted">No open tickets.</p>}
            </section>
            <section className="adm-card">
              <h2>Recent admin activity</h2>
              {data.recent.length ? (
                <ul className="adm-list">
                  {data.recent.map(e => (
                    <li key={e.id}>
                      <span>{humanize(e.action)}</span>
                      <span className="adm-muted adm-small">{formatDate(e.created_at, true)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="adm-muted">Nothing yet.</p>}
              <Link className="adm-link adm-small" href="/admin/audit">Full audit log</Link>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
  const body = <><span className="adm-stat-label">{label}</span><span className="adm-stat-value">{value}</span>{hint ? <span className="adm-small adm-muted">{hint}</span> : null}</>;
  return href ? <Link href={href} className="adm-stat">{body}</Link> : <div className="adm-stat">{body}</div>;
}
