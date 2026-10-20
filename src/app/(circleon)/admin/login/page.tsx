'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Staff sign in here rather than through the customer login, so admin access
// never depends on a customer workspace or Google sign-in. The authenticator
// step that follows is enforced by the admin gate and every admin endpoint.
export default function AdminLoginPage() {
  return <Suspense fallback={null}><AdminLogin /></Suspense>;
}

function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function post(path: string, body: unknown) {
    const res = await fetch(`${API_URL}${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      if (!sent) {
        await post('/api/auth/otp/request', { email, intent: 'login' });
        setSent(true);
      } else {
        await post('/api/auth/otp/verify', { email, token: code });
        const returnTo = searchParams.get('returnTo');
        router.replace(returnTo && returnTo.startsWith('/admin') && returnTo !== '/admin/login' ? returnTo : '/admin');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally { setBusy(false); }
  }

  return (
    <div className="adm-center">
      <form className="adm-card adm-narrow adm-form" onSubmit={submit}>
        <p className="adm-eyebrow">CircleOn admin</p>
        <h1>Staff sign in</h1>
        <p className="adm-muted">{sent ? `Enter the code we emailed to ${email}. You will confirm with your authenticator next.` : 'Use your staff email. Customer accounts cannot open the admin panel.'}</p>
        {!sent ? (
          <label>Staff email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus required /></label>
        ) : (
          <label>Email code<input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" autoComplete="one-time-code" autoFocus required pattern="\d{6,10}" /></label>
        )}
        <button className="adm-btn adm-primary" disabled={busy}>{busy ? 'Please wait…' : sent ? 'Verify code' : 'Email me a code'}</button>
        {sent ? <button type="button" className="adm-link adm-small" onClick={() => { setSent(false); setCode(''); }}>Use a different email</button> : null}
        {error ? <p className="adm-error" role="alert">{error}</p> : null}
      </form>
    </div>
  );
}
