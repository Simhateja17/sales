'use client';

import { useState } from 'react';

import { type Customer, type Paged } from '@/lib/adminApi';
import { Badge, Header, LoadState, Pager, Status, subscriptionTone, useAction, useAdmin } from '../_components/ui';

const FLAGS = ['trial_approved', 'voice_approved', 'voice_ready'] as const;

export default function BillingApprovals() {
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useAdmin<Paged & { customers: Customer[] }>(`/billing?page=${page}`);

  return (
    <>
      <Header title="Billing approvals" />
      <p className="adm-muted">Trial approvals, voice readiness and inbound fallback numbers per customer. Marking voice ready on an all-in-one trial changes the Stripe subscription, so it asks you to confirm.</p>
      <LoadState loading={loading && !data} error={error} />
      {data?.customers.map(c => <CustomerCard key={c.workspace_id} customer={c} onSaved={reload} />)}
      {data ? <Pager page={data.page} total={data.total} size={data.page_size} onPage={setPage} /> : null}
    </>
  );
}

function CustomerCard({ customer: c, onSaved }: { customer: Customer; onSaved: () => unknown }) {
  const action = useAction(onSaved);
  const touchesStripe = c.subscription_status === 'trialing' && Boolean(c.plan?.startsWith('allinone'));

  function toggle(key: typeof FLAGS[number], value: boolean) {
    let confirm: string | null = null;
    if (key === 'voice_ready' && touchesStripe) {
      // window.prompt is the lightest typed confirmation that works inline in a list.
      confirm = window.prompt(`This changes ${c.name}'s Stripe subscription. Type the organization name to confirm.`);
      if (confirm === null) return;
    }
    action.run(`/billing/${c.workspace_id}`, 'PATCH', { [key]: value, ...(confirm !== null ? { confirm } : {}) });
  }

  return (
    <section className="adm-card">
      <div className="adm-row adm-between">
        <h2>{c.name}</h2>
        <Badge tone={subscriptionTone(c.subscription_status, c.suspended_at)}>{c.suspended_at ? 'suspended' : c.subscription_status || 'no plan'}</Badge>
      </div>
      <p className="adm-small adm-muted">{c.plan || 'No plan'} · <code>{c.workspace_id}</code></p>
      <div className="adm-row">
        {FLAGS.map(key => (
          <label key={key} className="adm-check">
            <input type="checkbox" checked={Boolean(c[key])} disabled={action.busy} onChange={e => toggle(key, e.target.checked)} />
            {key.replaceAll('_', ' ')}
          </label>
        ))}
      </div>
      <div className="adm-grid2">
        <form className="adm-form" onSubmit={e => { e.preventDefault(); action.run(`/billing/${c.workspace_id}`, 'PATCH', { company_trial_key: new FormData(e.currentTarget).get('domain') }); }}>
          <label>Company domain for an approved personal-email trial<input name="domain" defaultValue={c.company_trial_key || ''} placeholder="company.com" /></label>
          <button className="adm-btn" disabled={action.busy}>Save domain</button>
        </form>
        <form className="adm-form" onSubmit={e => { e.preventDefault(); action.run(`/billing/${c.workspace_id}`, 'PATCH', { fallback_number: new FormData(e.currentTarget).get('fallback') }); }}>
          <label>Inbound fallback number<input name="fallback" defaultValue={c.fallback_number || ''} placeholder="+65…" /></label>
          <button className="adm-btn" disabled={action.busy}>Save number</button>
        </form>
      </div>
      <Status message={action.message} />
    </section>
  );
}
