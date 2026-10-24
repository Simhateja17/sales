'use client';
import { useEffect, useState, type ReactNode } from 'react';
import plans from '@/lib/pricing.json';
import './pricing.css';
export type Plan = typeof plans[number];
type Family = 'followup' | 'voice' | 'allinone';
export type Catalog = { plans: Plan[]; offer: { active: boolean; spotsLeft: number }; demoUrl: string | null; gstRegistered: boolean; legalReady: boolean; trust: { pdpa: boolean; dnc: boolean } };
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/billing/catalog`, { signal: controller.signal, cache: 'no-store' }).then(async r => { if (!r.ok) throw new Error('Pricing availability is temporarily unavailable.'); return r.json(); }).then(setCatalog).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, []);
  return { catalog, error };
}
export function FoundingBanner() {
  const { catalog } = useCatalog();
  return catalog?.offer.active ? <div className="cp-banner">Founding Client offer · Prices locked for six paid months + setup fee waived. <strong>{catalog.offer.spotsLeft} of 20 founding spots left</strong></div> : null;
}
export const faqs = [
  ['How does the seven-day trial work?', 'A card is required. Your trial starts at checkout and includes 50 leads and 200 emails, with no voice minutes. Connect your own verified sending mailbox. Cancel before conversion to pay nothing. One trial per company; personal email addresses require approval.'],
  ['What happens after the trial?', 'Your selected monthly plan starts automatically unless cancelled. All-in-one requires voice readiness before conversion. If setup is delayed, you may consent to one extension of up to seven days, without extra trial usage. If voice is still unfinished, the trial stops without a charge.'],
  ['What is the Founding Client offer?', 'The first 20 clients receive founding pricing for six paid months, then move to the list price. Setup fees are waived. A spot is reserved during checkout and trial, then confirmed on successful payment. Changing tiers does not restart the discount.'],
  ['Can I cancel?', 'Yes. Trial cancellation stops service immediately with no charge. Paid cancellation stops renewal; service continues until the end of the paid month. There is no automatic partial-month refund.'],
  ['What happens at my usage limit?', 'New lead finding or email sending pauses at its allowance. Paid customers can separately opt into extra leads at S$1 each, including four emails, and extra voice minutes at S$0.60 each, excl. GST. Each opt-in requires a monthly spending cap. Trials have no overage. Unused allowances do not roll over.'],
  ['How are voice minutes counted?', 'We add actual answered call durations together and round up once per billing month. Unanswered calls use no AI minutes. Calls in progress can finish; new outbound calls stop at the limit and inbound calls use your configured fallback. A finishing call may slightly exceed your overage cap.'],
  ['Are phone numbers or sending inboxes included?', 'No. Connect your own verified sending mailbox. You purchase your own phone number and pay carrier charges separately. Managed domains, inbox provisioning, and warm-up are not included.'],
  ['What is the setup fee?', 'One-time setup costs S$200 for Follow Up, S$500 for Voice Agent, or S$650 for All-in-one, excl. GST. It covers targeting, email sequences, calendar connection, and relevant voice configuration. Non-founders pay on trial conversion; Voice Agent customers pay when their approved paid subscription begins.'],
  ['Do prices include GST?', 'All prices are SGD and exclude GST. GST is collected only when CircleOn is GST-registered and tax collection is enabled.'],
  ['How do seats, campaigns, and support work?', 'The owner counts as a seat, and pending invitations reserve seats. Active campaign limits include email and voice together for All-in-one; drafts and paused campaigns do not count. Support operates Monday–Friday, 9am–6pm Singapore time, excluding Singapore public holidays.'],
  ['Does CircleOn connect to my CRM?', 'No CRM integration or export is included. Use your calendar booking link for meetings. WhatsApp and SMS are coming soon and cannot be purchased.'],
];
const FAQ_SCHEMA = { __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q,a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }) };
const FAMILY_LABELS: Record<Family, { label: string; blurb: string }> = {
  followup: { label: 'Follow Up', blurb: 'AI finds verified leads and sends personalised email sequences.' },
  voice: { label: 'Voice Agent', blurb: 'An AI agent calls your leads and books meetings.' },
  allinone: { label: 'All-in-one', blurb: 'Email outreach and AI calling together, at a lower price.' },
};
// The founding banner hides the count until someone has claimed a spot.
const FOUNDING_SPOTS = 20;
export type PlanNotice = { planId: string; message: string; action?: ReactNode };
export default function PricingPlans({ onSelect, busy = false, selectingId = null, notice = null, approvedVoice = false, comparison = true }: { onSelect?: (plan: Plan) => void; busy?: boolean; selectingId?: string | null; notice?: PlanNotice | null; approvedVoice?: boolean; comparison?: boolean }) {
  const { catalog, error } = useCatalog();
  const [family, setFamily] = useState<Family>('allinone');
  useEffect(() => { const value = new URLSearchParams(window.location.search).get('plan'); if (['followup','voice','allinone'].includes(value || '')) setFamily(value as Family); }, []);
  const available = catalog?.plans || plans;
  const visible = available.filter(p => p.family === family);
  const founding = Boolean(catalog?.offer.active);
  const switchFamily = (value: Family) => { setFamily(value); const url = new URL(window.location.href); url.searchParams.set('plan',value); window.history.replaceState(null,'',url); };
  const rows: [string, (p: Plan) => string | number][] = [
    ['Monthly price, excl. GST', p => `S$${founding ? p.founding : p.list}`],
    ...(family !== 'voice' ? [ ['New verified leads / month', (p: Plan) => p.leads], ['Emails / month', (p: Plan) => p.emails], ['Active campaigns', (p: Plan) => p.campaigns || '—'], ['AI email personalisation', () => 'Included'], ['Reply detection and automatic stop', () => 'Included'] ] as [string,(p:Plan)=>string|number][] : []),
    ...(family !== 'followup' ? [ ['AI minutes / month', (p: Plan) => p.minutes], ['Concurrent calls', (p: Plan) => p.concurrency], ['Recordings, transcripts and summaries', () => 'Included'], ['Knowledge base and appointment booking', () => 'Included'] ] as [string,(p:Plan)=>string|number][] : []),
    ['User seats, including owner', p => p.seats], ['Calendar booking link', () => 'Included'],
    ['Reporting', p => p.tier === 'starter' ? 'Dashboard' : p.tier === 'growth' ? 'Dashboard + weekly report' : 'Dashboard + weekly report + monthly review call'],
    ['Support response', p => p.tier === 'starter' ? '2 business days' : p.tier === 'growth' ? '1 business day + chat' : 'Same business day'],
  ];
  return <div className="cp">
    {catalog?.offer.active && <div className="cp-banner"><span><b>Founding Client offer:</b> lock in launch prices for 6 months + setup fee waived.</span>{catalog.offer.spotsLeft < FOUNDING_SPOTS && <strong>{catalog.offer.spotsLeft} of {FOUNDING_SPOTS} founding spots left</strong>}</div>}
    {onSelect && catalog && !catalog.legalReady && <p role="status" className="cp-closed">Checkout opens soon. <a href={catalog.demoUrl || '/demo'}>Book a demo</a> and we will let you know as soon as it does.</p>}
    {error && <p role="status" className="cp-note">{error} Prices below are list prices; checkout availability will be checked again.</p>}
    <div className="cp-tabs" aria-label="Plan family">{(['followup','voice','allinone'] as Family[]).map(f => <button key={f} type="button" aria-pressed={family===f} onClick={() => switchFamily(f)}>{FAMILY_LABELS[f].label}</button>)}</div>
    <p className="cp-blurb">{onSelect ? FAMILY_LABELS[family].blurb : family === 'voice' ? 'No voice trial. Book a demo call and we set you up. Prices excl. GST.' : 'Card required. Cancel anytime before day 7. Prices excl. GST.'}</p>
    <div className="cp-grid">{visible.map(p => <article className={`cp-card ${p.tier==='growth' ? 'cp-featured' : ''}`} key={p.id}>
      <div className="cp-tier">{p.tier} {p.tier==='growth' && <span>Most popular</span>}</div>
      <h2>{p.name}</h2>
      <div className="cp-price"><div><strong>S${founding ? p.founding : p.list}</strong>{founding && <del aria-label="List price">S${p.list}</del>}</div><small>/month, excl. GST</small></div>
      {founding && <p className="cp-note">For six paid months, then S${p.list}/month excl. GST.</p>}
      {family==='voice' && !approvedVoice ? <a className="cp-cta" href={catalog?.demoUrl || '/demo'}>Book a demo call</a> : onSelect ? <button className="cp-cta" disabled={busy || !catalog?.legalReady} onClick={() => onSelect(p)}>{busy && selectingId===p.id?'Opening checkout…':family==='voice'?'Continue to paid checkout':'Start free trial'}</button> : <a className="cp-cta" href={`/signup?plan=${family}&tier=${p.tier}`}>Start free trial</a>}
      <ul>{p.leads>0 && <><li>{p.leads.toLocaleString()} new verified leads / month</li><li>{p.emails.toLocaleString()} emails, up to four per lead</li></>}{p.minutes>0 && <><li>{p.minutes} AI call minutes / month</li><li>{p.concurrency} concurrent {p.concurrency===1?'call':'calls'}</li></>}<li>{p.seats} user {p.seats===1?'seat':'seats'}, including owner</li>{p.campaigns && <li>{p.campaigns} active {p.campaigns===1?'campaign':'campaigns'}</li>}<li>{p.tier==='starter'?'Dashboard reporting':p.tier==='growth'?'Weekly report':'Weekly report + monthly review call'}</li></ul>
      {family==='allinone' && <p>Save S${(available.find(x=>x.id===`followup_${p.tier}`)?.[founding?'founding':'list'] || 0)+(available.find(x=>x.id===`voice_${p.tier}`)?.[founding?'founding':'list'] || 0)-p[founding?'founding':'list']}/month excl. GST versus separate plans.</p>}
      {notice?.planId===p.id && <div className="cp-card-notice" role="alert"><p>{notice.message}</p>{notice.action}</div>}
    </article>)}</div>
    <p className="cp-note">One-time setup: <strong>{founding?'waived for founding clients':`S$${visible[0]?.setup} excl. GST`}</strong>{founding && ` (normally S$${visible[0]?.setup} excl. GST)`}. {family==='voice'?'No voice trial. Paid checkout follows demo approval and setup.':`Card required. Trial starts at checkout.${onSelect ? '' : ' Connect your own verified mailbox.'} Cancel before conversion to pay nothing.`}</p>
    {/* Setup details belong on the public page and in onboarding, not at the moment of choosing a plan. */}
    {family!=='followup' && !onSelect && <p className="cp-note">Phone numbers are not included. Buy your own number and pay carrier charges separately. Singapore +65 numbers may require business registration. All-in-one’s trial includes email outreach only.</p>}
    {comparison && <><h2 id="compare">Compare every plan</h2><div className="cp-table-wrap" tabIndex={0} aria-label="Plan comparison"><table><thead><tr><th scope="col">Inclusion</th>{visible.map(p=><th key={p.id} scope="col">{p.tier}</th>)}</tr></thead><tbody>{rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th>{visible.map(p=>{const v=value(p);return <td key={p.id}>{typeof v==='number'?v.toLocaleString():v}</td>;})}</tr>)}</tbody></table></div><p className="cp-note">Extra leads: S$1 each, including four emails. Extra AI minutes: S$0.60 each. Excl. GST. Paid overage requires opt-in and a monthly spending cap.</p>
    <p className="cp-chips"><span>WhatsApp · Coming soon</span><span>SMS · Coming soon</span></p><p className="cp-trust">CIRCLEON PTE. LTD. · Singapore-registered · Secure Stripe payments{catalog?.trust.pdpa?' · PDPA-compliant outreach':''}{catalog?.trust.dnc?' · DNC checks':''}</p>
    <h2>Frequently asked questions</h2>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}<script type="application/ld+json" dangerouslySetInnerHTML={FAQ_SCHEMA}/></>}
    {comparison && !onSelect && <div className="cp-closing"><h2>One new client pays for CircleOn for a year</h2><p>Start your 7-day free trial. Card required, cancel anytime before day 7.</p><a href="/signup?plan=allinone&tier=growth">Start free trial</a></div>}
    <p className="cp-note"><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a></p>
  </div>;
}
