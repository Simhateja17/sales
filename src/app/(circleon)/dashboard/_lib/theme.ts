'use client';

import { useCallback, useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, type Theme } from '@/lib/theme';

export type { Theme };

/**
 * React binding over the shared theme preference in `@/lib/theme`.
 *
 * The attributes are already set before first paint by the bootstrap script in
 * (circleon)/layout.tsx, so this hook starts at 'light' to match what the server
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
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readStoredTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
