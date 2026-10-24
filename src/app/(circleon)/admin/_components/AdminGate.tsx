'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { ADMIN_MFA_EVENT, AdminError, adminFetch, type AdminMe } from '@/lib/adminApi';
import { logout } from '@/lib/api';

type Gate = 'loading' | 'denied' | 'enroll' | 'verify' | 'ready' | 'error';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/support', label: 'Support' },
  { href: '/admin/billing', label: 'Billing approvals' },
  { href: '/admin/settings', label: 'Launch settings' },
  { href: '/admin/demos', label: 'Demo requests' },
  { href: '/admin/provider-credits', label: 'Provider credits' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [gate, setGate] = useState<Gate>('loading');
  const [me, setMe] = useState<AdminMe | null>(null);
  const [error, setError] = useState('');

  const check = useCallback(async () => {
    try {
      const data = await adminFetch<AdminMe>('/me');
      setMe(data);
      setGate(!data.mfa.enrolled ? 'enroll' : data.mfa.fresh ? 'ready' : 'verify');
    } catch (e) {
      if (e instanceof AdminError && e.status === 401) {
        router.replace(`/admin/login?returnTo=${encodeURIComponent(pathname || '/admin')}`);
      } else if (e instanceof AdminError && e.status === 403) {
        setGate('denied');
      } else {
        setError(e instanceof Error ? e.message : 'Could not reach the server.');
        setGate('error');
      }
    }
  }, [pathname, router]);

  const isLogin = pathname === '/admin/login';
  useEffect(() => { if (!isLogin) check(); }, [check, isLogin]);

  // Any page call that hits an expired two-factor session drops back to the gate.
  useEffect(() => {
    const onExpired = () => setGate(current => (current === 'ready' ? 'verify' : current));
    window.addEventListener(ADMIN_MFA_EVENT, onExpired);
    return () => window.removeEventListener(ADMIN_MFA_EVENT, onExpired);
  }, []);

  async function signOut() {
    await logout().catch(() => undefined);
    router.replace('/admin/login');
  }

  if (isLogin) return <>{children}</>;
  if (gate === 'loading') return <div className="adm-center"><p className="adm-muted">Checking access…</p></div>;
  if (gate === 'denied') return (
    <div className="adm-center">
      <div className="adm-card adm-narrow">
        <h1>Not available</h1>
        <p className="adm-muted">This area is restricted to CircleOn staff.</p>
        <Link className="adm-btn" href="/home">Back to dashboard</Link>
      </div>
    </div>
  );
  if (gate === 'error') return (
    <div className="adm-center">
      <div className="adm-card adm-narrow">
        <h1>Something went wrong</h1>
        <p className="adm-error">{error}</p>
        <button className="adm-btn" onClick={() => { setGate('loading'); check(); }}>Try again</button>
      </div>
    </div>
  );
  if (gate === 'enroll' || gate === 'verify') return <MfaStep mode={gate} email={me?.user.email} onDone={check} onSignOut={signOut} />;

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">CircleOn <span>admin</span></div>
        <nav>
          {NAV.map(item => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`adm-nav${active ? ' active' : ''}`}>{item.label}</Link>;
          })}
        </nav>
        <div className="adm-side-foot">
          <p className="adm-muted adm-small">{me?.user.email}</p>
          <Link href="/home" className="adm-link adm-small">Customer dashboard</Link>
          <button className="adm-link adm-small" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

function MfaStep({ mode, email, onDone, onSignOut }: { mode: 'enroll' | 'verify'; email?: string; onDone: () => void; onSignOut: () => void }) {
  const [enrollment, setEnrollment] = useState<{ factor_id: string; qr_code: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function startEnrollment() {
    setBusy(true); setError('');
    try { setEnrollment(await adminFetch('/mfa/enroll', 'POST')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not start setup.'); }
    finally { setBusy(false); }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await adminFetch('/mfa/verify', 'POST', { code, factor_id: enrollment?.factor_id });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed.');
      setCode('');
    } finally { setBusy(false); }
  }

  const needsQr = mode === 'enroll' && !enrollment;
  return (
    <div className="adm-center">
      <div className="adm-card adm-narrow">
        <p className="adm-eyebrow">CircleOn admin</p>
        <h1>{mode === 'enroll' ? 'Set up two-factor sign-in' : 'Verify it’s you'}</h1>
        <p className="adm-muted">
          {mode === 'enroll'
            ? 'Admin access needs an authenticator app (Google Authenticator, 1Password, Authy). You only set this up once.'
            : `Enter the 6-digit code from your authenticator app. Admin sessions last 12 hours.`}
        </p>
        {email ? <p className="adm-small adm-muted">Signed in as {email}</p> : null}
        {needsQr ? (
          <button className="adm-btn adm-primary" disabled={busy} onClick={startEnrollment}>{busy ? 'Starting…' : 'Set up authenticator'}</button>
        ) : (
          <>
            {enrollment ? (
              <div className="adm-qr">
                {/* The raw GoTrue API returns bare SVG markup; only supabase-js wraps it in a data URI. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc(enrollment.qr_code)} alt="Authenticator QR code" width={180} height={180} />
                <p className="adm-small adm-muted">Can’t scan? Enter this key: <code>{enrollment.secret}</code></p>
              </div>
            ) : null}
            <form onSubmit={verify} className="adm-form">
              <label>
                6-digit code
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus required pattern="\d{6}" />
              </label>
              <button className="adm-btn adm-primary" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify'}</button>
            </form>
          </>
        )}
        {error ? <p className="adm-error" role="alert">{error}</p> : null}
        <button className="adm-link adm-small" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}

function qrSrc(qr: string) {
  return qr.startsWith('data:') ? qr : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
}
