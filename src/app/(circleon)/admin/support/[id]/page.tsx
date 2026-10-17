'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { formatDate, type SupportMessage, type Ticket } from '@/lib/adminApi';
import { Badge, Header, LoadState, Status, useAction, useAdmin } from '../../_components/ui';

export default function SupportThread() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useAdmin<{ ticket: Ticket; messages: SupportMessage[] }>(`/support/${id}`);
  const action = useAction(reload);
  const [reply, setReply] = useState('');

  if (!data) return <><Link className="adm-link adm-small" href="/admin/support">← Support</Link><LoadState loading={loading} error={error} /></>;
  const { ticket } = data;

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (await action.run(`/support/${ticket.id}/reply`, 'POST', { body: reply }, (r: { emailed?: boolean }) => r.emailed ? 'Reply sent and emailed.' : 'Reply saved, but the email notification failed. The customer will still see it in the app.')) setReply('');
  }

  return (
    <>
      <Link className="adm-link adm-small" href="/admin/support">← Support</Link>
      <Header title={ticket.subject}>
        <Badge tone={ticket.status === 'open' ? 'warn' : ticket.status === 'answered' ? 'good' : 'neutral'}>{ticket.status}</Badge>
      </Header>
      <p className="adm-muted">
        {ticket.workspace_id ? <Link className="adm-link" href={`/admin/organizations/${ticket.workspace_id}`}>{ticket.workspaces?.name || 'Organization'}</Link> : null}
        {' · '}opened {formatDate(ticket.created_at, true)}
      </p>
      <section className="adm-thread">
        {data.messages.map(m => (
          <article key={m.id} className={`adm-msg adm-msg-${m.sender}`}>
            <header className="adm-small adm-muted">{m.sender === 'admin' ? 'CircleOn' : 'Customer'} · {formatDate(m.created_at, true)}</header>
            <p>{m.body}</p>
          </article>
        ))}
      </section>
      <form className="adm-form adm-card" onSubmit={send}>
        <label>
          Reply (the customer gets this by email too)
          <textarea rows={5} value={reply} onChange={e => setReply(e.target.value)} maxLength={10000} required />
        </label>
        <div className="adm-row">
          <button className="adm-btn adm-primary" disabled={action.busy || !reply.trim()}>Send reply</button>
          {ticket.status !== 'closed'
            ? <button type="button" className="adm-btn" disabled={action.busy} onClick={() => action.run(`/support/${ticket.id}/status`, 'POST', { status: 'closed' }, 'Ticket closed.')}>Close ticket</button>
            : <button type="button" className="adm-btn" disabled={action.busy} onClick={() => action.run(`/support/${ticket.id}/status`, 'POST', { status: 'open' }, 'Ticket reopened.')}>Reopen</button>}
        </div>
        <Status message={action.message} />
      </form>
    </>
  );
}
