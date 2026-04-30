'use client';

import { useState } from 'react';
import VoiceCard, { type Voice } from './VoiceCard';

const VOICES: Voice[] = [
  { name: 'Maya',   tag: 'Inbound · Warm',       cat: 'inbound',  gender: 'F', lang: 'en-US', dur: '0:23', warmth: 92, pace: 60, depth: 45, hue: 295, hue2: 320, sample: 'Hi, this is Maya. I see you were just looking at our pricing page — I can pull up exactly what fits your team.' },
  { name: 'Priya',  tag: 'Discovery · Crisp',    cat: 'outbound', gender: 'F', lang: 'en-IN', dur: '0:21', warmth: 70, pace: 78, depth: 55, hue: 280, hue2: 310, sample: 'Hey, Priya here from Northwind. Quick one — are AE hires backfills, or growth?' },
  { name: 'Anders', tag: 'Outbound · Steady',    cat: 'outbound', gender: 'M', lang: 'en-GB', dur: '0:25', warmth: 55, pace: 50, depth: 80, hue: 260, hue2: 290, sample: "Anders here. I won't take more than two minutes — I just had one specific question for you." },
  { name: 'Sofía',  tag: 'Renewal · Empathetic', cat: 'support',  gender: 'F', lang: 'es-MX', dur: '0:24', warmth: 88, pace: 52, depth: 50, hue: 305, hue2: 80,  sample: 'Hola, soy Sofía. Antes de procesar nada — cuéntame qué cambió. La última vez todo iba muy bien.' },
  { name: 'Kenji',  tag: 'Technical · Even',     cat: 'support',  gender: 'M', lang: 'ja-JP', dur: '0:19', warmth: 60, pace: 55, depth: 70, hue: 270, hue2: 300, sample: 'はじめまして、健司と申します。技術的な質問でも大丈夫ですので、何でも聞いてください。' },
  { name: 'Lior',   tag: 'Outbound · Bright',    cat: 'outbound', gender: 'M', lang: 'en-US', dur: '0:22', warmth: 78, pace: 82, depth: 40, hue: 295, hue2: 80,  sample: "Hey, Lior here — heard you're scaling AE hires. Mind if I share something specific to that?" },
  { name: 'Aanya',  tag: 'Inbound · Calm',       cat: 'inbound',  gender: 'F', lang: 'en-IN', dur: '0:24', warmth: 84, pace: 48, depth: 55, hue: 285, hue2: 310, sample: "Hi, this is Aanya. Take your time — I'll walk you through whatever feels useful first." },
  { name: 'Marco',  tag: 'Renewal · Confident',  cat: 'support',  gender: 'M', lang: 'it-IT', dur: '0:23', warmth: 70, pace: 60, depth: 75, hue: 265, hue2: 80,  sample: "Marco. Senti, prima di chiudere il contratto — c'è una cosa specifica che vorrei capire da te." },
  { name: 'Eden',   tag: 'Inbound · Neutral',    cat: 'inbound',  gender: 'X', lang: 'en-US', dur: '0:20', warmth: 65, pace: 65, depth: 60, hue: 290, hue2: 320, sample: "Eden here. What's the question on your mind today — pricing, security, or something more specific?" },
];

const FILTERS = [
  { key: 'all',      label: 'All voices' },
  { key: 'inbound',  label: 'Inbound' },
  { key: 'outbound', label: 'Outbound' },
  { key: 'support',  label: 'Support & renewal' },
  { key: 'F',        label: 'Feminine' },
  { key: 'M',        label: 'Masculine' },
  { key: 'X',        label: 'Neutral' },
];

export default function VoiceLibrary() {
  const [filter, setFilter] = useState('all');
  const [playing, setPlaying] = useState<string | null>(null);

  const visible = VOICES.filter((v) => {
    if (filter === 'all') return true;
    if (['F', 'M', 'X'].includes(filter)) return v.gender === filter;
    return v.cat === filter;
  });

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div className="voice-filters reveal">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="voices-grid">
          {visible.map((v) => (
            <VoiceCard
              key={v.name}
              voice={v}
              playing={playing === v.name}
              onPlay={() => setPlaying((p) => (p === v.name ? null : v.name))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
