'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="screen active" id="login">
      <div className="start-card" style={{ maxWidth: 560 }}>
        <div className="start-top">
          <div className="start-kicker"><span className="ob-cat-dot" />Welcome Back</div>
          <div className="start-title">Log in to Barsha AI</div>
          <p className="start-sub">Continue where you left off and manage your sales agents.</p>
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
              Continue with Google Mail
            </button>
          </div>
          <div className="or-row">or log in with email</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="ob-inp" type="email" placeholder="Work email" />
            <input className="ob-inp" type="password" placeholder="Password" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ fontSize: 12, color: 'var(--purple)', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
          </div>
          <div className="start-foot">
            New to Barsha AI?{' '}
            <Link href="/signup">Create account</Link>
          </div>
        </div>
        <div className="start-nav">
          <button className="btn-back" onClick={() => router.push('/signup')}>← Back</button>
          <button className="btn-next" onClick={() => router.push('/plan-select')}>
            Log In{' '}
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
