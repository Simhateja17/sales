'use client';

import { useState, useEffect } from 'react';

type Bubble = { who: string; text: string; side: 'me' | 'them' };
type Scenario = { label: string; timer: string; who: string; sub: string; bubbles: Bubble[] };

const SCENARIOS: Record<string, Scenario> = {
  inbound: {
    label: 'Inbound qualifier',
    timer: 'Ringing → Live · 00:00:42',
    who: 'Maya · 24, founder',
    sub: 'Calling about Series A pricing',
    bubbles: [
      { who: 'BARSHA', text: 'Barsha here — congrats on the round. I saw the announcement this morning.', side: 'me' },
      { who: 'CALLER', text: "Oh — wow, thanks. We're heads-down on hiring, honestly.", side: 'them' },
      { who: 'BARSHA', text: 'I bet. Quick question while I have you — are sales hires the priority, or product?', side: 'me' },
      { who: 'CALLER', text: 'Both, but probably product first.', side: 'them' },
      { who: 'BARSHA', text: "Got it. I'll put 20 minutes on Priya's calendar Thursday morning — she ran product hiring at Linear.", side: 'me' },
    ],
  },
  outbound: {
    label: 'Outbound discovery',
    timer: 'Outbound · 00:01:08',
    who: 'David · VP Sales',
    sub: 'Series B SaaS · 80 reps',
    bubbles: [
      { who: 'BARSHA', text: 'Hi David, this is Barsha calling on behalf of Northwind. Is now an okay moment for two minutes?', side: 'me' },
      { who: 'CALLER', text: 'I have a hard stop in five.', side: 'them' },
      { who: 'BARSHA', text: "Even better — I'll be quick. Your team posted four AE roles this month. Are those backfills or growth?", side: 'me' },
      { who: 'CALLER', text: 'Mostly growth, honestly.', side: 'them' },
      { who: 'BARSHA', text: 'Then this is worth ten minutes next week. Tuesday 2pm or Wednesday 10am?', side: 'me' },
    ],
  },
  followup: {
    label: 'Post-call follow-up',
    timer: 'Voicemail + SMS · 00:00:18',
    who: 'Reema · Eng leader',
    sub: 'Missed two prior calls',
    bubbles: [
      { who: 'BARSHA', text: 'Hey Reema — Barsha again. No pressure, just confirming our 3pm Thursday still works on your end.', side: 'me' },
      { who: 'BARSHA', text: '(SMS) Sending the agenda + a 90-second loom so you have context before we talk.', side: 'me' },
      { who: 'CALLER', text: '(reply) Thursday is great. Loom was actually helpful.', side: 'them' },
      { who: 'BARSHA', text: "Wonderful. I'll come ready to talk through the migration path you mentioned.", side: 'me' },
    ],
  },
  renewal: {
    label: 'Renewal save',
    timer: 'Inbound · 00:02:16',
    who: 'Jonas · Customer',
    sub: 'Considering churn · Tier-3',
    bubbles: [
      { who: 'CALLER', text: "We're probably going to wind it down next month.", side: 'them' },
      { who: 'BARSHA', text: "Understood. Before I process anything — what changed? You were running 14 campaigns in March.", side: 'me' },
      { who: 'CALLER', text: 'Honestly, the team that owned it left.', side: 'them' },
      { who: 'BARSHA', text: "That's fixable. We have a managed onboarding for teams in transition — paid by us, not you. Worth 15 minutes?", side: 'me' },
    ],
  },
};

export default function VoiceDemo() {
  const [active, setActive] = useState('inbound');
  const [shown, setShown] = useState(0);
  const data = SCENARIOS[active];

  useEffect(() => {
    setShown(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i > data.bubbles.length) { clearInterval(t); return; }
      setShown(i);
    }, 1100);
    return () => clearInterval(t);
  }, [active]);

  return (
    <section className="section" id="voices">
      <div className="container">
        <div className="demo reveal">
          <div className="demo-grid">
            <div>
              <span className="kicker" style={{ color: 'oklch(0.85 0.06 85)' }}>Hear it for yourself</span>
              <h2>Four scenarios. <em>One agent.</em> Zero hand-offs.</h2>
              <p>Pick a moment from the buyer journey. Barsha runs the full playbook — qualifying, scheduling, pushing back gracefully, and writing back to your CRM the second the call ends.</p>
              <div className="scenarios">
                {Object.entries(SCENARIOS).map(([k, v]) => (
                  <button
                    key={k}
                    className={`scenario-chip ${active === k ? 'active' : ''}`}
                    onClick={() => setActive(k)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="phone">
              <div className="phone-head">
                <div className="avatar"></div>
                <div>
                  <div className="who">{data.who}</div>
                  <div className="who-sub">{data.sub}</div>
                </div>
                <div className="timer"><span className="pulse"></span>{data.timer}</div>
              </div>
              <div className="transcript-list">
                {data.bubbles.slice(0, shown).map((b, i) => (
                  <div key={`${active}-${i}`} className={`bubble ${b.side === 'me' ? 'me' : ''}`}>
                    <div className="b-who">{b.who}</div>
                    <div className="b-text">{b.text}</div>
                  </div>
                ))}
                {shown < data.bubbles.length && shown > 0 && (
                  <div className="bubble">
                    <div className="b-who">{data.bubbles[shown]?.who}</div>
                    <div className="b-text">
                      <div className="typing"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
