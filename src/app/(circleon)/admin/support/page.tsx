'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatDate, type Paged, type Ticket } from '@/lib/adminApi';
import { Badge, Header, LoadState, Pager, useAdmin } from '../_components/ui';

const FILTERS = [['open', 'Needs reply'], ['answered', 'Answered'], ['closed', 'Closed'], ['', 'All']] as const;

export default function SupportInbox() {
  const [status, setStatus] = useState<string>('open');
  const [page, setPage] = useState(0);
  const { data, error, loading } = useAdmin<Paged & { tickets: Ticket[] }>(`/support?status=${status}&page=${page}`);

  return (
    <>
      <Header title="Support">
        <div className="adm-tabs">
          {FILTERS.map(([value, label]) => (
            <button key={value} className={`adm-tab${status === value ? ' active' : ''}`} onClick={() => { setStatus(value); setPage(0); }}>{label}</button>
          ))}
        </div>
      </Header>
      <LoadState loading={loading && !data} error={error} />
      {data ? (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Subject</th><th>Organization</th><th>Status</th><th>Last message</th></tr></thead>
              <tbody>
                {data.tickets.map(t => (
                  <tr key={t.id}>
                    <td><Link href={`/admin/support/${t.id}`}>{t.subject}</Link></td>
                    <td>{t.workspaces?.name || '—'}</td>
                    <td><Badge tone={t.status === 'open' ? 'warn' : t.status === 'answered' ? 'good' : 'neutral'}>{t.status}</Badge></td>
                    <td>{formatDate(t.last_message_at, true)}</td>
                  </tr>
                ))}
                {!data.tickets.length ? <tr><td colSpan={4} className="adm-muted">No tickets here.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} total={data.total} size={data.page_size} onPage={setPage} />
        </>
      ) : null}
    </>
  );
}
