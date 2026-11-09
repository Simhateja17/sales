'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteInvoice, getInvoiceFileUrl, getInvoiceSettings, invoiceAction, listInvoices, saveInvoiceSettings, updateInvoice,
  type BookingRule, type Invoice, type InvoiceSettings, type InvoiceStatus, type InvoiceTotals,
} from '@/lib/api';
import { confirmDialog } from '@/components/circleon/dialog';
import Select from '@/components/circleon/Select';
import NewInvoiceModal from './NewInvoiceModal';
import BookingReminders, { formatBookingTime } from './BookingReminders';
import { EmptyState } from '../_lib/ui';
import './invoices.css';

const STATUS_LABEL: Record<InvoiceStatus, string> = { draft: 'Draft', sent: 'Unpaid', overdue: 'Overdue', paid: 'Paid', void: 'Void' };
const STATUS_BADGE: Record<InvoiceStatus, string> = { draft: 'b-noanswer', sent: 'b-interested', overdue: 'b-overdue', paid: 'b-booked', void: 'b-noanswer' };
const FILTERS: Array<'all' | InvoiceStatus> = ['all', 'draft', 'sent', 'overdue', 'paid'];

function money(cents: number, currency = 'SGD') {
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format((cents || 0) / 100);
}
function fmtDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}
function describeEvent(kind: string, step: string) {
  const days = Number(step.slice(1));
  if (kind === 'invoice') return step ? 'Invoice resent' : 'Invoice sent';
  if (kind === 'reminder') return days < 0 ? `Reminder, ${-days}d before due` : days === 0 ? 'Reminder on due date' : `Overdue reminder, ${days}d late`;
  if (kind === 'checkin') return days === 0 ? 'Thank-you sent' : `Check-in, day ${days}`;
  if (kind === 'booking') return 'Booking reminder sent';
  return kind === 'paid' ? 'Marked paid' : 'Voided';
}
const parseOffsets = (text: string) => text.split(',').map(v => v.trim()).filter(Boolean).map(Number);

type RuleRow = { kind: 'days' | 'hours'; amount: string; time: string };
const toRows = (rules: BookingRule[]): RuleRow[] => rules.map(r => 'hours_before' in r
  ? { kind: 'hours', amount: String(r.hours_before), time: '09:00' }
  : { kind: 'days', amount: String(r.days_before), time: r.time });
const fromRows = (rows: RuleRow[]): BookingRule[] => rows.filter(r => r.amount !== '').map(r => r.kind === 'hours'
  ? { hours_before: Number(r.amount) }
  : { days_before: Number(r.amount), time: r.time || '09:00' });
const RULE_KINDS = [{ value: 'days', label: 'days before, at' }, { value: 'hours', label: 'hours before' }];

