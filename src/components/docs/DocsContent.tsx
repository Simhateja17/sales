export default function DocsContent() {
  return (
    <article className="docs-content">
      <div style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.06em', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        BUILDING AGENTS · QUICKSTART
      </div>
      <h1>Place your first call <em>in under 5 minutes.</em></h1>
      <div className="meta">
        <span className="pill">v2.4</span>
        <span>Last updated April 2026</span>
        <span>·</span>
        <span>4 min read</span>
      </div>

      <p>
        Barsha is a single SDK that wraps voice synthesis, real-time reasoning, telephony, and CRM integration into one object. This page walks through the smallest possible end-to-end: install, configure, place a call, read the transcript.
      </p>

      <div className="callout">
        <span className="ico">★</span>
        <span><strong>You&apos;ll need:</strong> a Barsha API key (<code>sk_live_…</code>) and one verified phone number for outbound calls. New accounts get a free sandbox number for the first 100 calls.</span>
      </div>

      <h2 id="install">1. Install</h2>
      <p>Pick your language. The TypeScript SDK is what we use internally — it&apos;s the most thoroughly typed.</p>

      <pre><code>{`npm install @barsha/sdk\n# or\npip install barsha\n# or\ngo get github.com/barsha-ai/barsha-go`}</code></pre>

      <h2 id="authenticate">2. Authenticate</h2>
      <p>Set your API key as an environment variable. Never commit keys — Barsha rotates exposed keys automatically the moment they appear in a public repo.</p>

      <pre><code dangerouslySetInnerHTML={{ __html: `<span class="k">import</span> <span class="p">{ Barsha }</span> <span class="k">from</span> <span class="s">"@barsha/sdk"</span><span class="p">;</span>\n\n<span class="k">const</span> client <span class="p">=</span> <span class="k">new</span> <span class="n">Barsha</span><span class="p">({</span>\n  apiKey<span class="p">:</span> process<span class="p">.</span>env<span class="p">.</span>BARSHA_API_KEY<span class="p">,</span>\n  region<span class="p">:</span> <span class="s">"us-west-2"</span><span class="p">,</span> <span class="c">// optional, defaults to nearest</span>\n<span class="p">});</span>` }}/>
      </pre>

      <h2 id="define-agent">3. Define an agent</h2>
      <p>An <code>Agent</code> is a voice + a guardrail file + a set of tools. The guardrail file is plain markdown — versioned in your repo, reviewed in your PR process. No proprietary DSL.</p>

      <pre><code dangerouslySetInnerHTML={{ __html: `<span class="k">const</span> agent <span class="p">=</span> <span class="k">await</span> client<span class="p">.</span>agents<span class="p">.</span><span class="n">create</span><span class="p">({</span>\n  name<span class="p">:</span> <span class="s">"discovery-bot"</span><span class="p">,</span>\n  voice<span class="p">:</span> <span class="s">"maya-warm"</span><span class="p">,</span>\n  guardrails<span class="p">:</span> <span class="n">readFileSync</span><span class="p">(</span><span class="s">"./prompts/discovery.md"</span><span class="p">),</span>\n  tools<span class="p">: [</span>\n    <span class="n">salesforce</span><span class="p">({</span> token<span class="p">:</span> env<span class="p">.</span>SF_TOKEN <span class="p">}),</span>\n    <span class="n">calendly</span><span class="p">({</span> handle<span class="p">:</span> <span class="s">"priya@barsha.ai"</span> <span class="p">}),</span>\n  <span class="p">],</span>\n  escalateTo<span class="p">:</span> <span class="s">"#sales-help"</span><span class="p">,</span>\n<span class="p">});</span>` }}/>
      </pre>

      <h2 id="place-call">4. Place the call</h2>
      <p>Call a number, attach metadata, and let it run. Barsha returns a streaming handle you can subscribe to for live events, or you can fire-and-forget and read the transcript later.</p>

      <pre><code dangerouslySetInnerHTML={{ __html: `<span class="k">const</span> call <span class="p">=</span> <span class="k">await</span> agent<span class="p">.</span><span class="n">call</span><span class="p">({</span>\n  to<span class="p">:</span> <span class="s">"+14155550140"</span><span class="p">,</span>\n  context<span class="p">: {</span>\n    leadId<span class="p">:</span> <span class="s">"lead_8h2k3"</span><span class="p">,</span>\n    objective<span class="p">:</span> <span class="s">"book demo with VP Sales"</span><span class="p">,</span>\n  <span class="p">},</span>\n<span class="p">});</span>\n\n<span class="c">// Subscribe to live events</span>\ncall<span class="p">.</span><span class="n">on</span><span class="p">(</span><span class="s">"transcript"</span><span class="p">,</span> <span class="p">(</span>chunk<span class="p">)</span> <span class="p">=&gt;</span> <span class="n">console</span><span class="p">.</span><span class="n">log</span><span class="p">(</span>chunk<span class="p">));</span>\ncall<span class="p">.</span><span class="n">on</span><span class="p">(</span><span class="s">"booked"</span><span class="p">,</span> <span class="p">(</span>meeting<span class="p">)</span> <span class="p">=&gt;</span> <span class="n">notify</span><span class="p">(</span>meeting<span class="p">));</span>` }}/>
      </pre>

      <div className="callout">
        <span className="ico">⚠</span>
        <span><strong>Sandbox vs. live.</strong> In sandbox mode, calls are simulated against a synthetic buyer trained on your guardrails — useful for CI. Pass <code>{`{ mode: "sandbox" }`}</code> on the agent config to enable.</span>
      </div>

      <h2 id="read-results">5. Read the result</h2>
      <p>Once the call ends, the full transcript, structured signals, and CRM write-back receipts are available on the call object. Everything is also available via webhook.</p>

      <h3>Response shape</h3>

      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>id</code></td><td><code>string</code></td><td>Globally unique call identifier.</td></tr>
          <tr><td><code>status</code></td><td><code>enum</code></td><td><code>completed</code>, <code>failed</code>, <code>no-answer</code>, <code>voicemail</code>.</td></tr>
          <tr><td><code>duration</code></td><td><code>seconds</code></td><td>Connected, two-way audio time. Billed.</td></tr>
          <tr><td><code>transcript</code></td><td><code>Turn[]</code></td><td>Full diarized transcript with timestamps.</td></tr>
          <tr><td><code>signals</code></td><td><code>Signal[]</code></td><td>Detected intents, sentiment, objections, hand-raise.</td></tr>
          <tr><td><code>outcomes</code></td><td><code>Outcome[]</code></td><td>What the agent did — meetings booked, fields updated.</td></tr>
        </tbody>
      </table>

      <h2 id="next">Where to go next</h2>
      <p>That&apos;s the smallest end-to-end. From here:</p>
      <ul>
        <li><a href="#guardrails">Guardrails</a> — author behavior the way you&apos;d write a memo.</li>
        <li><a href="#evals">Evaluation harness</a> — run agents against synthetic buyers in CI.</li>
        <li><a href="#webhooks">Webhooks</a> — pipe every signal into your stack in real time.</li>
        <li><a href="#observability">Observability</a> — query 200+ signals in the SQL you already know.</li>
      </ul>

      <div className="docs-foot">
        <a className="pager" href="#authentication">
          <div className="lab">← Previous</div>
          <div className="ttl serif">Authentication</div>
        </a>
        <a className="pager next" href="#concepts">
          <div className="lab">Next →</div>
          <div className="ttl serif">Core concepts</div>
        </a>
      </div>
    </article>
  );
}
