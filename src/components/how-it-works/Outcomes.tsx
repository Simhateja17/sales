export default function Outcomes() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Outcomes</span>
          <h2 className="section-title">What changes <em>by Friday.</em></h2>
        </div>
        <div className="outcomes">
          <div className="outcome reveal">
            <div className="num">3<em>×</em></div>
            <h4>More live conversations</h4>
            <p>Per dialing hour, vs. a human SDR team running the same list. Average across 40+ deployments.</p>
          </div>
          <div className="outcome reveal">
            <div className="num">412<span style={{fontSize:'0.45em',opacity:0.6}}>ms</span></div>
            <h4>Median latency</h4>
            <p>End-of-utterance to first audible word back. The difference between feeling heard and feeling on hold.</p>
          </div>
          <div className="outcome reveal">
            <div className="num"><em>$</em>4.20</div>
            <h4>Per booked meeting</h4>
            <p>Down from $96 with traditional SDR-led outbound. SDRs get redeployed to closing, not replaced.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
