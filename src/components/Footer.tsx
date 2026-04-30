import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="brand" href="/">
              <span className="brand-mark" />
              <span className="brand-name">Barsha<span>·</span>ai</span>
            </Link>
            <p>The voice of your revenue, answered before it rings. Built in San Francisco and Bangalore.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <Link href="/platform">Platform</Link>
            <Link href="/voices">Voices</Link>
            <Link href="#">Integrations</Link>
            <Link href="#">Changelog</Link>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <Link href="#">About</Link>
            <Link href="#">Customers</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Press</Link>
          </div>
          <div className="foot-col">
            <h5>Resources</h5>
            <Link href="/docs">Docs</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="#">Security</Link>
            <Link href="#">Status</Link>
          </div>
          <div className="foot-col">
            <h5>Legal</h5>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">DPA</Link>
            <Link href="#">Trust center</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Barsha Labs, Inc.</span>
          <span className="tag">v2.4.1 · all systems operational</span>
        </div>
      </div>
    </footer>
  );
}
