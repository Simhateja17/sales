import type { Page } from './ui';

const PAGE_IDS: Page[] = ['overview', 'campaigns', 'leads', 'inbox', 'calls', 'meetings', 'analytics', 'settings', 'billing', 'support'];

/** Clean URL for a dashboard screen: /home, /leads, /settings/voice. */
export function pagePath(page: Page, section?: string | null): string {
  if (page === 'overview') return '/home';
  if (page === 'settings' && section) return `/settings/${section}`;
  return `/${page}`;
}

/** Reads the screen (and settings tab) out of a clean URL; null when the path is not a dashboard screen. */
export function parsePagePath(pathname: string): { page: Page; section: string | null } | null {
  const [first, second] = pathname.split('/').filter(Boolean);
  if (first === 'home') return { page: 'overview', section: null };
  if (first && (PAGE_IDS as string[]).includes(first) && first !== 'overview') return { page: first as Page, section: second || null };
  return null;
}

/** Old links looked like /dashboard?page=leads&section=x; map them onto the clean URL, keeping any other params. */
export function legacyDashboardTarget(search: URLSearchParams): string {
  const rest = new URLSearchParams(search);
  const requested = rest.get('page');
  const page: Page = requested === 'sent' ? 'inbox' : requested && (PAGE_IDS as string[]).includes(requested) ? requested as Page : 'overview';
  const section = rest.get('section');
  rest.delete('page');
  rest.delete('section');
  const query = rest.toString();
  return `${pagePath(page, section)}${query ? `?${query}` : ''}`;
}
