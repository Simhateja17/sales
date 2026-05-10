'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/platform', label: 'Platform', key: 'platform' },
  { href: '/voices',   label: 'Voices',   key: 'voices'   },
  { href: '/how-it-works', label: 'How it works', key: 'how' },
  { href: '/pricing',  label: 'Pricing',  key: 'pricing'  },
  { href: '/docs',     label: 'Docs',     key: 'docs'     },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" />
          <span className="brand-name">Barsha<span>·</span>ai</span>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={pathname.startsWith(l.href) ? 'active' : ''}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-cta">
          <Link href="/signup" style={{ fontSize: 14, color: 'var(--ink-2)', textDecoration: 'none' }}>
            Sign Up
          </Link>
          <a className="btn btn-primary" href="#book">
            Book a demo
            <span className="btn-pill-arrow">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
