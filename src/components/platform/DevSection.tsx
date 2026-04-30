export default function DevSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="two-col">
          <div className="code-card reveal">
            <div><span className="c">// Configure Barsha in plain English</span></div>
            <div><span className="k">const</span> agent <span className="k">=</span> <span className="k">await</span> barsha.<span className="n">create</span>{'({'}</div>
            <div>{'  '}voice: <span className="s">&quot;maya-warm&quot;</span>,</div>
            <div>{'  '}guardrails: <span className="s">&quot;./prompts/discovery.md&quot;</span>,</div>
            <div>{'  '}crm: <span className="n">salesforce</span>(env.SF_TOKEN),</div>
            <div>{'  '}calendar: <span className="n">calendly</span>(<span className="s">&quot;priya@barsha.ai&quot;</span>),</div>
            <div>{'  '}escalate_to: <span className="s">&quot;#sales-help&quot;</span>,</div>
            <div>{'}'});</div>
            <div style={{ marginTop: 14 }}><span className="c">// Place a call. That&apos;s it.</span></div>
            <div><span className="k">await</span> agent.<span className="n">call</span>(<span className="s">&quot;+1-415-555-0140&quot;</span>);</div>
          </div>
          <div className="reveal">
            <span className="kicker">Built for engineers</span>
            <h2 className="section-title">A <em>real</em> SDK. Not a flow chart.</h2>
            <p className="section-sub">TypeScript, Python, and Go. Idiomatic objects, real types, sensible errors. Configure Barsha the way you&apos;d configure any other system: in code, in version control, in code review.</p>
            <ul className="check-list">
              <li>Define guardrails in plain markdown. No proprietary DSL to learn.</li>
              <li>Test agents locally with simulated calls before going live.</li>
              <li>Every event is a webhook — pipe it wherever your team already lives.</li>
              <li>Open-source eval harness for measuring agent quality over time.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
