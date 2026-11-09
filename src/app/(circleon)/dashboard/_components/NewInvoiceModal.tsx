'use client';

import { useRef, useState } from 'react';
import { createInvoice, extractInvoice, invoiceAction, type Invoice, type InvoiceLineItem, type UploadedInvoiceFile } from '@/lib/api';
import Select from '@/components/circleon/Select';

const ACCEPT = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;
const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'AUD', 'MYR', 'IDR', 'INR', 'HKD'].map(c => ({ value: c, label: c }));

export function sgDate(offsetDays = 0) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date(Date.now() + offsetDays * 86400000));
}

/** A Singapore date and time from the form, as an ISO timestamp. */
export function bookingIso(date: string, time: string) {
  return date ? `${date}T${time || '09:00'}:00+08:00` : null;
}

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

type Form = {
  client_name: string; client_email: string; number: string; currency: string; amount: string;
  issue_date: string; due_date: string; payment_link: string; notes: string;
  booking_title: string; booking_date: string; booking_time: string; booking_notes: string;
};
const emptyForm = (): Form => ({
  client_name: '', client_email: '', number: '', currency: 'SGD', amount: '',
  issue_date: sgDate(), due_date: sgDate(14), payment_link: '', notes: '',
  booking_title: '', booking_date: '', booking_time: '09:00', booking_notes: '',
});

