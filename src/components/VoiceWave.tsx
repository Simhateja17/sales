'use client';

import { useState, useEffect } from 'react';

interface VoiceWaveProps {
  playing: boolean;
}

export default function VoiceWave({ playing }: VoiceWaveProps) {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 22 }, () => 0.3)
  );

  useEffect(() => {
    if (!playing) {
      setBars(Array.from({ length: 22 }, () => 0.2));
      return;
    }
    const t = setInterval(() => {
      setBars(
        Array.from({ length: 22 }, (_, i) => {
          const center = 11;
          const dist = Math.abs(i - center);
          const base = Math.max(0.25, 1 - dist * 0.05);
          return base * (0.5 + Math.random() * 0.5);
        })
      );
    }, 110);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="v-wave">
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}
