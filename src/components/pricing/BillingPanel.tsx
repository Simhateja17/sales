'use client';
import { useEffect, useState } from 'react';
import { billingAction, getBillingInvoices, getBillingStatus, openBillingPortal, type BillingInvoice, type BillingPaymentMethod, type BillingUsage, type WorkspaceBilling } from '@/lib/api';
import plans from '@/lib/pricing.json';
import { planLabel } from '@/lib/planLabel';
import './pricing.css';
import InboundVoiceSettings from './InboundVoiceSettings';

type Member = { id: string; email: string; status: string };

const USAGE_LABELS = { leads: 'Leads', emails: 'Emails', minutes: 'AI call minutes' } as const;

const fmtDay = (value?: string | null) => (value ? new Date(value).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
// en-SG prints SGD as a bare "$"; the design and the pricing page both say "S$".
const fmtMoney = (cents: number, currency: string) => {
  const amount = new Intl.NumberFormat('en-SG', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  return currency.toLowerCase() === 'sgd' ? amount.replace(/^\$/, 'S$') : amount;
};

export default function BillingPanel() {
  const [billing, setBilling] = useState<WorkspaceBilling | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [card, setCard] = useState<BillingPaymentMethod | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [leadCap, setLeadCap] = useState('0');
  const [voiceCap, setVoiceCap] = useState('0');
  const [accept, setAccept] = useState(false);
  const [overageOpen, setOverageOpen] = useState(false);
  const [next, setNext] = useState('');
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [keepMembers, setKeepMembers] = useState<string[]>([]);
  const [keepCampaigns, setKeepCampaigns] = useState<string[]>([]);
  const plan = plans.find(p => p.id === billing?.plan);
  const overageOn = Number(leadCap) > 0 || Number(voiceCap) > 0;
  const foundingActive = Boolean(billing?.founding && billing.founder_until && new Date(billing.founder_until) > new Date());
  const activeMembers = members.filter(m => m.status !== 'revoked');

  async function load() {
    const state = await getBillingStatus();
    setBilling(state.billing);
    setUsage(state.usage);
    setLeadCap(String((state.billing?.lead_overage_cap_cents || 0) / 100));
    setVoiceCap(String((state.billing?.voice_overage_cap_cents || 0) / 100));
    const team = await billingAction<{ members: Member[] }>('/team', 'GET');
    setMembers(team.members);
    const change = await billingAction<{ campaigns: { id: string; name: string }[] }>('/retention', 'GET');
    setCampaigns(change.campaigns);
    // Invoices and the card come from Stripe; a failure there should not hide the rest of the page.
    getBillingInvoices().then(data => { setInvoices(data.invoices); setCard(data.payment_method); }).catch(() => {});
  }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);

  async function act(fn: () => Promise<unknown>, message = 'Saved.') {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); await load(); setNotice(message); }
    catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  const toggle = (values: string[], id: string) => (values.includes(id) ? values.filter(x => x !== id) : [...values, id]);
  const openPortal = () => act(async () => { const { url } = await openBillingPortal(); window.location.assign(url); });
  const saveOverage = (leadCents: number, voiceCents: number, message: string) => act(
    () => billingAction('/overage', 'PATCH', { lead_overage_cap_cents: leadCents, voice_overage_cap_cents: voiceCents, accept_rates: accept }),
    message,
  );

  const status = billing?.payment_failed ? 'Payment failed' : billing?.subscription_status ? billing.subscription_status.replace(/_/g, ' ') : 'Inactive';
  const trialDays = billing?.trial_end && billing.subscription_status === 'trialing'
    ? Math.max(0, Math.ceil((new Date(billing.trial_end).getTime() - Date.now()) / 86400000))
    : null;
  const renewal = usage?.periodEnd || billing?.current_period_end || null;
  const lowUsage = usage ? (['leads', 'emails', 'minutes'] as const).find(key => usage.limits[key] > 0 && usage.used[key] >= usage.limits[key] * 0.8) : undefined;

  return (
    <div className="bill">
      <div>
        <div className="bill-eyebrow">Account</div>
        <h2 className="page-title">Plan and usage</h2>
        <p className="page-sub">All prices in SGD, excl. GST. Allowances reset on renewal.</p>
      </div>
      {error && <p className="bill-err" role="alert">{error}</p>}
      {notice && <p className="bill-note" role="status">{notice}</p>}

      <div className="bill-grid">
        <section className="bill-plan" aria-label="Current plan">
          <div className="bill-plan-top">
            <span className="bill-mono">Current plan</span>
            {billing?.payment_failed ? <span className="bill-flag bad">Payment failed, activity paused</span>
              : foundingActive ? <span className="bill-flag">Founding price locked to {fmtDay(billing?.founder_until)}</span> : null}
          </div>
          <h2>{billing?.plan ? planLabel(billing.plan) : 'No subscription'}</h2>
          {plan ? (
            <div className="bill-price">
              <b>S${foundingActive ? plan.founding : plan.list}</b> / month
              {foundingActive ? <s>S${plan.list}</s> : null} · excl. GST
            </div>
          ) : null}
          <div className="bill-meta">
            <div>Status<b style={{ textTransform: 'capitalize' }}>{status}</b></div>
            <div>{trialDays !== null ? 'Trial ends' : 'Next renewal'}<b>{trialDays !== null ? `${fmtDay(billing?.trial_end)} (${trialDays}d)` : fmtDay(renewal)}</b></div>
            <div>Seats<b>{plan ? `${Math.min(activeMembers.length + 1, plan.seats)} of ${plan.seats} used` : '—'}</b></div>
          </div>
          {billing?.cancel_at_period_end && <p className="bill-price" style={{ marginTop: 14 }}>Your cancellation takes effect at the end of the paid period.</p>}
          <div className="bill-row">
            <a className="bill-white" href="#change-tier" onClick={() => document.getElementById('change-tier')?.scrollIntoView({ behavior: 'smooth' })}>Change plan</a>
            <button className="bill-ghost" type="button" disabled={busy || !billing?.stripe_customer_id} onClick={openPortal}>Manage card and invoices</button>
          </div>
        </section>

        <section className="bill-panel" aria-label="This month's usage">
          <h3>This month&apos;s usage</h3>
          <p className="bill-sub">{renewal ? `Resets ${fmtDay(renewal)}` : 'Resets on renewal'}</p>
          <div className="bill-usage">
            {usage && (['leads', 'emails', 'minutes'] as const).filter(key => usage.limits[key] > 0 || usage.used[key] > 0).map(key => {
              const pct = usage.limits[key] ? Math.min(100, Math.round((usage.used[key] / usage.limits[key]) * 100)) : 100;
              return (
                <div key={key}>
                  <div className="bill-u-top"><b>{USAGE_LABELS[key]}</b><span>{usage.used[key].toLocaleString()} of {usage.limits[key].toLocaleString()}</span></div>
                  <div className="bill-track" role="progressbar" aria-label={USAGE_LABELS[key]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i className={pct >= 80 ? 'warn' : ''} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
            {!usage && <p className="bill-empty">No usage yet.</p>}
          </div>
          {usage && lowUsage && (
            <div className="bill-warn">
              {usage.used[lowUsage] >= usage.limits[lowUsage]
                ? `You have reached your ${USAGE_LABELS[lowUsage].toLowerCase()} allowance. Activity pauses unless paid overage is on.`
                : `You have used ${Math.round((usage.used[lowUsage] / usage.limits[lowUsage]) * 100)}% of your ${USAGE_LABELS[lowUsage].toLowerCase()}. Turn on overage or upgrade to keep going.`}
            </div>
          )}
        </section>
      </div>

      <div className="bill-grid">
        <section className="bill-panel" aria-label="Invoices">
          <div className="bill-toggle-row"><h3>Invoices</h3><button className="bill-link" type="button" disabled={busy || !billing?.stripe_customer_id} onClick={openPortal}>View all</button></div>
          <div className="bill-inv head"><span>Date</span><span>Description</span><span>Amount</span><span>Status</span><span /></div>
          {invoices.map(invoice => (
            <div className="bill-inv" key={invoice.id}>
              <span>{fmtDay(invoice.date)}</span>
              <span>{invoice.description}</span>
              <span>{fmtMoney(invoice.amount_cents, invoice.currency)}</span>
              <span><span className={`bill-ok${invoice.status === 'paid' ? '' : invoice.status === 'open' || invoice.status === 'uncollectible' ? ' bad' : ' off'}`} style={{ textTransform: 'capitalize' }}>{invoice.status === 'paid' ? 'Paid' : invoice.status || 'Pending'}</span></span>
              {invoice.pdf_url ? <a className="bill-link" href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">PDF</a> : <span />}
            </div>
          ))}
          {!invoices.length && <p className="bill-empty">No invoices yet. Your first invoice appears after your trial converts.</p>}
          <p className="bill-sub" style={{ marginTop: 10 }}>Amounts include GST where it applies.</p>
        </section>

        <div className="bill-stack">
          <section className="bill-panel" aria-label="Allow overage">
            <div className="bill-toggle-row">
              <div>
                <h3>Allow overage</h3>
                <p className="bill-sub">S$1.00 per extra lead (incl. its 4 emails), S$0.60 per extra AI minute. Off means activity pauses at your limit.</p>
              </div>
              <button
                type="button"
                className="bill-switch"
                role="switch"
                aria-checked={overageOn || overageOpen}
                aria-label="Allow overage"
                disabled={busy || billing?.subscription_status !== 'active' || !plan}
                onClick={() => {
                  if (overageOn) { setOverageOpen(false); saveOverage(0, 0, 'Overage turned off.'); }
                  else setOverageOpen(open => !open);
                }}
              />
            </div>
            {billing?.subscription_status !== 'active' && plan && <p className="bill-sub" style={{ marginTop: 10 }}>Overage is available once your plan is active.</p>}
            {plan && (overageOn || overageOpen) && (
              <form className="bill-form" onSubmit={e => { e.preventDefault(); saveOverage(Math.round(Number(leadCap) * 100), Math.round(Number(voiceCap) * 100), 'Overage settings saved.'); }}>
                <label>Extra leads spending cap (S$)<input type="number" min="0" step="1" value={leadCap} disabled={!plan.leads} onChange={e => setLeadCap(e.target.value)} /></label>
                <label>Extra voice spending cap (S$)<input type="number" min="0" step="0.60" value={voiceCap} disabled={!plan.minutes} onChange={e => setVoiceCap(e.target.value)} /></label>
                <label className="inline"><input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} />I accept S$1 per extra lead with four emails and S$0.60 per extra AI minute, excl. GST, up to my selected caps. An in-progress call may finish slightly above the voice cap.</label>
                <div><button className="bill-white" style={{ background: 'var(--brand)', color: '#fff' }} disabled={busy || (Number(leadCap) > 0 || Number(voiceCap) > 0) && !accept}>Save overage settings</button></div>
              </form>
            )}
          </section>

          <section className="bill-panel" aria-label="Payment method">
            <h3>Payment method</h3>
            {card ? (
              <div className="bill-card">
                <span className="bill-visa">{card.brand}</span>
                <div style={{ flex: 1, fontSize: 13.5 }}><b>{card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ending {card.last4}</b><br /><span style={{ color: 'var(--ink-mute)' }}>Expires {String(card.exp_month).padStart(2, '0')}/{String(card.exp_year).slice(-2)}</span></div>
                <button className="bill-link" type="button" disabled={busy} onClick={openPortal}>Update</button>
              </div>
            ) : <p className="bill-empty">{billing?.stripe_customer_id ? 'No card on file.' : 'A card is added when you choose a plan.'}</p>}
            {billing?.stripe_subscription_id && billing.subscription_status !== 'canceled' && (
              <div className="bill-toggle-row" style={{ marginTop: 16 }}>
                <span className="bill-sub" style={{ margin: 0 }}>Cancelling stops your next renewal.</span>
                <button
                  className="bill-line danger"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(billing.subscription_status === 'trialing' ? 'Cancel this trial immediately with no charge?' : 'Cancel renewal? Service continues through your paid month.')) act(() => billingAction('/cancel'), 'Cancellation saved.');
                  }}
                >
                  Cancel subscription
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {billing?.subscription_status === 'trialing' && plan?.family === 'allinone' && !billing.voice_ready && !billing.trial_extended && (
        <section className="bill-panel">
          <h3>Voice setup is pending</h3>
          <p className="bill-sub">Your trial will stop without a charge if voice is not ready. You can consent to one seven-day extension. The total allowance stays at 50 leads and 200 emails.</p>
          <div className="bill-row"><button className="bill-line" type="button" disabled={busy} onClick={() => act(() => billingAction('/extension-consent', 'POST', { consent: true }), 'Trial extended by seven days.')}>I agree to extend my trial by seven days</button></div>
        </section>
      )}

      {billing?.subscription_status === 'active' && plan && ['voice', 'allinone'].includes(plan.family) && <div className="cp cp-billing"><InboundVoiceSettings /></div>}

      {plan && (
        <div className="bill-grid">
          <section className="bill-panel" aria-label="Team seats">
            <h3>Team seats</h3>
            <p className="bill-sub">Owner + {activeMembers.length} teammates/invitations. Plan allows {plan.seats} seats.</p>
            {activeMembers.map(member => (
              <div className="bill-toggle-row" key={member.id} style={{ padding: '10px 0', borderTop: '1px solid var(--rule-soft)', marginTop: 8, fontSize: 13.5 }}>
                <span>{member.email} · {member.status}</span>
                <button className="bill-link" type="button" disabled={busy} onClick={() => act(() => billingAction('/team/' + member.id, 'DELETE'))}>Revoke</button>
              </div>
            ))}
            <form className="bill-form" onSubmit={e => { e.preventDefault(); act(() => billingAction('/team', 'POST', { email }), 'Invitation reserved. Ask your teammate to sign in and visit /team-invite.'); }}>
              <label>Teammate email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
              <div><button className="bill-line" disabled={busy}>Invite teammate</button></div>
            </form>
          </section>

          <section className="bill-panel" id="change-tier" aria-label="Change tier">
            <h3>Change tier</h3>
            <p className="bill-sub">Upgrades apply after successful prorated payment. Downgrades apply at renewal. Current usage carries forward; founding discount expiry stays the same.</p>
            {billing?.pending_plan && <p className="bill-note" style={{ marginTop: 10 }}>Scheduled at renewal: {planLabel(billing.pending_plan)}</p>}
            <div className="bill-form">
              <label>New tier
                <select value={next} onChange={e => setNext(e.target.value)}>
                  <option value="">Choose a tier</option>
                  {plans.filter(p => p.family === plan.family && p.id !== plan.id).map(p => <option key={p.id} value={p.id}>{p.name} · S${foundingActive ? p.founding : p.list}/month excl. GST</option>)}
                </select>
              </label>
              {next && plans.find(p => p.id === next)!.list < plan.list && (
                <>
                  <p className="bill-sub">Select which teammates and active campaigns to retain at renewal. Unselected invitations and members will be revoked; unselected active campaigns will pause.</p>
                  {activeMembers.map(m => <label className="inline" key={m.id}><input type="checkbox" checked={keepMembers.includes(m.id)} onChange={() => setKeepMembers(toggle(keepMembers, m.id))} />{m.email}</label>)}
                  {campaigns.map(c => <label className="inline" key={c.id}><input type="checkbox" checked={keepCampaigns.includes(c.id)} onChange={() => setKeepCampaigns(toggle(keepCampaigns, c.id))} />{c.name}</label>)}
                </>
              )}
              <div><button className="bill-line" type="button" disabled={busy || !next} onClick={() => act(() => billingAction('/change-plan', 'POST', { plan: next, keep_member_ids: keepMembers, keep_campaign_ids: keepCampaigns }), 'Plan change saved.')}>Confirm tier change</button></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
