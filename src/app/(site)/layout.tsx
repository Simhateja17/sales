import type { Metadata } from 'next';
import '@/components/circleon/circleon.css';
import { THEME_BOOTSTRAP } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'CircleOn.ai — Every lead gets a call',
  description:
    'A living AI team that sources opportunities, speaks with them, and keeps moving until the work is done. Choose one service, or let the whole crew run together.',
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // THEME_BOOTSTRAP stamps the theme attributes before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Cormorant Garamond / DM Sans / DM Mono are the design export's
            three faces. DM Sans is loaded through 800 because the ported
            markup uses 700 and 800; without them the browser would
            synthesise a faux bold. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
