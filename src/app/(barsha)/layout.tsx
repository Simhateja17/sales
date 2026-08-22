import './barsha.css';

// Applies the saved theme before first paint so dark mode does not flash light
// on load or navigation. The attribute sits on <html>, so it is an ancestor of
// every :root[data-theme="dark"] rule in barsha.css. Mirrors the equivalent
// bootstrap in (site)/layout.tsx.
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('barsha-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`;

export default function BarshaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
