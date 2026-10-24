'use client';
import { useEffect, useRef } from 'react';

// The hero is drawn for a 1440 x 800 desktop. On larger screens the whole composition is scaled
// up together (never reflowed) so the illustration, headline and calls to action keep the same
// proportions at every desktop size. Below 900px wide it stays at 1x.
const DESIGN_W = 1440;
const DESIGN_H = 800;
const NAV_H = 76;

export default function HeroFit({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const apply = () => {
      const el = ref.current;
      if (!el) return;
      const w = window.innerWidth;
      const scale = w < 900 ? 1 : Math.min(2.4, Math.max(1, Math.min(w / DESIGN_W, (window.innerHeight - NAV_H) / DESIGN_H)));
      el.style.setProperty('--co-s', scale.toFixed(4));
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);
  return <div className="co-fit" ref={ref}>{children}</div>;
}
