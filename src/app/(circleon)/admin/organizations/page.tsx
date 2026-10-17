'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatDate, type Organization, type Paged } from '@/lib/adminApi';
import { Badge, Header, LoadState, Pager, subscriptionTone, useAdmin } from '../_components/ui';

export default function Organizations() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const { data, error, loading } = useAdmin<Paged & { organizations: Organization[] }>(`/organizations?page=${page}&q=${encodeURIComponent(search)}`);

  return (
    <>
      <Header title="Organizations">
        <form className="adm-search" onSubmit={e => { e.preventDefault(); setPage(0); setSearch(query.trim()); }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name" aria-label="Search organizations" />
          <button className="adm-btn">Search</button>
        </form>
      </Header>
      <LoadState loading={loading && !data} error={error} />
      {data ? (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Organization</th><th>Owner</th><th>Plan</th><th>Status</th><th>Onboarded</th><th>Created</th></tr></thead>
              <tbody>
                {data.organizations.map(o => (
                  <tr key={o.id}>
                    <td><Link href={`/admin/organizations/${o.id}`}>{o.name}</Link></td>
                    <td>{o.owner_email || '—'}</td>
                    <td>{o.billing?.plan || '—'}</td>
                    <td>
                      <Badge tone={subscriptionTone(o.billing?.subscription_status, o.billing?.suspended_at)}>
                        {o.billing?.suspended_at ? 'suspended' : o.billing?.subscription_status || 'no plan'}
                      </Badge>
                      {o.billing?.payment_failed ? <> <Badge tone="bad">payment failed</Badge></> : null}
                    </td>
                    <td>{o.onboarding_completed ? 'Yes' : 'No'}</td>
                    <td>{formatDate(o.created_at)}</td>
                  </tr>
                ))}
                {!data.organizations.length ? <tr><td colSpan={6} className="adm-muted">No organizations match.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} total={data.total} size={data.page_size} onPage={setPage} />
        </>
      ) : null}
    </>
  );
}
