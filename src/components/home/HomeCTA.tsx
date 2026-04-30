export default function HomeCTA() {
  return (
    <section className="cta-band">
      <div className="container">
        <h2 className="reveal">Stop dialing. <em>Start arriving.</em></h2>
        <p className="reveal">Thirty minutes, one of our solutions architects, and a live call with Barsha calling a number you choose. No pitch deck.</p>
        <div className="hero-cta reveal" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary" href="#book">
            Book a 30-minute demo
            <span className="btn-pill-arrow">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </a>
          <a className="btn btn-ghost" href="/docs">Read the architecture →</a>
        </div>
      </div>
    </section>
  );
}
