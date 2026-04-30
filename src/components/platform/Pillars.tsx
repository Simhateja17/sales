export default function Pillars() {
  return (
    <section className="section">
      <div className="container">
        <div className="pillars">
          <article className="pillar wide reveal">
            <span className="pillar-num">01 — Realtime voice</span>
            <h3>A pipeline measured in milliseconds, not seconds.</h3>
            <p>Streaming ASR, parallel LLM token generation, and a custom neural vocoder hand-tuned for telephony. The result feels like a person who&apos;s listening, not a system that&apos;s processing.</p>
            <div className="stat">
              <div><div className="v">412<em>ms</em></div><div className="l">P50 latency</div></div>
              <div><div className="v">26</div><div className="l">Base voices</div></div>
              <div><div className="v">31</div><div className="l">Languages</div></div>
            </div>
          </article>

          <article className="pillar reveal">
            <span className="pillar-num">02 — Reasoning</span>
            <h3>Plans turns, not tokens.</h3>
            <p>Barsha thinks two beats ahead — what to ask, when to push back, when to fall silent. Trained on 4M minutes of consented sales conversations.</p>
          </article>

          <article className="pillar reveal">
            <span className="pillar-num">03 — Retrieval</span>
            <h3>Grounded in your last seven touches.</h3>
            <p>Every utterance is conditioned on real CRM context, recent emails, and product docs. No invented features. No phantom pricing.</p>
          </article>

          <article className="pillar reveal">
            <span className="pillar-num">04 — Telephony</span>
            <h3>Carrier-grade where it counts.</h3>
            <p>Multi-region SIP trunks, local presence in 87 markets, automatic failover, and STIR/SHAKEN attestation on every outbound call.</p>
          </article>

          <article className="pillar wide reveal">
            <span className="pillar-num">05 — Observability</span>
            <h3>Every second is a row in your warehouse.</h3>
            <p>Per-utterance sentiment, objection categories, silence ratios, hand-raise predictions. Stream it to Snowflake or BigQuery — or query our hosted warehouse with the SQL you already know.</p>
            <div className="stat">
              <div><div className="v">200<em>+</em></div><div className="l">Tracked signals</div></div>
              <div><div className="v">3.0<em>s</em></div><div className="l">CRM write-back</div></div>
              <div><div className="v">∞</div><div className="l">Replayable history</div></div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
