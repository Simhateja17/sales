'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthShell, { APPLE_ICON, ARROW, GOOGLE_ICON } from '../_auth/AuthShell';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const requestOtp = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!fullName.trim() || !businessName.trim()) {
      setError('Full name and business name are required.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/otp/request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'signup', fullName, businessName, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not send a code.');
      } else {
        setOtpRequested(true);
        setSuccess(data.message || 'Check your email for a verification code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setSuccess('');

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
        router.push('/plan-select' + window.location.search);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <AuthShell variant="signup">
      <div className="au-eyebrow">Account setup</div>
      <h2 className="au-h2">Create your workspace</h2>
      <p className="au-sub">Set up your account so your team can start building and launching your AI sales agent.</p>
      <div className="au-stack">
        <button className="au-social" type="button" onClick={handleGoogleSignup}>{GOOGLE_ICON}Continue with Google</button>
        <button className="au-social" type="button">{APPLE_ICON}Continue with Apple</button>
      </div>
      <div className="au-or">or sign up with email</div>
      {error ? <div className="au-error" role="alert">{error}</div> : null}
      {success ? <div className="au-success" role="status">{success}</div> : null}
      <form className="au-form" onSubmit={event => { event.preventDefault(); if (!loading) (otpRequested ? verifyOtp : requestOtp)(); }}>
        <div className="au-row">
          <label className="au-field">Full name<input type="text" autoComplete="name" placeholder="Jane Tan" value={fullName} disabled={otpRequested} onChange={e => setFullName(e.target.value)} /></label>
          <label className="au-field">Business name<input type="text" autoComplete="organization" placeholder="Acme Pte. Ltd." value={businessName} disabled={otpRequested} onChange={e => setBusinessName(e.target.value)} /></label>
        </div>
        <label className="au-field">Work email<input type="email" autoComplete="email" placeholder="jane@acme.com.sg" value={email} disabled={otpRequested} onChange={e => setEmail(e.target.value)} /></label>
        {isPersonalEmail(email) && !otpRequested ? (
          <p className="signup-email-note">Free trials need a company email. You can still sign up with this address, but the trial will wait for a quick manual approval.</p>
        ) : null}
        <label className="au-field">Phone number (optional)<input type="tel" autoComplete="tel" placeholder="+65 8123 4567" value={phone} disabled={otpRequested} onChange={e => setPhone(e.target.value)} /></label>
        {otpRequested ? (
          <label className="au-field">Verification code
            <input className="au-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="Enter the code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </label>
        ) : null}
        <label className="au-check">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</span>
        </label>
        <button className="au-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : otpRequested ? 'Verify and create account' : 'Email me a code'}
          {!loading ? ARROW : null}
        </button>
        {otpRequested ? <button className="au-link" type="button" onClick={() => { setOtpRequested(false); setOtp(''); setError(''); setSuccess(''); }}>← Change account details</button> : null}
      </form>
      <p className="au-foot">Already have an account? <Link href="/login">Log in</Link></p>
    </AuthShell>
  );
}

// Same list as WEBMAIL in backend/lib/pricing.js; the
// backend makes the real decision at checkout.
const PERSONAL_DOMAINS = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'mail.com']);
function isPersonalEmail(email: string) {
  const domain = email.trim().toLowerCase().split('@')[1];
  return Boolean(domain && PERSONAL_DOMAINS.has(domain));
}
