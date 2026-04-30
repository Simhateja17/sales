import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsContent from '@/components/docs/DocsContent';
import DocsTOC from '@/components/docs/DocsTOC';

export default function DocsPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <section className="page-hero" style={{ paddingBottom: 28 }}>
        <div className="container">
          <span className="kicker">Documentation</span>
          <h1 className="page-title" style={{ maxWidth: '22ch' }}>Build with Barsha. <em>In your IDE.</em></h1>
          <p className="page-lede" style={{ marginBottom: 36 }}>SDKs, REST, webhooks, and a real eval harness. Read top to bottom in 40 minutes — or jump straight to the call you want to make.</p>

          <div className="docs-search reveal">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12.5 12.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search docs, SDK methods, error codes…" />
            <span className="kbd">⌘ K</span>
          </div>

          <div className="quick-grid reveal">
            <a className="quick" href="#quickstart">
              <div className="ico">⚡</div>
              <h4>Quickstart</h4>
              <p>Place your first call in under 5 minutes.</p>
            </a>
            <a className="quick" href="#sdks">
              <div className="ico">⌘</div>
              <h4>SDKs</h4>
              <p>TypeScript, Python, and Go with full types.</p>
            </a>
            <a className="quick" href="#guardrails">
              <div className="ico">📜</div>
              <h4>Guardrails</h4>
              <p>Author behavior in plain markdown.</p>
            </a>
            <a className="quick" href="#webhooks">
              <div className="ico">⏵</div>
              <h4>Webhooks</h4>
              <p>Every event. Every signal. Real-time.</p>
            </a>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="docs-layout">
            <DocsSidebar active="quickstart" />
            <DocsContent />
            <DocsTOC />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
