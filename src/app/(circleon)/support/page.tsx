'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiFetch, isAuthenticationError } from '@/lib/api';
import '../admin/admin.css';

type Ticket = { id: string; subject: string; status: 'open' | 'answered' | 'closed'; last_message_at: string };
type Message = { id: string; sender: 'user' | 'admin'; body: string; created_at: string };

export default function SupportPage() {
  return <Suspense fallback={null}><Support /></Suspense>;
}

function Support() {
  const router = useRouter();
  const ticketId = useSearchParams().get('ticket');
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setTickets((await apiFetch<{ tickets: Ticket[] }>('/api/support')).tickets); }
    catch (e) {
      if (isAuthenticationError(e)) router.replace(`/login?returnTo=${encodeURIComponent('/support')}`);
      else setError(e instanceof Error ? e.message : 'Could not load your requests.');
    }
  }, [router]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="adm-center" style={{ alignItems: 'start' }}>
      <main className="adm-main" style={{ maxWidth: 760 }}>
        <Link className="adm-link adm-small" href="/dashboard">← Dashboard</Link>
        <header className="adm-header"><h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, margin: 0 }}>Support</h1></header>
        {error ? <p className="adm-error" role="alert">{error}</p> : null}
        {ticketId
          ? <Thread id={ticketId} onBack={() => { router.push('/support'); load(); }} />
          : <>
              <NewTicket onCreated={id => router.push(`/support?ticket=${id}`)} />
              <section className="adm-card">
                <h2 style={{ margin: 0, fontSize: 15 }}>Your requests</h2>
                {tickets === null ? <p className="adm-muted">Loading…</p> : tickets.length ? (
                  <ul className="adm-list">
                    {tickets.map(t => (
                      <li key={t.id}>
                        <Link className="adm-link" href={`/support?ticket=${t.id}`}>{t.subject}</Link>
                        <span className="adm-small adm-muted">{t.status === 'answered' ? 'Replied' : t.status === 'open' ? 'Waiting for us' : 'Closed'} · {new Date(t.last_message_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="adm-muted">No requests yet.</p>}
              </section>
            </>}
      </main>
    </div>
  );
}

function NewTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const { ticket_id } = await apiFetch<{ ticket_id: string }>('/api/support', { method: 'POST', body: JSON.stringify({ subject: form.get('subject'), body: form.get('body') }) });
      onCreated(ticket_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send your request.'); }
    finally { setBusy(false); }
  }
  return (
    <form className="adm-card adm-form" onSubmit={submit}>
      <h2 style={{ margin: 0, fontSize: 15 }}>Ask for help</h2>
      <p className="adm-muted adm-small" style={{ margin: 0 }}>We reply here and by email, usually within one business day.</p>
      <label>Subject<input name="subject" minLength={3} maxLength={200} required /></label>
      <label style={{ maxWidth: 'none' }}>What do you need?<textarea name="body" rows={5} maxLength={10000} required /></label>
      <button className="adm-btn adm-primary" disabled={busy}>{busy ? 'Sending…' : 'Send'}</button>
      {error ? <p className="adm-error" role="alert">{error}</p> : null}
    </form>
  );
}

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<{ ticket: Ticket; messages: Message[] } | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setData(await apiFetch(`/api/support/${id}`)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load this request.'); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await apiFetch(`/api/support/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: reply }) });
      setReply('');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send.'); }
    finally { setBusy(false); }
  }

  return (
    <>
      <button className="adm-link adm-small" style={{ alignSelf: 'flex-start' }} onClick={onBack}>← All requests</button>
      {data ? (
        <>
          <h2 style={{ margin: 0 }}>{data.ticket.subject}</h2>
          <section className="adm-thread">
            {data.messages.map(m => (
              <article key={m.id} className={`adm-msg ${m.sender === 'user' ? 'adm-msg-admin' : ''}`}>
                <header className="adm-small adm-muted">{m.sender === 'admin' ? 'CircleOn support' : 'You'} · {new Date(m.created_at).toLocaleString()}</header>
                <p>{m.body}</p>
              </article>
            ))}
          </section>
          <form className="adm-card adm-form" onSubmit={send}>
            <label style={{ maxWidth: 'none' }}>Reply<textarea rows={4} value={reply} onChange={e => setReply(e.target.value)} maxLength={10000} required /></label>
            <button className="adm-btn adm-primary" disabled={busy || !reply.trim()}>{busy ? 'Sending…' : 'Send'}</button>
          </form>
        </>
      ) : !error ? <p className="adm-muted">Loading…</p> : null}
      {error ? <p className="adm-error" role="alert">{error}</p> : null}
    </>
  );
}
