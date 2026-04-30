const items = [
  'Salesforce', 'HubSpot', 'Attio', 'Pipedrive', 'Calendly', 'Slack',
  'Twilio', 'Vonage', 'Gong', 'Notion', 'Linear', 'Zapier',
  'Zendesk', 'Intercom', 'Outreach', 'Apollo',
];
const all = [...items, ...items];

export default function Integrations() {
  return (
    <section className="section" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div className="container" style={{ marginBottom: 32 }}>
        <div className="section-head reveal" style={{ marginBottom: 0, textAlign: 'center', marginInline: 'auto' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Plays well with the stack you have</span>
        </div>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {all.map((n, i) => (
            <span key={i} className="logo-mark" style={{ fontSize: 24, opacity: 0.5 }}>
              <span className="glyph" style={{ width: 26, height: 26, fontSize: 12 }}>{n[0]}</span>{n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
