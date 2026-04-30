import { ReactNode } from 'react';

interface CTAProps {
  title?: ReactNode;
  body?: string;
  cta?: string;
}

export default function CTA({ title, body, cta }: CTAProps) {
  return (
    <section className="cta-band">
      <div className="container">
        <h2 className="reveal">
          {title ?? <>Try a voice <em>against your buyer.</em></>}
        </h2>
        <p className="reveal">
          {body ?? 'Pick any voice. Enter a number. Barsha calls in 30 seconds with a script you choose. No signup.'}
        </p>
        <a className="btn btn-primary reveal" href="#book">
          {cta ?? 'Place a test call'}
          <span className="btn-pill-arrow">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 5h8M5 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
