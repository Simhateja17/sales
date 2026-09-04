'use client';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="screen active" id="welcome">
      <div className="wlc-inner">
        <div className="wlc-mark">C</div>
        <div className="wlc-tag">✦ CircleOn AI · Singapore</div>
        <h1 className="wlc-h1">
          Your business deserves a <em>brilliant</em> sales team.
        </h1>
        <p className="wlc-sub">
          Answer a few simple questions about your business. We&apos;ll build you an AI agent
          that finds leads, makes calls, and books meetings —{' '}
          <strong>no technical knowledge needed.</strong>
        </p>
        <Link
          href="/signup"
          className="btn-primary"
          style={{ margin: '0 auto', display: 'flex', padding: '14px 36px', fontSize: '15px' }}
        >
          Get Started{' '}
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <div className="wlc-trust">
          <div className="trust-item"><span className="trust-dot" />No technical knowledge needed</div>
          <div className="trust-item"><span className="trust-dot" />Ready in 10 minutes</div>
          <div className="trust-item"><span className="trust-dot" />PDPA Compliant</div>
        </div>
      </div>
    </div>
  );
}
