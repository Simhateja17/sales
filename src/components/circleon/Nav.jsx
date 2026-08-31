'use client';

// Ported from the CircleOn design export, with two deliberate changes:
//
//  1. The export's only action was "Book a demo". The site it replaces showed
//     "Dashboard" to signed-in visitors and "Sign Up" to everyone else, and
//     dropping that would leave the product with no entry point, so the pill is
//     auth-aware: "Dashboard" links to the app, "Sign Up" goes to the /signup
//     page like the "Sign up" pill on the solutions card. Styling is unchanged.
//  2. The export hid every nav link below 720px with nothing in its place, so a
//     menu button and panel were added for small screens.
//  3. Signed-out visitors also get a "Login" link beside the theme toggle; below
//     720px it moves into the mobile panel rather than crowding the bar.
//
// Everything else is a faithful copy — see CircleOn.jsx for the state behind `v`.
import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorkspace } from '@/lib/api';

const PILL_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: '10px', height: '42px',
  padding: '0 8px 0 18px', borderRadius: '999px', fontWeight: '600',
  fontSize: '14px', letterSpacing: '-.005em', color: '#fff', cursor: 'pointer',
  whiteSpace: 'nowrap', textDecoration: 'none',
  background: 'linear-gradient(180deg,#945FF9,#7447C8 50%,#471E86)',
  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,.35),inset 0 -1px 0 0 rgba(0,0,0,.15),0 1px 2px rgba(71,30,134,.3),0 8px 24px -10px #7447C8',
  transition: 'transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s',
};

