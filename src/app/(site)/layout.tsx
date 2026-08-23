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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;450;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
