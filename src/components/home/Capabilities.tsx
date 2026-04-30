'use client';

import { useState, useEffect } from 'react';

const CAPS = [
  { icon: '◐', title: 'Sub-second latency', body: 'A custom audio pipeline keeps end-to-end response under 500ms — the difference between feeling heard and feeling on hold.' },
  { icon: '◇', title: 'Plays well with your CRM', body: 'Salesforce, HubSpot, Attio, Pipedrive. Every call lands as structured fields, not a transcript dump.' },
  { icon: '◈', title: 'Knows when to stop', body: 'Compliance-grade DNC, opt-out detection, and automatic suppression — handled before legal has to ask.' },
];

function WaveformLive() {
  const [bars, setBars] = useState(() => Array.from({ length: 36 }, () => Math.random() * 0.4 + 0.2));
  useEffect(() => {
    const t = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const center = 18;
        const dist = Math.abs(i - center);
        const base = Math.max(0.15, 0.85 - dist * 0.04);
        return base * (0.55 + Math.random() * 0.45);
      }));
    }, 110);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="waveform">
      {bars.map((h, i) => (
        <div key={i} className="wbar" style={{ height: `${h * 100}%` }}></div>
      ))}
    </div>
  );
}

export default function Capabilities() {
  return (
    <section className="section" id="capabilities">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">The platform</span>
          <h2 className="section-title">A sales floor that <em>composes itself</em>, conversation by conversation.</h2>
          <p className="section-sub">Six pieces working in concert: voice, reasoning, retrieval, routing, telephony, and observability. We obsess over the seams so your team doesn&apos;t have to.</p>
        </div>

        <div className="cap-grid">
          <article className="cap wide reveal">
            <div className="cap-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1v16M3 5v8M15 5v8M6 3v12M12 3v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <h3>Voice that doesn&apos;t tell on itself.</h3>
            <p>Twenty-six base voices, each tunable across warmth, pace, and cadence. Barsha mirrors your buyer — calmer for technical calls, brighter for inbound.</p>
            <div className="cap-feature"><WaveformLive /></div>
          </article>

          {CAPS.map((c, i) => (
            <article key={i} className="cap reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="cap-icon">
                <span style={{ fontSize: 18, lineHeight: 1 }}>{c.icon}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}

          <article className="cap reveal">
            <div className="cap-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M9 3v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <h3>Memory that remembers <em style={{ fontStyle: 'italic', color: 'var(--violet-deep)' }}>them</em>.</h3>
            <p>Every call is grounded in your last seven touches. Barsha picks up where the relationship left off — never the script.</p>
          </article>

          <article className="cap reveal">
            <div className="cap-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h14M9 2v14" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/></svg>
            </div>
            <h3>Observability, not vibes.</h3>
            <p>Every utterance is replayable, taggable, and exportable. Sentiment, objections, and silence — measured per second, not per call.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
