'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { planLabel } from '@/lib/planLabel';
import { Badge, Header } from '../_components/ui';

type Balance = { type: string; limit: number; consumed: number; left_over: number; percent_used: number | null; alert: boolean };
type Snapshot = { id: string; source: string; balances: Balance[]; cycle: Record<string, unknown> | null; verified_at: string; source_note: string };
type Client = { workspace_id: string; workspace_name: string; plan: string | null; period_start: string | null; billing_period_leads: number; calendar_month_admitted_leads: number; calendar_month_enrichment_outcomes: number };
type Data = { snapshots: Snapshot[]; clients: Client[]; as_of: string; scope: string };

export default function ProviderCredits() {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() { setData(await adminFetch<Data>('/provider-credits')); }
  useEffect(() => { load().catch(e => setMessage({ ok: false, text: e.message })); }, []);

  async function save(path: string, body?: unknown) {
    setBusy(true); setMessage(null);
    try { await adminFetch('/provider-credits/' + path, 'POST', body); await load(); setMessage({ ok: true, text: 'Balance saved.' }); }
    catch (e) { setMessage({ ok: false, text: e instanceof Error ? e.message : 'Request failed.' }); }
    finally { setBusy(false); }
  }

  const latest = data?.snapshots[0];
  const stale = latest && Date.now() - new Date(latest.verified_at).getTime() > 24 * 3600000;

  return (
    <>
      <Header title="Provider credits">
        <button className="adm-btn adm-primary" disabled={busy || !data} onClick={() => save('refresh')}>Refresh from Apollo</button>
      </Header>
      {message ? <p className={message.ok ? 'adm-muted' : 'adm-error'} role="status">{message.text}</p> : null}
      {!data ? <p className="adm-muted">Loading…</p> : (
        <>
          <p className="adm-muted">{data.scope} Apollo reports its own billing cycle, which may differ from the calendar month or a customer&rsquo;s renewal date.</p>

          <section className="adm-card">
            <h2>Latest verified team balance</h2>
            {!latest ? <p className="adm-muted">No verified balance yet. Refresh from Apollo, or record one verified in Apollo&rsquo;s admin console below.</p> : (
              <>
                <p className="adm-small adm-muted">{latest.source === 'api' ? 'Apollo API' : 'Manually verified'} · {new Date(latest.verified_at).toLocaleString()} · {latest.source_note}</p>
                {stale ? <p className="adm-callout adm-callout-bad">This balance is more than 24 hours old. Refresh before relying on it.</p> : null}
                {latest.balances.map(b => (
                  <div key={b.type} className="adm-credit-row">
                    <div className="adm-row adm-between"><strong>{b.type.replaceAll('_', ' ')}</strong>{b.alert ? <Badge tone="warn">{b.percent_used?.toFixed(1)}% used</Badge> : null}</div>
                    <p className="adm-small adm-muted">{b.consumed.toLocaleString()} used of {b.limit.toLocaleString()} · {b.left_over.toLocaleString()} remaining</p>
                    {b.percent_used !== null ? <progress max={100} value={Math.min(100, b.percent_used)} aria-label={`${b.type} used`} /> : <p className="adm-small adm-muted">No allowance reported.</p>}
                  </div>
                ))}
              </>
            )}
          </section>

          <section className="adm-card">
            <h2>Per-client lead usage</h2>
            <p className="adm-small adm-muted">CircleOn lead counts, not Apollo credit charges. Enrichment can use provider credits without admitting a usable lead. Calendar counts use UTC.</p>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Client</th><th>Plan</th><th>Period starts</th><th>Period leads</th><th>Month ready leads</th><th>Month outcomes</th></tr></thead>
                <tbody>{data.clients.map(c => (
                  <tr key={c.workspace_id}><td>{c.workspace_name}</td><td>{planLabel(c.plan)}</td><td>{c.period_start ? new Date(c.period_start).toLocaleDateString() : '—'}</td><td>{c.billing_period_leads}</td><td>{c.calendar_month_admitted_leads}</td><td>{c.calendar_month_enrichment_outcomes}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </section>

          <section className="adm-card">
            <h2>Record a manually verified balance</h2>
            <p className="adm-small adm-muted">Use this if the API key cannot read credit stats. Record one credit type exactly as Apollo reports it.</p>
            <form className="adm-form adm-inline-form" onSubmit={e => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              save('manual', { type: f.get('type'), limit: Number(f.get('limit')), consumed: Number(f.get('consumed')), left_over: Number(f.get('left_over')), verified_at: new Date(String(f.get('verified_at'))).toISOString(), source_note: f.get('source_note') });
            }}>
              <label>Credit type<input name="type" defaultValue="lead_credit" required pattern="[a-z][a-z0-9_]*" /></label>
              <label>Limit<input name="limit" type="number" min="0" step="any" required /></label>
              <label>Consumed<input name="consumed" type="number" min="0" step="any" required /></label>
              <label>Left over<input name="left_over" type="number" min="0" step="any" required /></label>
              <label>Verified at<input name="verified_at" type="datetime-local" required /></label>
              <label>Source<input name="source_note" minLength={5} maxLength={500} placeholder="Apollo admin credit usage screen" required /></label>
              <button className="adm-btn" disabled={busy}>Save balance</button>
            </form>
          </section>

          {data.snapshots.length > 1 ? (
            <section className="adm-card">
              <h2>Balance history</h2>
              <ul className="adm-list">{data.snapshots.map(s => <li key={s.id}><span>{new Date(s.verified_at).toLocaleString()} · {s.source}</span><span className="adm-small adm-muted">{s.balances.map(b => `${b.type}: ${b.consumed} used, ${b.left_over} left`).join('; ')}</span></li>)}</ul>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
