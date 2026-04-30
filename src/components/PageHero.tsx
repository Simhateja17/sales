import { ReactNode } from 'react';

interface PageHeroProps {
  kicker?: ReactNode;
  title?: ReactNode;
  lede?: ReactNode;
}

export default function PageHero({ kicker, title, lede }: PageHeroProps) {
  // Defaults for the voices page (original usage)
  return (
    <section className="page-hero">
      <div className="container">
        <span className="kicker">{kicker ?? 'The voice library'}</span>
        <h1 className="page-title">
          {title ?? <>Twenty-six voices. <em>One unmistakably yours.</em></>}
        </h1>
        <p className="page-lede">
          {lede ?? <>Each voice is sculpted by a director, not a model. Tunable across warmth, pace, and depth. Or clone your top performer in 90 seconds — Barsha will sound like them on every call, in every language they don&apos;t speak.</>}
        </p>
      </div>
    </section>
  );
}
