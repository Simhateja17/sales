export default function HomeNumbers() {
  return (
    <section className="section" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="container">
        <div className="numbers reveal">
          <div className="num-cell">
            <div className="lab">Connect rate</div>
            <div className="big">3.1<em>×</em></div>
            <div className="desc">More live conversations per dialing hour vs. human SDR teams.</div>
          </div>
          <div className="num-cell">
            <div className="lab">Median latency</div>
            <div className="big">412<span style={{ fontSize: '0.5em', opacity: 0.6 }}>ms</span></div>
            <div className="desc">From end-of-utterance to first word back, measured weekly.</div>
          </div>
          <div className="num-cell">
            <div className="lab">Cost per booked meeting</div>
            <div className="big"><em>$</em>4.20</div>
            <div className="desc">Down from $96 with traditional SDR-led outbound motion.</div>
          </div>
          <div className="num-cell">
            <div className="lab">Languages</div>
            <div className="big">31</div>
            <div className="desc">Native-quality voice, with regional accent control across all of them.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
