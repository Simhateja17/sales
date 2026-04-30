'use client';

import { useState, useEffect } from 'react';

const rows = [
  { name: 'Barsha', val: 412, max: 2400, us: false },
  { name: 'Vendor A', val: 1180, max: 2400, us: true },
  { name: 'Vendor B', val: 1640, max: 2400, us: true },
  { name: 'Human SDR', val: 720, max: 2400, us: true },
  { name: 'Vendor C', val: 2210, max: 2400, us: true },
];

export default function Latency() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="latency reveal">
          <div>
            <span className="kicker">Time-to-first-word</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}>The <em>only metric</em> a buyer feels.</h2>
            <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0, maxWidth: '36ch' }}>End-of-utterance to first audible word back. Measured weekly across our production fleet, vs. published vendor numbers and our internal human baseline.</p>
          </div>
          <div className="latency-bars">
            {rows.map((r, i) => (
              <div key={i} className={`lat-row ${r.us ? 'us' : ''}`}>
                <span className="name">{r.name}</span>
                <span className="bar"><i style={{ width: animated ? `${(r.val / r.max) * 100}%` : '0%' }}></i></span>
                <span className="num">{r.val}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
