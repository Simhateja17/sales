'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { getWorkspace } from '@/lib/api';
import AuthShell, { ARROW, GOOGLE_ICON } from '../_auth/AuthShell';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState(searchParams.get('reason') === 'session' ? 'Your session ended. Please sign in again.' : '');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setError('');

    if (!email) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/otp/request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'login' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not send a code.');
      } else {
        setOtpRequested(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');

    if (!/^\d{6,10}$/.test(otp)) {
      setError('Enter the verification code from your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'The code is invalid or expired.');
      } else {
        let state;
        try {
          state = await getWorkspace();
        } catch (workspaceError) {
          const message = workspaceError instanceof Error ? workspaceError.message : '';
          setError(
            message === 'Authentication required'
              ? 'The code was accepted, but the browser did not store the session cookie. Please try again after the backend cookie configuration is updated.'
              : message || 'Signed in, but your workspace could not be loaded.',
          );
          return;
        }

        const returnTo = searchParams.get('returnTo');
        if (!state.workspace.plan || !state.subscriptionActive) {
          router.push('/plan-select');
        } else if (!state.workspace.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push(returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <AuthShell variant="login">
      <div className="au-eyebrow">Log in</div>
      <h2 className="au-h2">Log in to CircleOn</h2>
      <div className="au-stack">
        <button className="au-social" type="button" onClick={handleGoogleLogin}>{GOOGLE_ICON}Continue with Google</button>
      </div>
      <div className="au-or">or log in with email</div>
      {error ? <div className="au-error" role="alert">{error}</div> : null}
      <form className="au-form" onSubmit={event => { event.preventDefault(); if (!loading) (otpRequested ? verifyOtp : requestOtp)(); }}>
        <label className="au-field">Work email
          <input type="email" autoComplete="email" placeholder="jane@acme.com.sg" value={email} disabled={otpRequested} onChange={e => setEmail(e.target.value)} />
        </label>
        {otpRequested ? (
          <label className="au-field">Verification code
            <input className="au-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="Enter the code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </label>
        ) : null}
        <button className="au-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : otpRequested ? 'Verify and log in' : 'Email me a code'}
          {!loading ? ARROW : null}
        </button>
        {otpRequested ? <button className="au-link" type="button" onClick={() => { setOtpRequested(false); setOtp(''); setError(''); }}>← Use a different email</button> : null}
      </form>
      <p className="au-foot">New to CircleOn? <Link href="/signup">Start your 7-day free trial</Link></p>
    </AuthShell>
  );
}
