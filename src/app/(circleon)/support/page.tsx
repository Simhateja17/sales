'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiFetch, getSmtpStatus, getWorkspace, isAuthenticationError, type ConnectedAccount, type Workspace, type WorkspaceBilling } from '@/lib/api';
import Sidebar from '../dashboard/_lib/Sidebar';
import type { Page } from '../dashboard/_lib/ui';
import { pagePath } from '../dashboard/_lib/routes';

type Ticket = { id: string; subject: string; status: 'open' | 'answered' | 'closed'; last_message_at: string };
type Message = { id: string; sender: 'user' | 'admin'; body: string; created_at: string };

const STATUS_LABEL: Record<Ticket['status'], string> = { open: 'Awaiting reply', answered: 'Replied', closed: 'Resolved' };
const TOPICS = ['Email sending', 'Voice agent', 'Leads', 'Billing', 'Something else'];

export default function SupportPage() {
  return <Suspense fallback={null}><Support /></Suspense>;
}

function Support() {
  const router = useRouter();
  const ticketId = useSearchParams().get('ticket');
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [billing, setBilling] = useState<WorkspaceBilling | null>(null);
  const [smtpAccount, setSmtpAccount] = useState<ConnectedAccount | null>(null);

  const load = useCallback(async () => {
    try { setTickets((await apiFetch<{ tickets: Ticket[] }>('/api/support')).tickets); }
    catch (e) {
      if (isAuthenticationError(e)) router.replace(`/login?returnTo=${encodeURIComponent('/support')}`);
      else setError(e instanceof Error ? e.message : 'Could not load your requests.');
    }
  }, [router]);
  useEffect(() => { load(); }, [load]);

  // The sidebar's trial card and mailbox footer need the workspace; failing to load them must not block support.
  useEffect(() => {
    getWorkspace().then(data => { setWorkspace(data.workspace); setBilling(data.billing); }).catch(() => {});
    getSmtpStatus().then(data => setSmtpAccount(data.account)).catch(() => {});
  }, []);

  const goTo = (page: Page) => router.push(pagePath(page));

  return (
    <>
      <Sidebar activePage="support" onNavigate={goTo} workspace={workspace} billing={billing} smtpAccount={smtpAccount} pendingReplies={0} onError={setError} />
      <main className="main-content sup">
        <div className="page-header">
          <div>
            <div className="page-kicker">Help</div>
            <h2 className="page-title">Support</h2>
            <p className="page-sub">Ask us anything. We reply here and by email.</p>
          </div>
        </div>
        {error ? <p className="sup-error" role="alert">{error}</p> : null}
        {ticketId
          ? <Thread id={ticketId} onBack={() => { router.push('/support'); load(); }} />
          : <>
              <div className="sup-quick">
                <Link className="sup-q" href="/help">
                  <span className="sup-q-ic sup-q-purple"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7a3 3 0 013 3v12a2 2 0 00-2-2H4zM20 5h-5a3 3 0 00-3 3v12a2 2 0 012-2h6z" /></svg></span>
                  <span><b>Help Center</b><small>Guides and answers</small></span>
                </Link>
                <Link className="sup-q" href="/demo">
                  <span className="sup-q-ic sup-q-gold"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg></span>
                  <span><b>Book a call</b><small>Talk to our team</small></span>
                </Link>
              </div>
              <div className="sup-grid">
                <NewTicket onCreated={id => router.push(`/support?ticket=${id}`)} />
                <div className="sup-side">
                  <div className="sup-sla">
                    <span className="sup-mono">Response time</span>
                    <b>Within 1 business day</b>
                    <p>We reply here and by email. Please do not include passwords or card numbers.</p>
                  </div>
                  <section className="sup-panel">
                    <h3>Your requests</h3>
                    {tickets === null ? <p className="sup-muted">Loading…</p> : tickets.length ? (
                      <ul className="sup-list">
                        {tickets.map(t => (
                          <li key={t.id}>
                            <span className={`sup-dot sup-dot-${t.status}`} />
                            <span>
                              <Link href={`/support?ticket=${t.id}`}>{t.subject}</Link>
                              <small>{t.status === 'closed' ? 'Resolved' : 'Updated'} {new Date(t.last_message_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace('Sept', 'Sep')}</small>
                            </span>
                            <span className={`sup-tag sup-tag-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="sup-muted">No requests yet.</p>}
                  </section>
                </div>
              </div>
            </>}
      </main>
    </>
  );
}

function NewTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const { ticket_id } = await apiFetch<{ ticket_id: string }>('/api/support', { method: 'POST', body: JSON.stringify({ subject: `[${topic}] ${String(form.get('subject') || '').trim()}`, body: form.get('body') }) });
      onCreated(ticket_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send your request.'); }
    finally { setBusy(false); }
  }
  return (
    <form className="sup-panel sup-form" onSubmit={submit}>
      <h3>Ask for help</h3>
      <p className="sup-muted">Pick a topic so it reaches the right person.</p>
      <div className="sup-topics" role="group" aria-label="Topic">
        {TOPICS.map(item => <button key={item} type="button" className={topic === item ? 'on' : ''} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}
      </div>
      <label>Subject<input name="subject" minLength={3} maxLength={180} required placeholder="e.g. Emails stuck in draft" /></label>
      <label>What do you need?<textarea name="body" rows={6} maxLength={10000} required placeholder="Tell us what happened, what you expected, and the campaign or lead involved." /><small>Do not include passwords or card numbers.</small></label>
      {error ? <p className="sup-error" role="alert">{error}</p> : null}
      <div className="sup-foot"><button className="btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button></div>
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
    <div className="sup-thread-wrap">
      <button className="sup-back" type="button" onClick={onBack}>← All requests</button>
      {data ? (
        <>
          <h3 className="sup-thread-title">{data.ticket.subject}</h3>
          <section className="sup-thread">
            {data.messages.map(m => (
              <article key={m.id} className={`sup-msg ${m.sender === 'user' ? 'is-you' : ''}`}>
                <header>{m.sender === 'admin' ? 'CircleOn support' : 'You'} · {new Date(m.created_at).toLocaleString('en-SG')}</header>
                <p>{m.body}</p>
              </article>
            ))}
          </section>
          <form className="sup-panel sup-form" onSubmit={send}>
            <label>Reply<textarea rows={4} value={reply} onChange={e => setReply(e.target.value)} maxLength={10000} required /></label>
            <div className="sup-foot"><button className="btn-primary" disabled={busy || !reply.trim()}>{busy ? 'Sending…' : 'Send'}</button></div>
          </form>
        </>
      ) : !error ? <p className="sup-muted">Loading…</p> : null}
      {error ? <p className="sup-error" role="alert">{error}</p> : null}
    </div>
  );
}
