import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voices — Barsha AI',
  description: 'Twenty-six voices sculpted by a director, not a model.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <div className="ambient" />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
