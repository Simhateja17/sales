import type { Metadata } from 'next';
import '@/components/circleon/circleon.css';

export const metadata: Metadata = {
  title: 'CircleOn.ai — Every lead gets a call',
  description:
    'A living AI team that sources opportunities, speaks with them, and keeps moving until the work is done. Choose one service, or let the whole crew run together.',
};

// Applies the saved theme before first paint so dark mode does not flash light
// on navigation. The attribute sits on <html>, so it is an ancestor of every
// [data-co-theme="dark"] rule in circleon.css.
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('circleon-theme');if(t==='dark')document.documentElement.setAttribute('data-co-theme','dark');}catch(e){}`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
