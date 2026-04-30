'use client';

import VoiceWave from './VoiceWave';

export interface Voice {
  name: string;
  tag: string;
  cat: string;
  gender: string;
  lang: string;
  dur: string;
  warmth: number;
  pace: number;
  depth: number;
  hue: number;
  hue2: number;
  sample: string;
}

interface VoiceCardProps {
  voice: Voice;
  playing: boolean;
  onPlay: () => void;
}

export default function VoiceCard({ voice, playing, onPlay }: VoiceCardProps) {
  return (
    <article
      className={`voice-card reveal ${playing ? 'playing' : ''}`}
      onClick={onPlay}
    >
      <div className="voice-head">
        <span
          className="v-avatar"
          style={{
            background: `conic-gradient(from 200deg, oklch(0.55 0.2 ${voice.hue}), oklch(0.36 0.16 ${voice.hue}), oklch(0.78 0.1 ${voice.hue2}), oklch(0.55 0.2 ${voice.hue}))`,
          }}
        />
        <div>
          <div className="v-name serif">{voice.name}</div>
          <div className="v-tag">{voice.tag}</div>
        </div>
      </div>

      <div className="v-attrs">
        <div className="v-attr">
          <span className="label">Warmth</span>
          <span className="meter"><i style={{ width: `${voice.warmth}%` }} /></span>
        </div>
        <div className="v-attr">
          <span className="label">Pace</span>
          <span className="meter"><i style={{ width: `${voice.pace}%` }} /></span>
        </div>
        <div className="v-attr">
          <span className="label">Depth</span>
          <span className="meter"><i style={{ width: `${voice.depth}%` }} /></span>
        </div>
      </div>

      <div className="v-foot">
        <span className="v-meta">{voice.lang} · {voice.dur}</span>
        <VoiceWave playing={playing} />
        <button
          className="play-btn"
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          aria-label="Play sample"
        >
          {playing ? (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <rect x="2" y="1" width="2.5" height="9" rx="0.5" />
              <rect x="6.5" y="1" width="2.5" height="9" rx="0.5" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <path d="M2 1.5v8l8-4z" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
