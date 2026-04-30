export default function CRMSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="two-col">
          <div className="reveal">
            <span className="kicker">CRM &amp; integrations</span>
            <h2 className="section-title">Your stack, <em>spoken to.</em></h2>
            <p className="section-sub">Barsha doesn&apos;t dump transcripts into a notes field. Every call lands as structured data — fields you already use, populated the way your team would have written them.</p>
            <ul className="check-list">
              <li>Native bi-directional sync with Salesforce, HubSpot, Attio, Pipedrive, and Close.</li>
              <li>Custom field mapping per workspace — your taxonomy, not ours.</li>
              <li>Webhooks fire on intent signals: pricing, demo request, churn risk, hand-raise.</li>
              <li>Calendar tools (Calendly, Cal.com, Google, Outlook) for live booking inside the call.</li>
            </ul>
          </div>
          <div className="stack-diag reveal">
            <div className="stack-row"><span className="icon">⌘</span><span className="name">Salesforce</span><span className="meta">bi-directional</span></div>
            <div className="stack-row"><span className="icon">◍</span><span className="name">HubSpot</span><span className="meta">bi-directional</span></div>
            <div className="stack-row"><span className="icon">◇</span><span className="name">Attio</span><span className="meta">bi-directional</span></div>
            <div className="stack-row"><span className="icon">⌗</span><span className="name">Pipedrive</span><span className="meta">bi-directional</span></div>
            <div className="stack-row"><span className="icon">⏵</span><span className="name">Calendly</span><span className="meta">live booking</span></div>
            <div className="stack-row"><span className="icon">◐</span><span className="name">Slack</span><span className="meta">notifications</span></div>
            <div className="stack-row"><span className="icon">✶</span><span className="name">Snowflake</span><span className="meta">streaming</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
