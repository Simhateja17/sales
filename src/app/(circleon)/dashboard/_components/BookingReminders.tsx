'use client';

import { useEffect, useState } from 'react';
import {
  approveBookingReminders, cancelBookingReminder, draftBookingReminders, updateBookingReminder, updateInvoice,
  type BookingReminder, type Invoice,
} from '@/lib/api';
import { bookingIso } from './NewInvoiceModal';

const TZ = 'Asia/Singapore';
const STATUS: Record<BookingReminder['status'], [string, string]> = {
  draft: ['Draft', 'b-noanswer'],
  scheduled: ['Scheduled', 'b-interested'],
  sending: ['Sending', 'b-interested'],
  sent: ['Sent', 'b-booked'],
  failed: ['Failed', 'b-overdue'],
  cancelled: ['Cancelled', 'b-noanswer'],
};

export function formatBookingTime(iso: string) {
  return new Date(iso).toLocaleString('en-SG', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
function sgParts(iso: string | null) {
  if (!iso) return { date: '', time: '09:00' };
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d),
    time: new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d),
  };
}

function ReminderCard({ invoice, reminder, onChange, onError }: {
  invoice: Invoice; reminder: BookingReminder;
  onChange: (list: BookingReminder[]) => void; onError: (message: string) => void;
}) {
  const [subject, setSubject] = useState(reminder.subject);
  const [body, setBody] = useState(reminder.body);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setSubject(reminder.subject); setBody(reminder.body); }, [reminder.subject, reminder.body]);
  const editable = ['draft', 'scheduled', 'failed'].includes(reminder.status);
  const dirty = subject !== reminder.subject || body !== reminder.body;
  const [label, badge] = STATUS[reminder.status];

  async function act(fn: () => Promise<{ booking_reminders: BookingReminder[] }>) {
    setBusy(true);
    try { onChange((await fn()).booking_reminders); } catch (e) { onError(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); }
  }

  return (
    <li className={`inv-br is-${reminder.status}`}>
      <div className="inv-br-head">
        <span className="inv-br-when">{reminder.status === 'sent' && reminder.sent_at ? `Sent ${formatBookingTime(reminder.sent_at)}` : formatBookingTime(reminder.send_at)}</span>
        <span className={`badge ${badge}`}>{label}</span>
      </div>
      {editable ? (
        <>
          <input className="sf-inp" aria-label="Reminder subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <textarea className="sf-ta" aria-label="Reminder message" rows={7} value={body} onChange={e => setBody(e.target.value)} />
          <div className="inv-br-actions">
            {dirty ? <button type="button" className="btn-outline" disabled={busy} onClick={() => act(() => updateBookingReminder(invoice.id, reminder.id, { subject, body }))}>Save edits</button> : null}
            <button type="button" className="bill-link" disabled={busy} onClick={() => act(() => cancelBookingReminder(invoice.id, reminder.id))}>Don&apos;t send</button>
          </div>
          {reminder.error ? <small className="inv-err">{reminder.error}</small> : null}
        </>
      ) : (
        <>
          <b className="inv-br-subject">{reminder.subject}</b>
          {reminder.status === 'cancelled' && reminder.error ? <small className="sf-hint">{reminder.error}</small> : null}
          {reminder.status === 'sent' ? <details><summary>Show message</summary><p className="inv-br-body">{reminder.body}</p></details> : null}
        </>
      )}
    </li>
  );
}

