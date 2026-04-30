export default function QuoteBlock() {
  return (
    <section className="section">
      <div className="container">
        <div className="quote-block reveal">
          <div className="quote-grid">
            <blockquote>
              <div className="mark">&ldquo;</div>
              <p className="q">We were live in <em>one afternoon.</em> By Friday, Barsha had booked more demos than our team did in the first two weeks of the quarter.</p>
              <div className="quote-meta">
                <span className="av"></span>
                <div>
                  <div className="who">Reema Vasquez</div>
                  <div className="role">VP Revenue · Northwind</div>
                </div>
              </div>
            </blockquote>
            <div className="quote-stats">
              <div>
                <div className="qs-num">3<em>h</em></div>
                <div className="qs-lab">to first live call</div>
              </div>
              <div>
                <div className="qs-num">+340<em>%</em></div>
                <div className="qs-lab">demos booked, q1</div>
              </div>
              <div>
                <div className="qs-num">$2.4<em>M</em></div>
                <div className="qs-lab">pipeline generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
