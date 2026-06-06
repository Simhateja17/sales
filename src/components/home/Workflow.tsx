'use client';

import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { title: 'Connect your stack', body: 'Two clicks for HubSpot, Salesforce, Twilio, Calendly. We mirror your existing fields — no schema work.' },
  { title: "Train on your team's best calls", body: 'Drop in 10 hours of recordings. Barsha learns your discovery framework, objection patterns, and tone.' },
  { title: 'Set guardrails, not scripts', body: "Define what Barsha can offer, escalate, or book — in plain English. No flow charts, no decision trees." },
  { title: 'Watch it answer the phone', body: 'Inbound, outbound, and follow-ups go live the same day. Every call writes back to CRM in under three seconds.' },
];

const nodes = [
  { id: 0, x: '6%', y: '8%', icon: '⌘', label: 'HubSpot' },
  { id: 0, x: '52%', y: '6%', icon: '◍', label: 'Twilio' },
  { id: 1, x: '6%', y: '58%', icon: '♪', label: '124 recordings' },
  { id: 2, x: '61%', y: '42%', icon: '✶', label: 'Guardrails.md' },
  { id: 3, x: '32%', y: '78%', icon: '⏵', label: 'Live · 8 calls' },
];

function WorkflowVisual({ active }: { active: number }) {
  return (
    <div className="wf-visual reveal">
      <div className="wf-line" style={{ top: '20%', left: '20%', width: '40%', transform: 'rotate(8deg)' }}></div>
      <div className="wf-line" style={{ top: '52%', left: '24%', width: '40%', transform: 'rotate(-12deg)' }}></div>
      <div className="wf-line" style={{ top: '68%', left: '20%', width: '32%', transform: 'rotate(28deg)' }}></div>
      {nodes.map((n, i) => (
        <div key={i} className={`wf-node ${active === n.id ? 'active' : ''}`} style={{ left: n.x, top: n.y }}>
          <span className="nd-icon">{n.icon}</span>
          <span>{n.label}</span>
        </div>
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 110, height: 110, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, oklch(0.95 0.05 85 / 0.6), transparent 50%), radial-gradient(circle at 60% 70%, oklch(0.55 0.2 295), oklch(0.32 0.14 290))',
        boxShadow: 'inset 0 -10px 30px oklch(0.18 0.08 290 / 0.6), inset 0 10px 30px oklch(1 0 0 / 0.2), 0 20px 50px -20px oklch(0.3 0.18 295 / 0.5)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300,
        color: 'oklch(0.95 0.02 295)', fontSize: 22, letterSpacing: '-0.02em',
      }}>
        Barsha
      </div>
    </div>
  );
}

export default function Workflow() {
  const [active, setActive] = useState(0);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 980px)').matches;
    if (isDesktop) {
      const handleScroll = () => {
        const el = outerRef.current;
        if (!el) return;
        const scrolled = -el.getBoundingClientRect().top;
        const scrollable = el.offsetHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const progress = Math.max(0, Math.min(1, scrolled / scrollable));
        setActive(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)));
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const t = setInterval(() => setActive(a => (a + 1) % STEPS.length), 4000);
      return () => clearInterval(t);
    }
  }, []);

  return (
    <div ref={outerRef} className="wf-scroll-outer" id="workflow">
      <section className="section wf-scroll-sticky">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">How it works</span>
            <h2 className="section-title">Live in <em>a Tuesday afternoon</em>, not a quarter.</h2>
            <p className="section-sub">No flow-chart tool. No prompt engineering team. Four steps from signed contract to first booked meeting.</p>
          </div>
          <div className="workflow">
            <div className="steps reveal">
              {STEPS.map((s, i) => (
                <div key={i} className={`step ${active === i ? 'active' : ''}`}>
                  <span className="marker"></span>
                  <div className="step-head">
                    <span className="step-num">0{i + 1}</span>
                    <h4 className="serif">{s.title}</h4>
                  </div>
                  <div className="step-body"><p>{s.body}</p></div>
                </div>
              ))}
            </div>
            <WorkflowVisual active={active} />
          </div>
        </div>
      </section>
    </div>
  );
}
