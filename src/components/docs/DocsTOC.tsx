'use client';

import { useState, useEffect } from 'react';

const TOC = [
  ['install', '1. Install'],
  ['authenticate', '2. Authenticate'],
  ['define-agent', '3. Define an agent'],
  ['place-call', '4. Place the call'],
  ['read-results', '5. Read the result'],
  ['next', 'Where to go next'],
];

export default function DocsTOC() {
  const [active, setActive] = useState('install');
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    TOC.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <aside className="docs-toc">
      <div className="toc-h">On this page</div>
      {TOC.map(([id, label]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>
      ))}
    </aside>
  );
}
