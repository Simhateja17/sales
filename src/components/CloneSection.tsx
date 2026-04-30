'use client';

import { useState, useEffect } from 'react';

function PlayerWave() {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 64 }, () => 0.3)
  );

  useEffect(() => {
    const t = setInterval(() => {
      setBars(
        Array.from({ length: 64 }, (_, i) => {
          const center = 32;
          const dist = Math.abs(i - center);
          const base = Math.max(0.2, 0.95 - dist * 0.022);
          return base * (0.55 + Math.random() * 0.45);
        })
      );
    }, 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pm-wave">
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

export default function CloneSection() {
  const [progress, setProgress] = useState(34);

  useEffect(() => {
    const t = setInterval(
      () => setProgress((p) => (p >= 88 ? 22 : p + 0.4)),
      80
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="clone reveal">
          <div className="clone-grid">
            {/* Left: copy */}
            <div>
              <span className="kicker" style={{ color: 'oklch(0.85 0.06 85)' }}>
                Voice cloning
              </span>
              <h2>
                Sound like <em>your top rep,</em> in every language they don&apos;t speak.
              </h2>
              <p>
                Upload 90 seconds of clean audio. Barsha analyzes prosody, breath, and emotional
                range — then synthesizes the same voice in 31 languages, with regional accent
                control. Consent-locked, watermarked, and revocable in one click.
              </p>
              <div className="clone-steps">
                <div className="clone-step">
                  <span className="num">01</span>
                  <span className="body">
                    <span className="t">Capture 90 seconds of consented audio</span>
                    <span className="d">In-app recorder, or upload an existing call.</span>
                  </span>
                </div>
                <div className="clone-step">
                  <span className="num">02</span>
                  <span className="body">
                    <span className="t">Approve the synthesized preview</span>
                    <span className="d">A/B against the original, side-by-side.</span>
                  </span>
                </div>
                <div className="clone-step">
                  <span className="num">03</span>
                  <span className="body">
                    <span className="t">Deploy to any agent, any language</span>
                    <span className="d">Including languages your rep never recorded in.</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: player */}
            <div className="clone-player">
              <div className="player-meta">
                <div className="pm-avatar" />
                <div>
                  <div className="pm-name">Priya · Cloned voice</div>
                  <div className="pm-sub">trained on 94s · revision 03</div>
                </div>
              </div>
              <PlayerWave />
              <div className="pm-controls">
                <button className="pm-play" aria-label="Play">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2.5 1.5v9l8-4.5z" />
                  </svg>
                </button>
                <span className="pm-time">0:21</span>
                <span className="pm-line">
                  <i style={{ width: `${progress}%` }} />
                </span>
                <span className="pm-time">0:58</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
