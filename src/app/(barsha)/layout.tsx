import './barsha.css';
import { THEME_BOOTSTRAP } from '@/lib/theme';

export default function BarshaLayout({ children }: { children: React.ReactNode }) {
  return (
    // THEME_BOOTSTRAP stamps data-theme on this element before React hydrates,
    // which React otherwise reports as a hydration mismatch on every load.
    // Suppression is scoped to this element's own attributes, not its subtree.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