export default function NewInvoiceModal({ mailboxConnected, onClose, onCreated }: {
  mailboxConnected: boolean;
  onClose: () => void;
  onCreated: (invoice: Invoice, sent: boolean) => void;
}) {
  const [step, setStep] = useState<'upload' | 'reading' | 'review'>('upload');
  const [file, setFile] = useState<UploadedInvoiceFile | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [read, setRead] = useState<Set<keyof Form>>(new Set());
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [sendNow, setSendNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const set = (key: keyof Form, value: string) => setForm(f => ({ ...f, [key]: value }));

  async function upload(picked: File | undefined) {
    if (!picked) return;
    setError(''); setWarning('');
    if (!ACCEPT.includes(picked.type)) { setError('Upload a PDF or an image (PNG, JPEG or WebP).'); return; }
    if (picked.size > MAX_BYTES) { setError('Invoice files can be up to 10 MB.'); return; }
    setStep('reading');
    try {
      const data = await extractInvoice({ filename: picked.name, mime_type: picked.type, size_bytes: picked.size, content_base64: await readBase64(picked) });
      setFile(data.file);
      const f = data.fields;
      if (f) {
        const next: Form = {
          ...emptyForm(),
          client_name: f.client_name, client_email: f.client_email, number: f.number,
          currency: f.currency || 'SGD', amount: f.amount ? String(f.amount) : '',
          issue_date: f.issue_date || sgDate(), due_date: f.due_date || sgDate(14),
          booking_title: f.booking_title, booking_date: f.booking_date, booking_time: f.booking_time || '09:00',
        };
        setForm(next);
        setItems(f.line_items);
        setRead(new Set((Object.keys(next) as Array<keyof Form>).filter(k => {
          const source: Record<string, unknown> = { ...f, amount: f.amount ?? '' };
          return Boolean(source[k]);
        })));
        const missing = [!f.client_email && 'client email', !f.amount && 'amount', !f.due_date && 'due date'].filter(Boolean);
        if (missing.length) setWarning(`We couldn't find the ${missing.join(', ')} on the invoice. Please fill ${missing.length === 1 ? 'it' : 'them'} in.`);
      } else {
        setWarning(data.warning || 'We saved your file. Fill in the details below.');
      }
      setStep('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload the invoice.');
      setStep('upload');
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (form.booking_date && !form.booking_time) { setError('Add the booking start time.'); return; }
    setSaving(true);
    try {
      const { invoice } = await createInvoice({
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        number: form.number.trim() || undefined,
        currency: form.currency,
        amount: Number(form.amount),
        line_items: items,
        issue_date: form.issue_date || undefined,
        due_date: form.due_date,
        payment_link: form.payment_link || null,
        notes: form.notes || null,
        file_path: file?.path ?? null,
        file_name: file?.name ?? null,
        file_mime: file?.mime ?? null,
        booking_at: bookingIso(form.booking_date, form.booking_time),
        booking_title: form.booking_title || null,
        booking_notes: form.booking_notes || null,
      });
      const send = sendNow && mailboxConnected;
      if (send) await invoiceAction(invoice.id, 'send');
      onCreated(invoice, send);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the invoice.');
    } finally {
      setSaving(false);
    }
  }

  const hint = (key: keyof Form) => read.has(key) ? <span className="inv-read">Read from invoice</span> : null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={e => { if (e.target === e.currentTarget && !saving && step !== 'reading') onClose(); }}>
      <form className="modal-card inv-form" role="dialog" aria-modal="true" aria-labelledby="inv-form-title" onSubmit={submit}>
        <div className="card-head">
          <h3 id="inv-form-title" className="card-title">{step === 'review' ? 'Check and send' : 'New invoice'}</h3>
          <button type="button" className="modal-close" aria-label="Close" disabled={saving || step === 'reading'} onClick={onClose}>×</button>
        </div>

        {error ? <p className="inv-msg is-error" role="alert">{error}</p> : null}

        {step === 'upload' ? (
          <div className="inv-upload-step">
            <label
              className={`inv-drop${dragging ? ' is-dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
            >
              <input ref={inputRef} type="file" accept={ACCEPT.join(',')} onChange={e => upload(e.target.files?.[0])} />
              <span className="inv-drop-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M12 17v-6" /><path d="m9.5 13.5 2.5-2.5 2.5 2.5" /></svg>
              </span>
              <b>Upload your invoice</b>
              <span>Drop a PDF or photo here, or <u>choose a file</u>. We read the client, amount and dates for you to check.</span>
              <small>PDF, PNG, JPEG or WebP, up to 10 MB</small>
            </label>
            <button type="button" className="bill-link" onClick={() => setStep('review')}>No file? Enter the details yourself</button>
          </div>
        ) : null}

        {step === 'reading' ? (
          <div className="inv-reading" role="status" aria-live="polite">
            <span className="inv-spinner" aria-hidden="true" />
            <b>Reading your invoice…</b>
            <span>This usually takes a few seconds.</span>
          </div>
        ) : null}

        {step === 'review' ? (
          <>
            {file ? (
              <div className="inv-file-chip">
                <span className="inv-file-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg></span>
                <div><b>{file.name}</b><small>Attached to the email your client receives</small></div>
                <button type="button" className="bill-link" onClick={() => { setFile(null); setItems([]); setRead(new Set()); setForm(emptyForm()); setStep('upload'); }}>Replace</button>
              </div>
            ) : null}
            {warning ? <p className="inv-warn" role="status">{warning}</p> : null}

            <div className="inv-grid">
              <div className="sf"><label className="sf-lbl" htmlFor="inv-client">Client name {hint('client_name')}</label><input id="inv-client" className="sf-inp" required value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-email">Client email {hint('client_email')}</label><input id="inv-email" className="sf-inp" type="email" required value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-amount">Amount due {hint('amount')}</label>
                <div className="inv-amount">
                  <Select className="sf-inp" aria-label="Currency" value={form.currency} onChange={v => set('currency', v)} options={CURRENCIES} />
                  <input id="inv-amount" className="sf-inp" type="number" min="0.01" step="0.01" required value={form.amount} onChange={e => set('amount', e.target.value)} />
                </div>
              </div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-number">Invoice number {hint('number')}</label><input id="inv-number" className="sf-inp" placeholder="Leave blank to number it for you" value={form.number} onChange={e => set('number', e.target.value)} /></div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-issue">Issue date {hint('issue_date')}</label><input id="inv-issue" className="sf-inp" type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} /></div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-due">Due date {hint('due_date')}</label><input id="inv-due" className="sf-inp" type="date" required min={form.issue_date || undefined} value={form.due_date} onChange={e => set('due_date', e.target.value)} /></div>
            </div>

            {items.length ? (
              <details className="inv-items-read">
                <summary>{items.length} line item{items.length === 1 ? '' : 's'} read from the invoice</summary>
                <ul className="inv-lines">{items.map((item, i) => <li key={i}><span>{item.description} × {item.quantity}</span><span>{(item.quantity * item.unit_cents / 100).toFixed(2)}</span></li>)}</ul>
              </details>
            ) : null}

            <fieldset className="inv-booking-fields">
              <legend>Booking <span>optional</span></legend>
              <p className="sf-hint">Add the date of the service, like a charter, class or appointment. CircleOn can send your client personalised reminders before it.</p>
              <div className="inv-grid inv-grid-3">
                <div className="sf"><label className="sf-lbl" htmlFor="inv-btitle">What is booked {hint('booking_title')}</label><input id="inv-btitle" className="sf-inp" placeholder="Sunset yacht charter" value={form.booking_title} onChange={e => set('booking_title', e.target.value)} /></div>
                <div className="sf"><label className="sf-lbl" htmlFor="inv-bdate">Date {hint('booking_date')}</label><input id="inv-bdate" className="sf-inp" type="date" value={form.booking_date} onChange={e => set('booking_date', e.target.value)} /></div>
                <div className="sf"><label className="sf-lbl" htmlFor="inv-btime">Start time</label><input id="inv-btime" className="sf-inp" type="time" value={form.booking_time} onChange={e => set('booking_time', e.target.value)} /></div>
              </div>
              {form.booking_date ? (
                <div className="sf"><label className="sf-lbl" htmlFor="inv-bnotes">What should they know or bring?</label>
                  <textarea id="inv-bnotes" className="sf-ta" rows={3} placeholder="Bring your IC and a towel. Meet at Marina Pier 3 at 4:45 PM. Soft-soled shoes only." value={form.booking_notes} onChange={e => set('booking_notes', e.target.value)} />
                  <p className="sf-hint">AI uses this to write each client a personal reminder. You approve them before anything is sent.</p>
                </div>
              ) : null}
            </fieldset>

            <details className="inv-more">
              <summary>Payment link and notes</summary>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-pay">Payment link (optional)</label><input id="inv-pay" className="sf-inp" type="url" placeholder="https://" value={form.payment_link} onChange={e => set('payment_link', e.target.value)} /></div>
              <div className="sf"><label className="sf-lbl" htmlFor="inv-notes">Note on the invoice email (optional)</label><textarea id="inv-notes" className="sf-ta" rows={2} placeholder="PayNow UEN, bank transfer details…" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
            </details>

            <div className="inv-form-foot">
              <label className="inv-toggle"><input type="checkbox" checked={sendNow && mailboxConnected} disabled={!mailboxConnected} onChange={e => setSendNow(e.target.checked)} /> Email it to the client now</label>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : sendNow && mailboxConnected ? 'Send invoice' : 'Save draft'}</button>
            </div>
          </>
        ) : null}
      </form>
    </div>
  );
}
