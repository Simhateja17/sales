export default function HomePricing() {
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Pricing</span>
          <h2 className="section-title">Priced like an <em>investment</em>, not an experiment.</h2>
          <p className="section-sub">Three tiers, each with unmetered minutes during your first 30 days. No per-seat tax. No surprise overage.</p>
        </div>
        <div className="pricing">
          <div className="price reveal">
            <div className="tier">Atelier</div>
            <div className="amount"><span className="currency">$</span>1,200<span className="per">/ month</span></div>
            <p className="desc">For founders running their own pipeline. One agent, two languages, white-glove setup.</p>
            <ul>
              <li>1 agent, 2,000 minutes / mo</li>
              <li>HubSpot or Pipedrive</li>
              <li>Email + Slack support</li>
              <li>Standard voice library</li>
            </ul>
            <a className="btn btn-ghost" href="#book">Start with Atelier</a>
          </div>

          <div className="price feature reveal">
            <div className="tier">Maison <span className="ribbon">Most popular</span></div>
            <div className="amount"><span className="currency">$</span>3,800<span className="per">/ month</span></div>
            <p className="desc">For revenue teams ready to scale. Unlimited agents, custom voice, and a real Slack channel with our team.</p>
            <ul>
              <li>Unlimited agents, 10k minutes</li>
              <li>Salesforce, HubSpot, Attio</li>
              <li>Custom voice cloning (1)</li>
              <li>Priority routing &amp; SLAs</li>
              <li>Shared Slack channel</li>
            </ul>
            <a className="btn btn-primary" href="#book">
              Book a Maison demo
              <span className="btn-pill-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </a>
          </div>

          <div className="price reveal">
            <div className="tier">Sovereign</div>
            <div className="amount" style={{ fontSize: 44 }}>Custom</div>
            <p className="desc">For enterprises with regulated workloads, dedicated infrastructure, and procurement teams that have opinions.</p>
            <ul>
              <li>Single-tenant deployment</li>
              <li>HIPAA, PCI, SOC 2 Type II</li>
              <li>Dedicated solutions architect</li>
              <li>Custom data residency</li>
            </ul>
            <a className="btn btn-ghost" href="#book">Talk to enterprise</a>
          </div>
        </div>
      </div>
    </section>
  );
}
