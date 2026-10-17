'use client';

import { useState } from 'react';

import { formatDate, humanize, type AuditEntry, type Paged } from '@/lib/adminApi';
import { Header, LoadState, Pager, useAdmin } from '../_components/ui';

export default function AuditLog() {
  const [page, setPage] = useState(0);
  const { data, error, loading } = useAdmin<Paged & { entries: AuditEntry[] }>(`/audit?page=${page}`);
  return (
    <>
      <Header title="Audit log" />
      <p className="adm-muted">Every admin change is recorded before it is applied, including two-factor verifications.</p>
      <LoadState loading={loading && !data} error={error} />
      {data ? (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>When</th><th>Action</th><th>Target</th><th>Change</th><th>IP</th></tr></thead>
              <tbody>
                {data.entries.map(e => (
                  <tr key={e.id}>
                    <td>{formatDate(e.created_at, true)}</td>
                    <td>{humanize(e.action)}</td>
                    <td>{e.target_type}{e.target_id ? <> <code className="adm-small">{e.target_id.slice(0, 8)}</code></> : null}</td>
                    <td className="adm-small">{e.before ? <div className="adm-muted">from {JSON.stringify(e.before)}</div> : null}{e.after ? <div>to {JSON.stringify(e.after)}</div> : null}</td>
                    <td className="adm-small adm-muted">{e.ip || '—'}</td>
                  </tr>
                ))}
                {!data.entries.length ? <tr><td colSpan={5} className="adm-muted">No entries yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} total={data.total} size={data.page_size} onPage={setPage} />
        </>
      ) : null}
    </>
  );
}
