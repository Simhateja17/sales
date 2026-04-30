'use client';

import { useState, useEffect } from 'react';

type CardRow = [string, string, string, string];
type Step = {
  time: string;
  title: string;
  em: string;
  body: string;
  card: 'live' | { title: string; rows: CardRow[] };
};

const STEPS: Step[] = [
  { time: 'Day 0 · 2:00 PM', title: 'Connect your stack', em: 'in 4 clicks',
    body: 'Sign in with HubSpot, Salesforce, Twilio, or whatever you already pay for. We mirror your existing fields — no schema work, no data migration, no shadow CRM.',
    card: { title: 'Connections', rows: [
      ['⌘','HubSpot','Connected','synced 1.2M contacts'],
      ['◍','Twilio','Connected','3 numbers'],
      ['⏵','Calendly','Connected','priya@barsha.ai'],
      ['◐','Slack','Connected','#sales-help'],
    ]} },
  { time: 'Day 0 · 2:18 PM', title: 'Drop in your best calls', em: 'we do the listening',
    body: "Upload 10 hours of recorded calls — your ICP, your discovery framework, your objection patterns. Barsha extracts the playbook so you don't have to write it down.",
    card: { title: 'Training set', rows: [
      ['♪','124 inbound calls','Processed','avg 14m 22s'],
      ['♪','86 outbound calls','Processed','avg 11m 04s'],
      ['✶','Discovery framework','Inferred','7 stages detected'],
      ['◇','Top objections','Inferred','12 patterns'],
    ]} },
  { time: 'Day 0 · 2:54 PM', title: 'Write guardrails in plain English', em: 'not flow charts',
    body: 'A single markdown file. What Barsha can offer, what it must escalate, what it should never say. Versioned in your repo. Reviewed in your existing PR process.',
    card: { title: 'guardrails.md', rows: [
      ['📜','Discount cap','15% max','approved by Priya'],
      ['📜','Demo bookings','Always offer','calendar-aware'],
      ['📜','Pricing questions','Quote ranges only','escalate to AE'],
      ['📜','Hand-off triggers','3 conditions','to #sales-help'],
    ]} },
  { time: 'Day 0 · 3:22 PM', title: 'Audition the voice', em: 'with a number you choose',
    body: 'Pick from 26 base voices, or clone your top performer. Place a test call to your own phone. Iterate on warmth, pace, and depth until it sounds like a person, not a product.',
    card: 'live' },
  { time: 'Day 0 · 4:00 PM', title: 'Go live, quietly', em: '5% of inbound first',
    body: "Start with a slice — 5% of inbound, or one outbound list. Watch every call live. Pause with one click. Promote to 100% when you're ready, not when we say so.",
    card: { title: 'Rollout · live', rows: [
      ['⏵','Inbound traffic','5%','24 calls today'],
      ['⏵','Outbound list','Pilot · 200','Series-B SaaS'],
      ['◈','Hand-off rate','3.4%','within target'],
      ['✶','Live observers','You + 2','watching now'],
    ]} },
  { time: 'Day 1 · 9:00 AM', title: 'Read the morning summary', em: 'in your inbox',
    body: "Yesterday's calls, sorted by intent. Pricing questions. Demo requests. Churn risks. Hand-raises. Each linked to the recording, the transcript, and the CRM record Barsha already updated.",
    card: { title: 'Morning brief · Day 1', rows: [
      ['📩','Calls handled','41','vs. 12 baseline'],
      ['🎯','Demos booked','14','+167% wk-over-wk'],
      ['⚠','Churn risk flagged','2','escalated to CSM'],
      ['💬','Hand-offs to humans','3','within SLA'],
    ]} },
  { time: 'Week 1', title: 'Tune what you hear', em: 'one diff at a time',
    body: 'Every guardrail change is a pull request. Every voice tweak is a versioned diff. A/B two configurations against each other on live traffic — promote the winner, archive the loser.',
    card: { title: 'Active experiments', rows: [
      ['A/B','Warmer intro','+8.2% engaged','sig. p < 0.04'],
      ['A/B','Tighter qualifier','+12.6% booked','sig. p < 0.01'],
      ['A/B','Slower pace · DE','+4.1% rapport','running'],
      ['A/B','Earlier ask · NL','-2.3% engaged','will revert'],
    ]} },
  { time: 'Quarter 1', title: 'Compound', em: 'quietly',
    body: "Every call makes the next call better. Patterns that worked are reinforced. Patterns that didn't are quietly retired. Your top rep's instincts, distributed across every conversation your company has.",
    card: { title: 'Q1 outcomes', rows: [
      ['📈','Pipeline generated','$2.4M','from 14 reps'],
      ['📈','Booked meetings','1,847','+340% YoY'],
      ['📈','Cost per meeting','$4.20','was $96'],
      ['📈','Rep promotions','3 SDRs → AEs','redeployed up'],
    ]} },
];

function LiveCallCard() {
  return (
    <div className="live-card">
      <div className="lc-head">
        <span className="av"></span>
        <div>
          <div className="who serif">Test call · You</div>
          <div className="who-sub">+1 (415) 555 · 0140</div>
        </div>
        <span className="timer">
          <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'oklch(0.65 0.18 145)',marginRight:6,boxShadow:'0 0 6px oklch(0.7 0.2 145)'}}></span>
          00:00:18
        </span>
      </div>
      <div className="lc-bubble me">
        <div className="who">BARSHA · MAYA</div>
        <div className="text">Hi, this is Maya — quick test call from Barsha. How does the voice sound on your end?</div>
      </div>
      <div className="lc-bubble">
        <div className="who">YOU</div>
        <div className="text">A little fast. Slow it down maybe ten percent.</div>
      </div>
      <div className="lc-bubble me">
        <div className="who">BARSHA · MAYA</div>
        <div className="text">Done. How&apos;s this — better?</div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt((e.target as HTMLElement).dataset.idx || '0', 10);
          setActive(idx);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    document.querySelectorAll('.tl-step').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="timeline">
          {STEPS.map((s, i) => (
            <div key={i} data-idx={i} className={`tl-step reveal ${active === i ? 'active' : ''}`}>
              <div className="tl-dot">{String(i + 1).padStart(2, '0')}</div>
              <div className="tl-time"><span className="pip"></span>{s.time}</div>
              <h3>{s.title}, <em>{s.em}.</em></h3>
              <p>{s.body}</p>
              {s.card === 'live' ? <LiveCallCard /> : (
                <div className="tl-card">
                  <div className="ttl">{s.card.title}</div>
                  {s.card.rows.map((r, ri) => (
                    <div key={ri} className="row">
                      <span className="ico">{r[0]}</span>
                      <span className="lbl">{r[1]}</span>
                      <span className="pill">{r[2]}</span>
                      <span className="val">{r[3]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
