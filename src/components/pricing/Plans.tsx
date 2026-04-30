'use client';

import { useState } from 'react';

export default function Plans() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const m = billing === 'annual' ? 0.83 : 1;
  const fmt = (n: number) => Math.round(n * m).toLocaleString();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'center', marginBottom: 36 }}>
          <div className="billing-toggle reveal">
            <button className={billing==='monthly'?'active':''} onClick={()=>setBilling('monthly')}>Monthly</button>
            <button className={billing==='annual'?'active':''} onClick={()=>setBilling('annual')}>
              Annual <span className="save">save 17%</span>
            </button>
          </div>
        </div>

        <div className="pricing-grid">
          <div className="price reveal">
            <div className="tier">Atelier</div>
            <h3 className="name">For <em>founders</em></h3>
            <div className="amount"><span className="currency">$</span>{fmt(1200)}<span className="per">/ month</span></div>
            <div className="amount-sub">Billed {billing}. 2,000 minutes included.</div>
            <p className="desc">For founders running their own pipeline. One agent, two languages, white-glove setup.</p>
            <ul>
              <li>1 agent · 2,000 min/mo</li>
              <li>2 languages</li>
              <li>HubSpot or Pipedrive</li>
              <li>Standard voice library</li>
              <li>Email + Slack support</li>
              <li>$0.42 / min overage</li>
            </ul>
            <a className="btn btn-ghost" href="#book">Start with Atelier</a>
          </div>

          <div className="price feature reveal">
            <div className="tier">Maison <span className="ribbon">Most popular</span></div>
            <h3 className="name">For <em>revenue teams</em></h3>
            <div className="amount"><span className="currency">$</span>{fmt(3800)}<span className="per">/ month</span></div>
            <div className="amount-sub">Billed {billing}. 10,000 minutes included.</div>
            <p className="desc">For revenue teams ready to scale. Unlimited agents, custom voice cloning, and a real Slack channel with our team.</p>
            <ul>
              <li>Unlimited agents · 10k min/mo</li>
              <li>All 31 languages</li>
              <li>Salesforce, HubSpot, Attio, Pipedrive</li>
              <li>Custom voice cloning (1 included)</li>
              <li>Priority routing &amp; SLAs</li>
              <li>Shared Slack channel</li>
              <li>$0.32 / min overage</li>
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
            <h3 className="name">For <em>enterprises</em></h3>
            <div className="amount" style={{ fontSize: 44, marginTop: 28 }}>Custom</div>
            <div className="amount-sub">Annual contract. Volume-based pricing.</div>
            <p className="desc">For enterprises with regulated workloads, dedicated infrastructure, and procurement teams that have opinions.</p>
            <ul>
              <li>Single-tenant deployment</li>
              <li>Dedicated infra (any region)</li>
              <li>HIPAA, PCI, SOC 2 Type II</li>
              <li>Unlimited voice cloning</li>
              <li>Dedicated solutions architect</li>
              <li>99.99% uptime SLA</li>
              <li>Custom data residency</li>
            </ul>
            <a className="btn btn-ghost" href="#book">Talk to enterprise</a>
          </div>
        </div>
      </div>
    </section>
  );
}
