'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePlan, type Workspace } from '@/lib/api';

const PLANS: NonNullable<Workspace['plan']>[] = ['atelier', 'maison', 'sovereign'];

export default function PlanSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function continueToOnboarding() {
    setError('');

    setSaving(true);
    try {
      await savePlan(PLANS[selected]);
      router.push('/onboarding');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save plan.';
      if (message.toLowerCase().includes('authentication')) {
        router.push('/login');
        return;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen active" id="plan-select">
      <div className="start-card">
        <div className="start-top">
          <div className="start-kicker"><span className="ob-cat-dot" />Subscription</div>
          <div className="start-title">Choose a plan to start</div>
          <p className="start-sub">Pick the plan that matches your sales volume. You can change this anytime from Billing.</p>
        </div>
        <div className="start-body">
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div className="pricing-grid">
            <div className={`price${selected === 0 ? ' selected' : ''}`} onClick={() => setSelected(0)}>
              <div className="tier">Atelier</div>
              <h3 className="plan-name">For <em>founders</em></h3>
              <div className="amount"><sup className="currency">$</sup>996<span className="per">/ month</span></div>
              <div className="amount-sub">Billed annual. 2,000 minutes included.</div>
              <p className="desc">For founders running their own pipeline. One agent, two languages, white-glove setup.</p>
              <ul>
                <li>1 agent · 2,000 min/mo</li>
                <li>2 languages</li>
                <li>HubSpot or Pipedrive</li>
                <li>Standard voice library</li>
                <li>Email + Slack support</li>
                <li>$0.42 / min overage</li>
              </ul>
              <button className="btn btn-ghost">Start with Atelier</button>
            </div>

            <div className={`price feature${selected === 1 ? ' selected' : ''}`} onClick={() => setSelected(1)}>
              <div className="tier">Maison <span className="ribbon">Most popular</span></div>
              <h3 className="plan-name">For <em>revenue teams</em></h3>
              <div className="amount"><sup className="currency">$</sup>3,154<span className="per">/ month</span></div>
              <div className="amount-sub">Billed annual. 10,000 minutes included.</div>
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
              <button className="btn btn-primary">
                Book a Maison demo
                <span className="btn-pill-arrow">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            </div>

            <div className={`price${selected === 2 ? ' selected' : ''}`} onClick={() => setSelected(2)}>
              <div className="tier">Sovereign</div>
              <h3 className="plan-name">For <em>enterprises</em></h3>
              <div className="amount" style={{ fontSize: 64, marginTop: 22 }}>Custom</div>
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
              <button className="btn btn-ghost">Talk to enterprise</button>
            </div>
          </div>
        </div>
        <div className="start-nav">
          <button className="btn-back" onClick={() => router.push('/signup')}>← Back</button>
          <button className="btn-gold" onClick={continueToOnboarding} disabled={saving}>
            {saving ? 'Saving plan...' : 'Start Building Agent'}{' '}
            {!saving && (
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
