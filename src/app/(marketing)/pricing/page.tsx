import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import PageHero from '@/components/PageHero';
import Plans from '@/components/pricing/Plans';
import Compare from '@/components/pricing/Compare';
import Addons from '@/components/pricing/Addons';
import FAQ from '@/components/pricing/FAQ';

export default function PricingPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <PageHero
        kicker="Pricing"
        title={<>Priced like an <em>investment,</em> not an experiment.</>}
        lede="Three tiers. Unmetered minutes for the first 30 days. No per-seat tax. No surprise overage. We win when you win — your AE team's quota becomes ours, in writing."
      />
      <Plans />
      <Compare />
      <Addons />
      <FAQ />
      <section className="cta-band">
        <div className="container">
          <h2 className="reveal">Pick the tier. <em>Skip the tiers.</em></h2>
          <p className="reveal">Talk to a human. We&apos;ll tell you which plan fits, even when it&apos;s the cheaper one. No quotas to hit on this end.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <a className="btn btn-primary reveal" href="#book">
              Book a 30-minute demo
              <span className="btn-pill-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </a>
            <a className="btn btn-ghost reveal" href="/docs">Read the docs</a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