export default function InvoicesView({ mailboxConnected, onConnectMailbox }: { mailboxConnected: boolean; onConnectMailbox: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState<InvoiceTotals>({ outstanding_cents: 0, overdue_cents: 0, paid_cents: 0 });
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleText, setScheduleText] = useState({ reminders: '', checkins: '' });
  const [ruleRows, setRuleRows] = useState<RuleRow[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await listInvoices();
      setInvoices(data.invoices);
      setTotals(data.totals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    getInvoiceSettings().then(({ settings: s }) => {
      setSettings(s);
      setScheduleText({ reminders: s.reminder_offsets.join(', '), checkins: s.checkin_offsets.join(', ') });
      setRuleRows(toRows(s.booking_rules || []));
    }).catch(() => {});
  }, [refresh]);

  const visible = useMemo(() => filter === 'all' ? invoices : invoices.filter(i => i.display_status === filter), [filter, invoices]);
  const selected = invoices.find(i => i.id === selectedId) || null;
  const patchInvoice = (id: string, patch: Partial<Invoice>) => setInvoices(list => list.map(i => i.id === id ? { ...i, ...patch, events: patch.events ?? i.events, booking_reminders: patch.booking_reminders ?? i.booking_reminders } : i));

  async function run(id: string, action: () => Promise<unknown>, success: string) {
    setBusyId(id); setError(''); setNotice('');
    try { await action(); setNotice(success); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setBusyId(null); }
  }

  async function openFile(id: string) {
    try { window.open((await getInvoiceFileUrl(id)).url, '_blank', 'noopener,noreferrer'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not open the invoice file.'); }
  }

  async function saveSchedule(patch: Partial<InvoiceSettings>) {
    setError(''); setNotice('');
    try {
      const { settings: s } = await saveInvoiceSettings(patch);
      setSettings(s);
      setScheduleText({ reminders: s.reminder_offsets.join(', '), checkins: s.checkin_offsets.join(', ') });
      setRuleRows(toRows(s.booking_rules || []));
      setNotice('Schedule saved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the schedule.'); }
  }

  return (
    <section className="inv">
      <div className="page-header">
        <div>
          <div className="page-kicker">After sales</div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-sub">Upload an invoice and CircleOn sends it from your mailbox, chases payment, thanks your client when you mark it paid, and reminds them before their booking.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>Upload invoice</button>
        </div>
      </div>

      {!mailboxConnected ? (
        <div className="inv-banner" role="status">
          Invoices and reminders are sent from your own mailbox. <button type="button" className="bill-link" onClick={onConnectMailbox}>Connect a mailbox</button> before sending.
        </div>
      ) : null}
      {error ? <p className="inv-msg is-error" role="alert">{error}</p> : null}
      {notice ? <p className="inv-msg" role="status">{notice}</p> : null}

      <div className="mtg-kpis">
        <div><b>{money(totals.outstanding_cents)}</b><span>Outstanding</span></div>
        <div><b>{money(totals.overdue_cents)}</b><span>Overdue</span></div>
        <div><b>{money(totals.paid_cents)}</b><span>Collected</span></div>
        <div><b>{invoices.filter(i => i.display_status === 'overdue').length}</b><span>Overdue invoices</span></div>
      </div>

      <div className="inv-layout">
        <div className="inv-list card">
          <div className="inv-filters" role="tablist" aria-label="Filter invoices">
            {FILTERS.map(f => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} className={`rs-pill${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : STATUS_LABEL[f]} <span>{f === 'all' ? invoices.length : invoices.filter(i => i.display_status === f).length}</span>
              </button>
            ))}
          </div>
          {loading ? <EmptyState text="Loading invoices…" /> : null}
          {!loading && !visible.length ? <EmptyState text={invoices.length ? 'No invoices with this status.' : 'No invoices yet. Upload one when a deal closes, and CircleOn will chase payment for you.'} /> : null}
          {visible.length ? (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead><tr><th scope="col">Invoice</th><th scope="col">Client</th><th scope="col">Amount</th><th scope="col">Due</th><th scope="col">Status</th><th scope="col" aria-label="Actions"></th></tr></thead>
                <tbody>
                  {visible.map(invoice => (
                    <tr key={invoice.id} className={selectedId === invoice.id ? 'is-selected' : ''}>
                      <td><button type="button" className="inv-number" onClick={() => setSelectedId(invoice.id)}>{invoice.number}</button></td>
                      <td><b>{invoice.client_name}</b><small>{invoice.booking_at ? `${invoice.booking_title || 'Booking'} · ${formatBookingTime(invoice.booking_at)}` : invoice.client_email}</small></td>
                      <td className="inv-num">{money(invoice.amount_cents, invoice.currency)}</td>
                      <td>{fmtDay(invoice.due_date)}</td>
                      <td><span className={`badge ${STATUS_BADGE[invoice.display_status]}`}>{STATUS_LABEL[invoice.display_status]}</span>{invoice.last_error ? <small className="inv-err" title={invoice.last_error}>Last send failed</small> : null}</td>
                      <td className="inv-actions">
                        {invoice.status === 'draft' ? <>
                          <button type="button" className="btn-outline" disabled={busyId === invoice.id || !mailboxConnected} onClick={() => run(invoice.id, () => invoiceAction(invoice.id, 'send'), `Invoice ${invoice.number} sent.`)}>Send</button>
                          <button type="button" className="bill-link" disabled={busyId === invoice.id} onClick={async () => { if (await confirmDialog({ title: `Delete draft ${invoice.number}?`, message: 'This cannot be undone.', confirmLabel: 'Delete', danger: true })) run(invoice.id, () => deleteInvoice(invoice.id), 'Draft deleted.'); }}>Delete</button>
                        </> : null}
                        {invoice.status === 'sent' ? <>
                          <button type="button" className="btn-outline" disabled={busyId === invoice.id} onClick={() => run(invoice.id, () => invoiceAction(invoice.id, 'mark-paid'), `Invoice ${invoice.number} marked paid. Reminders stopped.`)}>Mark paid</button>
                          <button type="button" className="bill-link" disabled={busyId === invoice.id} onClick={() => setSelectedId(invoice.id)}>More</button>
                        </> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <aside className="inv-side">
          {selected ? (
            <div className="set-panel inv-detail">
              <div className="inv-detail-head"><h3>{selected.number}</h3><button type="button" className="modal-close" aria-label="Close details" onClick={() => setSelectedId(null)}>×</button></div>
              <p className="sf-hint">{selected.client_name} · {money(selected.amount_cents, selected.currency)} · due {fmtDay(selected.due_date)}</p>
              {selected.file_path ? <button type="button" className="inv-file-link" onClick={() => openFile(selected.id)}>View {selected.file_name || 'invoice file'}</button> : null}
              {selected.line_items.length ? <ul className="inv-lines">{selected.line_items.map((item, i) => <li key={i}><span>{item.description} × {item.quantity}</span><span>{money(item.quantity * item.unit_cents, selected.currency)}</span></li>)}</ul> : null}
              <BookingReminders
                invoice={selected}
                mailboxConnected={mailboxConnected}
                onInvoiceChange={patch => patchInvoice(selected.id, patch)}
                onError={message => { setNotice(''); setError(message); }}
                onNotice={message => { setError(''); setNotice(message); }}
              />
              <label className="inv-toggle"><input type="checkbox" checked={selected.reminders_enabled} disabled={busyId === selected.id || ['paid', 'void'].includes(selected.status)} onChange={e => run(selected.id, () => updateInvoice(selected.id, { reminders_enabled: e.target.checked }), e.target.checked ? 'Payment reminders on.' : 'Payment reminders paused for this invoice.')} /> Payment reminders</label>
              <label className="inv-toggle"><input type="checkbox" checked={selected.checkins_enabled} disabled={busyId === selected.id || selected.status === 'void'} onChange={e => run(selected.id, () => updateInvoice(selected.id, { checkins_enabled: e.target.checked }), e.target.checked ? 'Post-sale check-ins on.' : 'Post-sale check-ins off for this invoice.')} /> Post-sale check-ins</label>
              <div className="sf-lbl">Activity</div>
              {selected.events.length ? (
                <ol className="inv-timeline">{selected.events.map((e, i) => <li key={i}><b>{describeEvent(e.kind, e.step)}</b><small>{new Date(e.created_at).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' })}</small></li>)}</ol>
              ) : <p className="sf-hint">Nothing sent yet.</p>}
              {selected.status === 'sent' ? (
                <div className="inv-detail-actions">
                  <button type="button" className="btn-outline" disabled={busyId === selected.id || !mailboxConnected} onClick={() => run(selected.id, () => invoiceAction(selected.id, 'send'), 'Invoice resent.')}>Resend invoice</button>
                  <button type="button" className="bill-link" disabled={busyId === selected.id} onClick={async () => { if (await confirmDialog({ title: `Void ${selected.number}?`, message: 'Reminders stop and the invoice is closed without payment.', confirmLabel: 'Void invoice', danger: true })) run(selected.id, () => invoiceAction(selected.id, 'void'), 'Invoice voided.'); }}>Void</button>
                </div>
              ) : null}
            </div>
          ) : null}

          {settings ? (
            <div className="set-panel">
              <h3>Follow-up schedule</h3>
              <p className="sf-hint">Applies to every invoice. Each step is sent once, from your mailbox.</p>
              <label className="inv-toggle"><input type="checkbox" checked={settings.reminders_enabled} onChange={e => saveSchedule({ reminders_enabled: e.target.checked })} /> Payment reminders</label>
              <form onSubmit={e => { e.preventDefault(); saveSchedule({ reminder_offsets: parseOffsets(scheduleText.reminders), checkin_offsets: parseOffsets(scheduleText.checkins), review_link: settings.review_link || '' }); }}>
                <div className="sf">
                  <label className="sf-lbl" htmlFor="inv-reminders">Reminder days, relative to due date</label>
                  <input id="inv-reminders" className="sf-inp" value={scheduleText.reminders} onChange={e => setScheduleText(s => ({ ...s, reminders: e.target.value }))} />
                  <p className="sf-hint">-3 means three days before. 0 is the due date. 7 is a week overdue.</p>
                </div>
                <label className="inv-toggle"><input type="checkbox" checked={settings.checkins_enabled} onChange={e => saveSchedule({ checkins_enabled: e.target.checked })} /> Post-sale check-ins</label>
                <div className="sf">
                  <label className="sf-lbl" htmlFor="inv-checkins">Check-in days after payment</label>
                  <input id="inv-checkins" className="sf-inp" value={scheduleText.checkins} onChange={e => setScheduleText(s => ({ ...s, checkins: e.target.value }))} />
                  <p className="sf-hint">Day 0 is a thank-you. Up to day 14 is an onboarding check-in. Later ones ask for feedback, a review and referrals.</p>
                </div>
                <div className="sf">
                  <label className="sf-lbl" htmlFor="inv-review">Review link (optional)</label>
                  <input id="inv-review" className="sf-inp" type="url" placeholder="https://g.page/r/…" value={settings.review_link || ''} onChange={e => setSettings(s => s && ({ ...s, review_link: e.target.value }))} />
                </div>
                <button type="submit" className="btn-outline">Save schedule</button>
              </form>
            </div>
          ) : null}

          {settings ? (
            <div className="set-panel">
              <h3>Booking reminders</h3>
              <p className="sf-hint">When reminders go out before a booking, in Singapore time. AI writes each one for the client; you approve them per invoice.</p>
              <label className="inv-toggle"><input type="checkbox" checked={settings.booking_reminders_enabled} onChange={e => saveSchedule({ booking_reminders_enabled: e.target.checked })} /> Send booking reminders</label>
              <form onSubmit={e => { e.preventDefault(); saveSchedule({ booking_rules: fromRows(ruleRows) }); }}>
                <ul className="inv-rules">
                  {ruleRows.map((row, i) => (
                    <li key={i}>
                      <input className="sf-inp" aria-label={`Reminder ${i + 1} amount`} type="number" min={row.kind === 'hours' ? 1 : 0} max={row.kind === 'hours' ? 72 : 60} value={row.amount} onChange={e => setRuleRows(rows => rows.map((r, j) => j === i ? { ...r, amount: e.target.value } : r))} />
                      <Select className="sf-inp" aria-label={`Reminder ${i + 1} unit`} value={row.kind} onChange={v => setRuleRows(rows => rows.map((r, j) => j === i ? { ...r, kind: v as RuleRow['kind'] } : r))} options={RULE_KINDS} />
                      {row.kind === 'days' ? <input className="sf-inp" aria-label={`Reminder ${i + 1} time`} type="time" value={row.time} onChange={e => setRuleRows(rows => rows.map((r, j) => j === i ? { ...r, time: e.target.value } : r))} /> : <span />}
                      <button type="button" className="modal-close" aria-label={`Remove reminder ${i + 1}`} onClick={() => setRuleRows(rows => rows.filter((_, j) => j !== i))}>×</button>
                    </li>
                  ))}
                </ul>
                {ruleRows.length < 5 ? <button type="button" className="bill-link" onClick={() => setRuleRows(rows => [...rows, { kind: 'hours', amount: '3', time: '09:00' }])}>+ Add a reminder</button> : null}
                <p className="sf-hint">0 days before means the morning of the booking. Changes apply to reminders you write from now on.</p>
                <button type="submit" className="btn-outline">Save booking reminders</button>
              </form>
            </div>
          ) : null}
        </aside>
      </div>

      {formOpen ? (
        <NewInvoiceModal
          mailboxConnected={mailboxConnected}
          onClose={() => setFormOpen(false)}
          onCreated={async (invoice, sent) => {
            setFormOpen(false);
            setError('');
            setNotice(sent
              ? `Invoice ${invoice.number} sent to ${invoice.client_email}.${invoice.booking_at ? ' Next, write the booking reminders on the right.' : ''}`
              : `Invoice ${invoice.number} saved as a draft.`);
            await refresh();
            setSelectedId(invoice.id);
          }}
        />
      ) : null}
    </section>
  );
}
