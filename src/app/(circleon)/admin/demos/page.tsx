'use client';

import { formatDate } from '@/lib/adminApi';
import { Header, LoadState, useAdmin } from '../_components/ui';

type Demo = { id: string; name: string; company: string; email: string; message: string; created_at: string };

export default function DemoRequests() {
  const { data, error, loading } = useAdmin<{ demos: Demo[] }>('/demos');
  return (
    <>
      <Header title="Demo requests" />
      <LoadState loading={loading && !data} error={error} />
      {data && !data.demos.length ? <p className="adm-muted">No demo requests yet.</p> : null}
      {data?.demos.map(d => (
        <section className="adm-card" key={d.id}>
          <div className="adm-row adm-between"><h2>{d.name} · {d.company}</h2><span className="adm-small adm-muted">{formatDate(d.created_at, true)}</span></div>
          <p><a className="adm-link" href={`mailto:${d.email}`}>{d.email}</a></p>
          {d.message ? <p className="adm-pre">{d.message}</p> : null}
        </section>
      ))}
    </>
  );
}
