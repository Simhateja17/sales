'use client';

import { useCallback, useEffect, useState } from 'react';

import { adminFetch } from '@/lib/adminApi';

/** Loads an admin endpoint and reloads it after a mutation. */
export function useAdmin<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try { setData(await adminFetch<T>(path)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setLoading(false); }
  }, [path]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

/** Runs a mutation and reports the outcome in one status line. */
export function useAction(onSuccess?: () => unknown) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run<T = Record<string, unknown>>(path: string, method: string, body: unknown, success: string | ((data: T) => string) = 'Saved.') {
    setBusy(true); setMessage(null);
    try {
      const data = await adminFetch<T>(path, method, body);
      await onSuccess?.();
      setMessage({ ok: true, text: typeof success === 'function' ? success(data) : success });
      return true;
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Request failed.' });
      return false;
    } finally { setBusy(false); }
  }

  return { busy, message, run };
}

export function Header({ title, children }: { title: string; children?: React.ReactNode }) {
  return <header className="adm-header"><h1>{title}</h1>{children}</header>;
}

export function Status({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  return <p role="status" className={message.ok ? 'adm-ok' : 'adm-error'}>{message.text}</p>;
}

export function LoadState({ loading, error }: { loading: boolean; error: string }) {
  if (error) return <p className="adm-error" role="alert">{error}</p>;
  if (loading) return <p className="adm-muted">Loading…</p>;
  return null;
}

export function Pager({ page, total, size, onPage }: { page: number; total: number; size: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;
  return (
    <div className="adm-pager">
      <button className="adm-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>Previous</button>
      <span className="adm-muted">Page {page + 1} of {pages} · {total} total</span>
      <button className="adm-btn" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warn' | 'bad'; children: React.ReactNode }) {
  return <span className={`adm-badge adm-${tone}`}>{children}</span>;
}

export function subscriptionTone(status?: string | null, suspended?: string | null): 'neutral' | 'good' | 'warn' | 'bad' {
  if (suspended) return 'bad';
  if (status === 'active') return 'good';
  if (status === 'trialing') return 'warn';
  return 'neutral';
}

/** Asks for the organization name before an action that is hard to undo. */
export function ConfirmByName({ name, label, danger, busy, extra, onConfirm }: {
  name: string; label: string; danger?: boolean; busy?: boolean;
  extra?: React.ReactNode; onConfirm: (typed: string, form: FormData) => void;
}) {
  const [typed, setTyped] = useState('');
  return (
    <form className="adm-form" onSubmit={e => { e.preventDefault(); onConfirm(typed, new FormData(e.currentTarget)); }}>
      {extra}
      <label>
        Type <strong>{name}</strong> to confirm
        <input value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" />
      </label>
      <button className={`adm-btn ${danger ? 'adm-danger' : 'adm-primary'}`} disabled={busy || typed !== name}>{label}</button>
    </form>
  );
}
