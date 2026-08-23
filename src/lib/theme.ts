// One theme preference for the whole product.
//
// Two stylesheets key off two different attributes — barsha.css uses
// `:root[data-theme="dark"]`, circleon.css uses `[data-co-theme="dark"]` — and
// they used to be driven by two separate localStorage keys, so choosing dark on
// the marketing site left the login, onboarding, and dashboard pages light (and
// the reverse). The preference is now single; both attributes are stamped on
// <html> together so either stylesheet sees it, whichever route group renders.

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'circleon-theme';

// Read before the dashboard and the site shared a key. Kept so anyone who had
// already chosen dark in the dashboard is not silently reset to light once.
const LEGACY_KEY = 'barsha-theme';

// Inlined in <head> by both layouts, so the attributes land before first paint
// and dark mode never flashes light. Deliberately dependency-free — it runs as
// a raw string, ahead of any bundle.
export const THEME_BOOTSTRAP = `try{var k=localStorage,t=k.getItem('${THEME_KEY}')||k.getItem('${LEGACY_KEY}');if(t==='dark'){var d=document.documentElement;d.setAttribute('data-theme','dark');d.setAttribute('data-co-theme','dark');}}catch(e){}`;

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    // Private mode, or site data blocked. Light is the documented default.
    return 'light';
  }
}

/**
 * Stamps both attributes on <html> and persists the choice.
 *
 * Light removes the attributes rather than setting "light": circleon.css only
 * ever matches the "dark" value, and a stale `data-co-theme="light"` on <html>
 * would still not cancel a dark rule inherited from an ancestor.
 */
export function applyTheme(next: Theme) {
  const root = document.documentElement;
  if (next === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-co-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
    root.removeAttribute('data-co-theme');
  }
  try {
    localStorage.setItem(THEME_KEY, next);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Preference simply will not persist; the current page still switches.
  }
}