const PILL_ARROW = (
  <span style={{"width": "26px", "height": "26px", "borderRadius": "50%", "background": "rgba(255,255,255,.18)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "fontSize": "13px"}}>
    →
  </span>
);

const LINK_STYLE = {
  cursor: 'pointer', paddingBottom: '3px',
  borderBottom: '1px solid transparent', transition: '.2s',
};

// The glyph names the destination, matching themeToggleAria: a sun in dark mode
// (click returns to light), a moon in light mode. Inline SVG rather than the
// Unicode characters, which some platforms draw as colour emoji.
const SUN_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
  </svg>
);

export default function Nav({ v }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWorkspace()
      .then(() => { if (!cancelled) setIsAuthenticated(true); })
      .catch(() => { if (!cancelled) setIsAuthenticated(false); });
    return () => { cancelled = true; };
  }, []);

  const close = () => setMenuOpen(false);
  const run = (fn) => () => { close(); if (fn) fn(); };

  const links = [
    { label: 'Lead Generation', onClick: v.goLeadTitle },
    { label: 'Voice Agent', onClick: v.goVoiceTitle },
    { label: 'Follow Up', onClick: v.goFollowTitle },
  ];

  return (
    <nav className="co-nav" style={{"position": "sticky", "top": "0", "zIndex": "60", "backdropFilter": "blur(22px) saturate(1.8)", "WebkitBackdropFilter": "blur(22px) saturate(1.8)", "background": "linear-gradient(180deg, rgba(247,243,252,.86), rgba(251,250,246,.7))", "borderBottom": "1px solid rgba(230,225,238,.8)"}}>
      <div className="co-nav-inner" style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "0 24px", "height": "76px", "display": "grid", "gridTemplateColumns": "1fr auto 1fr", "alignItems": "center", "gap": "20px"}}>
        <div className="co-nav-logo" onClick={run(v.gotoHome)} style={{"display": "flex", "alignItems": "center", "gap": "10px", "cursor": "pointer", "flexShrink": "0"}}>
          <span style={{"position": "relative", "width": "24px", "height": "24px", "borderRadius": "50%", "border": "1.5px solid #1A172C", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
            <span style={{"width": "6px", "height": "6px", "borderRadius": "50%", "background": "#C49E62"}} />
          </span>
          {' '}
          <span className="co-nav-wordmark" style={{"fontFamily": "'Cormorant Garamond',serif", "fontWeight": "400", "fontSize": "21px", "letterSpacing": "-.01em", "color": "#1A172C"}}>
            CircleOn
            <span style={{"fontStyle": "normal", "color": "#7447C8"}}>
              .ai
            </span>
          </span>
        </div>
        <div className="co-nav-links" style={{"display": "flex", "alignItems": "center", "gap": "28px", "justifyContent": "center"}}>
          {links.map((l) => (
            <Fragment key={l.label}>
              <a onClick={l.onClick} style={LINK_STYLE}>{l.label}</a>
              {' '}
            </Fragment>
          ))}
          {/* display:flex, not the export's plain block: the inline-flex anchor
              inside sat on a line box whose leading made this item 23px tall
              against the other links' 18px, so centring pushed "Resources"
              2.5px below the rest of the bar. */}
          <div style={{"position": "relative", "display": "flex", "alignItems": "center"}}>
            <a onClick={v.toggleResources} style={{"cursor": "pointer", "paddingBottom": "3px", "borderBottom": "1px solid transparent", "transition": ".2s", "display": "inline-flex", "alignItems": "center", "gap": "5px"}}>
              {"Resources "}
              <span style={{"fontSize": "9px"}}>
                ▾
              </span>
            </a>
            {' '}
            {v.resourcesOpen ? (
              <>
              <div className="co-dark-card" style={{"position": "absolute", "top": "calc(100% + 20px)", "left": "50%", "transform": "translateX(-50%)", "width": "280px", "background": "#fff", "borderRadius": "16px", "boxShadow": "0 30px 60px -24px rgba(21,14,42,.28)", "border": "1px solid #E9E4FA", "padding": "12px", "zIndex": "70"}}>
                {(v.resources || []).map((r, $index) => (
                  <Fragment key={$index}>
                  <a onClick={r.onClick} style={{"display": "block", "padding": "11px 14px", "borderRadius": "10px", "cursor": "pointer", "transition": "background .15s"}} className="co-pc7c801">
                    <div style={{"fontSize": "14.5px", "fontWeight": "700", "color": "#1A172C"}}>
                      {r.label}
                    </div>
                    <div style={{"fontSize": "12.5px", "color": "#716F82", "marginTop": "2px"}}>
                      {r.note}
                    </div>
                  </a>
                  </Fragment>
                ))}
              </div>
              </>
            ) : null}
          </div>
          {' '}
          <a onClick={v.gotoPricing} style={LINK_STYLE}>
            Pricing
          </a>
        </div>
        <div className="co-nav-actions" style={{"display": "flex", "alignItems": "center", "justifyContent": "flex-end", "gap": "22px"}}>
          <button className="co-theme-toggle" onClick={v.toggleTheme} aria-label={v.themeToggleAria}>
            {v.theme === 'dark' ? SUN_ICON : MOON_ICON}
          </button>
          {' '}
          {isAuthenticated ? null : (
            <>
            <Link className="co-nav-login" href="/login">Login</Link>
            {' '}
            </>
          )}
          {isAuthenticated ? (
            <Link className="co-nav-demo co-p40d131" href="/dashboard" style={PILL_STYLE}>
              {'Dashboard '}
              {PILL_ARROW}
            </Link>
          ) : (
            // Signed-out visitors get the same destination as the "Sign up" pill
            // on the solutions card: the /signup account form.
            <a className="co-nav-demo co-p40d131" onClick={run(v.gotoSignup)} style={PILL_STYLE}>
              {'Sign Up '}
              {PILL_ARROW}
            </a>
          )}
          <button
            type="button"
            className="co-nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={menuOpen ? 'co-burger-bars is-open' : 'co-burger-bars'}>
              <i /><i /><i />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="co-nav-mobile">
          {links.map((l) => (
            <a key={l.label} onClick={run(l.onClick)}>{l.label}</a>
          ))}
          <a onClick={run(v.gotoPricing)}>Pricing</a>
          <div className="co-nav-mobile-sep" />
          {(v.resources || []).map((r, i) => (
            <a key={i} onClick={run(r.onClick)}>
              {r.label}
              <span>{r.note}</span>
            </a>
          ))}
          {isAuthenticated ? null : (
            <>
            <div className="co-nav-mobile-sep" />
            <Link href="/login" onClick={close}>Log in</Link>
            </>
          )}
        </div>
      ) : null}
    </nav>
  );
}
