'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="screen active" id="signup">
      <div className="start-card">
        <div className="start-top">
          <div className="start-kicker"><span className="ob-cat-dot" />Account Setup</div>
          <div className="start-title">Create your Barsha AI workspace</div>
          <p className="start-sub">Set up your account so your team can start building and launching your sales agent.</p>
        </div>
        <div className="start-body">
          <div className="social-stack">
            <button className="social-btn">
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M22 12.22c0-.78-.07-1.53-.2-2.25H12v4.26h5.6a4.79 4.79 0 0 1-2.08 3.14v2.6h3.36C20.85 18.12 22 15.43 22 12.22z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.36-2.6c-.93.62-2.12.99-3.27.99-2.52 0-4.66-1.7-5.42-3.98H3.11v2.68A10 10 0 0 0 12 22z" fill="#34A853"/>
                <path d="M6.58 13.98A5.99 5.99 0 0 1 6.28 12c0-.69.12-1.37.3-1.98V7.34H3.11A10 10 0 0 0 2 12c0 1.61.38 3.13 1.11 4.66l3.47-2.68z" fill="#FBBC05"/>
                <path d="M12 6.04c1.47 0 2.78.5 3.81 1.5l2.86-2.86C16.97 3.06 14.7 2 12 2a10 10 0 0 0-8.89 5.34l3.47 2.68c.76-2.28 2.9-3.98 5.42-3.98z" fill="#EA4335"/>
              </svg>
              Sign up with Google Mail
            </button>
            <button className="social-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                <path d="M16.37 1.43c0 1.14-.46 2.23-1.25 3.04-.8.8-1.87 1.23-2.99 1.19-.02-1.12.42-2.25 1.22-3.02.8-.8 1.95-1.27 3.02-1.21zM20.5 17.1c-.6 1.34-.9 1.94-1.67 3.1-1.08 1.62-2.6 3.64-4.49 3.66-1.68.02-2.12-1.1-4.4-1.09-2.27 0-2.74 1.11-4.42 1.1-1.88-.02-3.31-1.84-4.4-3.46C-2.1 15.4.18 7.78 5.6 7.45c1.74-.1 3.38 1.18 4.44 1.18 1.04 0 2.98-1.45 5.03-1.24.85.03 3.22.34 4.75 2.6-4.17 2.28-3.5 8.2.68 7.11z"/>
              </svg>
              Sign up with Apple
            </button>
          </div>
          <div className="or-row">or sign up with email</div>
          <div className="start-grid">
            <input className="ob-inp" type="text" placeholder="Your full name" />
            <input className="ob-inp" type="text" placeholder="Business name" />
            <input className="ob-inp" type="email" placeholder="Work email" />
            <input className="ob-inp" type="password" placeholder="Create password" />
          </div>
          <div style={{ marginTop: 12 }}>
            <input className="ob-inp" type="text" placeholder="Phone number (optional)" />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input type="checkbox" className="cb" defaultChecked style={{ marginTop: 2 }} />
            <span>I agree to the Terms and Privacy Policy, and I consent to communication regarding account setup.</span>
          </div>
          <div className="start-foot">
            Already have an account?{' '}
            <Link href="/login">Log in</Link>
          </div>
        </div>
        <div className="start-nav">
          <button className="btn-back" onClick={() => router.push('/')}>← Back</button>
          <button className="btn-next" onClick={() => router.push('/plan-select')}>
            Continue{' '}
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