/** Booking details and the personalised reminders before it, in the invoice side panel. */
export default function BookingReminders({ invoice, mailboxConnected, onInvoiceChange, onError, onNotice }: {
  invoice: Invoice;
  mailboxConnected: boolean;
  onInvoiceChange: (patch: Partial<Invoice>) => void;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const initial = sgParts(invoice.booking_at);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(invoice.booking_title || '');
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [notes, setNotes] = useState(invoice.booking_notes || '');
  const [busy, setBusy] = useState<'' | 'save' | 'draft' | 'approve'>('');

  useEffect(() => {
    const p = sgParts(invoice.booking_at);
    setTitle(invoice.booking_title || ''); setDate(p.date); setTime(p.time); setNotes(invoice.booking_notes || ''); setEditing(false);
  }, [invoice.id, invoice.booking_at, invoice.booking_title, invoice.booking_notes]);

  const reminders = invoice.booking_reminders || [];
  const drafts = reminders.filter(r => r.status === 'draft' || r.status === 'failed');
  const pending = reminders.filter(r => ['draft', 'scheduled', 'failed'].includes(r.status));
  const closed = invoice.status === 'void';
  const past = invoice.booking_at ? new Date(invoice.booking_at) <= new Date() : false;
  const setReminders = (list: BookingReminder[]) => onInvoiceChange({ booking_reminders: list });

  async function saveBooking() {
    if (!date) { onError('Pick the booking date.'); return; }
    setBusy('save');
    try {
      const res = await updateInvoice(invoice.id, { booking_title: title || null, booking_at: bookingIso(date, time), booking_notes: notes || null });
      onInvoiceChange(res.invoice);
      setEditing(false);
      onNotice(res.booking_reminders_reset ? 'Booking moved. Unsent reminders were cleared, so write them again for the new time.' : 'Booking saved.');
    } catch (e) { onError(e instanceof Error ? e.message : 'Could not save the booking.'); }
    finally { setBusy(''); }
  }

  async function draft() {
    setBusy('draft');
    try {
      const res = await draftBookingReminders(invoice.id, notes || null);
      onInvoiceChange({ booking_reminders: res.booking_reminders, booking_notes: notes || null });
      onNotice('Reminders written. Read them, edit anything you like, then approve.');
    } catch (e) { onError(e instanceof Error ? e.message : 'Could not write the reminders.'); }
    finally { setBusy(''); }
  }

  async function approve() {
    setBusy('approve');
    try {
      const res = await approveBookingReminders(invoice.id);
      setReminders(res.booking_reminders);
      const n = res.booking_reminders.filter(r => r.status === 'scheduled').length;
      onNotice(n ? `${n} reminder${n === 1 ? '' : 's'} scheduled. They go out from your mailbox at the times shown.` : 'Nothing was scheduled: those send times have passed.');
    } catch (e) { onError(e instanceof Error ? e.message : 'Could not schedule the reminders.'); }
    finally { setBusy(''); }
  }

  if (!invoice.booking_at || editing) {
    if (closed) return null;
    return (
      <div className="inv-booking">
        <div className="sf-lbl">Booking</div>
        {!editing ? <p className="sf-hint">Add the date of the service to send your client personalised reminders before it.</p> : null}
        <div className="sf"><label className="sf-lbl" htmlFor="bk-title">What is booked</label><input id="bk-title" className="sf-inp" placeholder="Sunset yacht charter" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div className="inv-grid inv-grid-tight">
          <div className="sf"><label className="sf-lbl" htmlFor="bk-date">Date</label><input id="bk-date" className="sf-inp" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="sf"><label className="sf-lbl" htmlFor="bk-time">Start time</label><input id="bk-time" className="sf-inp" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
        </div>
        <div className="inv-br-actions">
          <button type="button" className="btn-outline" disabled={busy === 'save'} onClick={saveBooking}>{busy === 'save' ? 'Saving…' : 'Save booking'}</button>
          {editing ? <button type="button" className="bill-link" onClick={() => setEditing(false)}>Cancel</button> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="inv-booking">
      <div className="inv-booking-card">
        <span className="inv-booking-kicker">Booking</span>
        <b>{invoice.booking_title || 'Booking'}</b>
        <span>{formatBookingTime(invoice.booking_at)}</span>
        {!closed ? <button type="button" className="bill-link" onClick={() => setEditing(true)}>Change</button> : null}
      </div>

      {!closed && !past ? (
        <>
          <div className="sf">
            <label className="sf-lbl" htmlFor="bk-notes">What should they know or bring?</label>
            <textarea id="bk-notes" className="sf-ta" rows={3} placeholder="Bring your IC and a towel. Meet at Marina Pier 3 at 4:45 PM." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="button" className={pending.length ? 'btn-outline' : 'btn-primary'} disabled={busy === 'draft'} onClick={draft}>
            {busy === 'draft' ? 'Writing reminders…' : pending.length ? 'Rewrite with AI' : 'Write reminders with AI'}
          </button>
          <p className="sf-hint">Written for {invoice.client_name.split(' ')[0]} using the booking and your notes, at the times set in Booking reminders below.</p>
        </>
      ) : null}
      {past && !reminders.length ? <p className="sf-hint">This booking has passed.</p> : null}

      {reminders.length ? (
        <ol className="inv-br-list">
          {reminders.map(r => <ReminderCard key={r.id} invoice={invoice} reminder={r} onChange={setReminders} onError={onError} />)}
        </ol>
      ) : null}

      {drafts.length && !closed ? (
        <>
          <button type="button" className="btn-primary inv-approve" disabled={busy === 'approve'} onClick={approve}>
            {busy === 'approve' ? 'Scheduling…' : `Approve and schedule ${drafts.length} reminder${drafts.length === 1 ? '' : 's'}`}
          </button>
          {!mailboxConnected ? <p className="sf-hint">Connect a mailbox so scheduled reminders can be sent.</p> : null}
        </>
      ) : null}
    </div>
  );
}
