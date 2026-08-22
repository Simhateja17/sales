'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'barsha-theme';

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    // Private mode, or site data blocked. Light is the documented default.
    return 'light';
  }
}

/**
 * Reads and writes the `data-theme` attribute that barsha.css keys off.
 *
 * The attribute is already set before first paint by the bootstrap script in
 * (barsha)/layout.tsx, so this hook starts at 'light' to match what the server
 * rendered and syncs to the real value in an effect. Doing it the other way
 * round — reading localStorage during render — would hydrate-mismatch.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    const root = document.documentElement;
    if (next === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference simply will not persist; the current page still switches.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readStoredTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
