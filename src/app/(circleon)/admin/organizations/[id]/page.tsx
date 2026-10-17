'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { formatDate, humanize, type OrganizationDetail } from '@/lib/adminApi';
import { Badge, ConfirmByName, Header, LoadState, Status, subscriptionTone, useAction, useAdmin } from '../../_components/ui';

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useAdmin<OrganizationDetail>(`/organizations/${id}`);
  const action = useAction(reload);

  if (!data) return <><Link className="adm-link adm-small" href="/admin/organizations">← Organizations</Link><LoadState loading={loading} error={error} /></>;
  const { workspace, billing } = data;
  const suspended = Boolean(billing?.suspended_at);

  return (
    <>
      <Link className="adm-link adm-small" href="/admin/organizations">← Organizations</Link>
      <Header title={workspace.name}>
        <Badge tone={subscriptionTone(billing?.subscription_status, billing?.suspended_at)}>{suspended ? 'suspended' : billing?.subscription_status || 'no plan'}</Badge>
      </Header>
      {suspended ? <p className="adm-callout adm-callout-bad">Suspended {formatDate(billing?.suspended_at, true)}: {billing?.suspended_reason}</p> : null}

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Account</h2>
          <dl className="adm-dl">
            <dt>Owner</dt><dd>{workspace.owner_email || '—'}</dd>
            <dt>Created</dt><dd>{formatDate(workspace.created_at)}</dd>
            <dt>Onboarded</dt><dd>{workspace.onboarding_completed ? 'Yes' : 'No'}</dd>
            <dt>Plan</dt><dd>{billing?.plan || '—'}</dd>
            <dt>Trial ends</dt><dd>{formatDate(billing?.trial_end)}</dd>
            <dt>Leads</dt><dd>{data.counts.leads.toLocaleString()}</dd>
            <dt>Emails sent</dt><dd>{data.counts.emails_sent.toLocaleString()}</dd>
            <dt>ID</dt><dd><code>{workspace.id}</code></dd>
          </dl>
        </section>
        <section className="adm-card">
          <h2>Team</h2>
          {data.members.length ? (
            <ul className="adm-list">{data.members.map(m => <li key={m.user_id}><span>{m.email || m.user_id}</span><span className="adm-muted adm-small">{m.role} · {m.status}</span></li>)}</ul>
          ) : <p className="adm-muted">Owner only.</p>}
          <h2>Usage by billing period</h2>
          {data.usage.length ? (
            <ul className="adm-list">{data.usage.map(u => <li key={u.period_start}><span>{formatDate(u.period_start)}</span><span className="adm-muted adm-small">{u.leads} leads · {u.emails} emails · {Math.round(u.voice_seconds / 60)} min</span></li>)}</ul>
          ) : <p className="adm-muted">No metered usage yet.</p>}
        </section>
      </div>

      <section className="adm-card">
        <h2>Campaigns</h2>
        {data.campaigns.length ? (
          <ul className="adm-list">{data.campaigns.map(c => <li key={c.id}><span>{c.name}</span><span className="adm-muted adm-small">{c.status} · {formatDate(c.created_at)}</span></li>)}</ul>
        ) : <p className="adm-muted">No campaigns.</p>}
      </section>

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Support tickets</h2>
          {data.tickets.length ? (
            <ul className="adm-list">{data.tickets.map(t => <li key={t.id}><Link href={`/admin/support/${t.id}`}>{t.subject}</Link><span className="adm-muted adm-small">{t.status} · {formatDate(t.last_message_at)}</span></li>)}</ul>
          ) : <p className="adm-muted">None.</p>}
        </section>
        <section className="adm-card">
          <h2>Admin history</h2>
          {data.history.length ? (
            <ul className="adm-list">{data.history.map(h => <li key={h.id}><span>{humanize(h.action)}</span><span className="adm-muted adm-small">{formatDate(h.created_at, true)}</span></li>)}</ul>
          ) : <p className="adm-muted">No admin changes.</p>}
        </section>
      </div>

      <section className={`adm-card ${suspended ? '' : 'adm-card-danger'}`}>
        <h2>{suspended ? 'Restore access' : 'Suspend organization'}</h2>
        <p className="adm-muted">
          {suspended
            ? 'Restores app access, sending and calling. Stripe billing was never changed by the suspension.'
            : 'Blocks app features, stops email sending and calling, and pauses autopilot. Stripe billing is not changed; cancel or refund there separately if needed.'}
        </p>
        <ConfirmByName
          name={workspace.name}
          label={suspended ? 'Restore access' : 'Suspend'}
          danger={!suspended}
          busy={action.busy}
          extra={suspended ? null : <label>Reason (kept in the audit log)<input name="reason" minLength={5} required /></label>}
          onConfirm={(confirm, form) => action.run(
            `/organizations/${workspace.id}/${suspended ? 'unsuspend' : 'suspend'}`, 'POST',
            { confirm, reason: form.get('reason') },
            suspended ? 'Access restored.' : 'Organization suspended.',
          )}
        />
        <Status message={action.message} />
      </section>
    </>
  );
}
