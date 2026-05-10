'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  return (
    <div className="screen active" id="plan-select">
      <div className="start-card">
        <div className="start-top">
          <div className="start-kicker"><span className="ob-cat-dot" />Subscription</div>
          <div className="start-title">Choose a plan to start</div>
          <p className="start-sub">Pick the plan that matches your sales volume. You can change this anytime from Billing.</p>
        </div>
        <div className="start-body">
          <div className="plan-grid">
            <div
              className={`plan-option${selected === 0 ? ' selected' : ''}`}
              onClick={() => setSelected(0)}
            >
              <div className="plan-tier">Atelier</div>
              <h4>For <em>founders</em></h4>
              <div className="plan-price-mini">S$996<small>/month</small></div>
              <div className="plan-meta">Billed annual. 2,000 minutes included.</div>
              <div className="plan-desc">For founders running their own pipeline. One agent, two languages, white-glove setup.</div>
              <ul className="plan-feats">
                <li>1 agent · 2,000 min/mo</li>
                <li>2 languages</li>
                <li>HubSpot or Pipedrive</li>
                <li>Standard voice library</li>
                <li>Email + Slack support</li>
                <li>$0.42 / min overage</li>
              </ul>
              <button className="plan-cta">Start with Atelier</button>
            </div>

            <div
              className={`plan-option${selected === 1 ? ' selected' : ''}`}
              onClick={() => setSelected(1)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div className="plan-tier" style={{ marginBottom: 0, color: '#D9CCFF' }}>Maison</div>
                <div className="plan-badge">Most Popular</div>
              </div>
              <h4>For <em>revenue teams</em></h4>
              <div className="plan-price-mini">S$3,154<small>/month</small></div>
              <div className="plan-meta">Billed annual. 10,000 minutes included.</div>
              <div className="plan-desc">For revenue teams ready to scale. Unlimited agents, custom voice cloning, and a real Slack channel with our team.</div>
              <ul className="plan-feats">
                <li>Unlimited agents · 10k min/mo</li>
                <li>All 31 languages</li>
                <li>Salesforce, HubSpot, Attio, Pipedrive</li>
                <li>Custom voice cloning (1 included)</li>
                <li>Priority routing & SLAs</li>
                <li>Shared Slack channel</li>
                <li>$0.32 / min overage</li>
              </ul>
              <button className="plan-cta">Book a Maison demo</button>
            </div>

            <div
              className={`plan-option${selected === 2 ? ' selected' : ''}`}
              onClick={() => setSelected(2)}
            >
              <div className="plan-tier">Sovereign</div>
              <h4>For <em>enterprises</em></h4>
              <div className="plan-price-mini">Custom</div>
              <div className="plan-meta">Annual contract. Volume-based pricing.</div>
              <div className="plan-desc">For enterprises with regulated workloads, dedicated infrastructure, and procurement teams that have opinions.</div>
              <ul className="plan-feats">
                <li>Single-tenant deployment</li>
                <li>Dedicated infra (any region)</li>
                <li>HIPAA, PCI, SOC 2 Type II</li>
                <li>Unlimited voice cloning</li>
                <li>Dedicated solutions architect</li>
                <li>99.99% uptime SLA</li>
                <li>Custom data residency</li>
              </ul>
              <button className="plan-cta">Talk to enterprise</button>
            </div>
          </div>
        </div>
        <div className="start-nav">
          <button className="btn-back" onClick={() => router.push('/signup')}>← Back</button>
          <button className="btn-gold" onClick={() => router.push('/onboarding')}>
            Start Building Agent{' '}
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
