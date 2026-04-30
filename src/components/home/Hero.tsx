'use client';

import { useState, useEffect } from 'react';

const TRANSCRIPT = [
  { who: 'CALLER', text: '...so we tried two other tools and it just felt robotic.', side: 'them' },
  { who: 'BARSHA', text: 'Totally hear you. The robotic feel usually comes from one-shot replies.', side: 'me' },
  { who: 'BARSHA', text: 'May I ask — is the team five people, or closer to fifty?', side: 'me' },
  { who: 'CALLER', text: 'About thirty-eight, growing fast.', side: 'them' },
];

function AgentStage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % (TRANSCRIPT.length + 1)), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="agent-stage">
      <div className="orb-wrap">
        <div className="orb-halo"></div>
        <div className="orb">
          <div className="orb-rings">
            <div className="ring"></div><div className="ring"></div><div className="ring"></div>
          </div>
        </div>
      </div>

      <div className="call-card transcript">
        <div className="cc-head">
          <span className="live">live call</span>
          <span style={{ marginLeft: 'auto' }} className="mono">00:01:24</span>
        </div>
        {TRANSCRIPT.slice(0, Math.min(idx + 1, TRANSCRIPT.length)).map((b, i) => (
          <div key={i} className="cc-row">
            <span className={`cc-who ${b.side === 'them' ? 'them' : ''}`}>{b.who}</span>
            <span className="cc-text">{b.text}</span>
          </div>
        ))}
      </div>

      <div className="call-card metric">
        <div className="cc-head">
          <span style={{ color: 'var(--violet-deep)', fontWeight: 500 }}>Booked rate</span>
          <span style={{ marginLeft: 'auto' }} className="mono">7d</span>
        </div>
        <div className="metric-num">34<span className="pct">.6%</span></div>
        <div className="metric-label">vs. 11.2% human baseline</div>
        <div className="metric-spark">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">
            <span className="dot"></span>
            Now in private beta with 40+ revenue teams
            <span className="pill">v2.4 · Realtime</span>
          </span>
          <h1 className="hero-title serif">
            The voice of <span className="accent">your revenue,</span> answered before it rings.
          </h1>
          <p className="hero-sub">
            Barsha is a sales agent that calls, qualifies, books and follows up — with the warmth of your best rep and the patience of a system that never sleeps. Train it once. Watch your pipeline answer itself.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#demo">
              Hear Barsha in 30 seconds
              <span className="btn-pill-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </a>
            <a className="btn btn-ghost" href="#docs">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Read the architecture
            </a>
          </div>
          <div className="hero-meta">
            <span>SOC 2 Type II</span>
            <span className="sep"></span>
            <span>HIPAA-ready</span>
            <span className="sep"></span>
            <span className="mono" style={{ fontSize: 12 }}>p50 latency · 412ms</span>
          </div>
        </div>
        <AgentStage />
      </div>
    </section>
  );
}
