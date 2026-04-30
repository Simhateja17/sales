export default function Architecture() {
  return (
    <section className="section">
      <div className="container">
        <div className="arch reveal">
          <span className="kicker" style={{ color: 'oklch(0.85 0.06 85)' }}>Architecture</span>
          <h2>Six layers, <em>one continuous turn.</em></h2>
          <p>From microphone to CRM, every layer of Barsha is owned by us. No vendor in the critical path means we can tune for the only number that matters: time-to-first-word.</p>
          <div className="arch-grid">
            <div className="arch-layer">
              <div className="lab">Audio in</div>
              <h4>Streaming ASR</h4>
              <ul>
                <li>Voice-activity detection</li>
                <li>Speaker diarization</li>
                <li>Sub-150ms partials</li>
              </ul>
            </div>
            <div className="arch-layer">
              <div className="lab">Cognition</div>
              <h4>Planner + retriever</h4>
              <ul>
                <li>Turn-level planning</li>
                <li>CRM-grounded recall</li>
                <li>Guardrail compiler</li>
              </ul>
            </div>
            <div className="arch-layer">
              <div className="lab">Audio out</div>
              <h4>Neural vocoder</h4>
              <ul>
                <li>Telephony-tuned</li>
                <li>Prosody control</li>
                <li>Streaming μ-law</li>
              </ul>
            </div>
            <div className="arch-layer">
              <div className="lab">Telephony</div>
              <h4>SIP &amp; local presence</h4>
              <ul>
                <li>87 local markets</li>
                <li>STIR/SHAKEN A-attestation</li>
                <li>Sub-second failover</li>
              </ul>
            </div>
            <div className="arch-layer">
              <div className="lab">Integrations</div>
              <h4>Bidirectional CRM</h4>
              <ul>
                <li>Salesforce, HubSpot, Attio</li>
                <li>3-second write-back</li>
                <li>Custom field mapping</li>
              </ul>
            </div>
            <div className="arch-layer">
              <div className="lab">Observability</div>
              <h4>Warehouse-native</h4>
              <ul>
                <li>Stream to Snowflake / BQ</li>
                <li>200+ signals per call</li>
                <li>Replayable forever</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
