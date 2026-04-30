const items = [
  { name: 'Additional voice clone', desc: 'Clone another rep, support agent, or executive. 90 seconds of audio, deployed in any language.', price: '$2,400 / clone' },
  { name: 'Dedicated number block', desc: 'A pool of 100 local-presence numbers per market. Improves connect rate by 22% on average.', price: '$800 / month' },
  { name: 'Voice director session', desc: 'A 90-minute working session with our voice director to tune warmth, pace, and prosody for your buyer.', price: '$3,500 / session' },
  { name: 'White-glove onboarding', desc: 'A solutions architect runs your first two weeks. Migration, training, guardrails — done by us.', price: '$12,000 one-time' },
  { name: 'Custom integration', desc: 'For homegrown CRMs or unusual stacks. Our integrations team builds and maintains the connector.', price: 'From $9,000' },
  { name: 'Reserved capacity', desc: 'Guaranteed concurrent-call slots during peak hours. For teams running campaigns at scale.', price: 'From $1,500 / month' },
];

export default function Addons() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Add-ons</span>
          <h2 className="section-title">Mix in <em>only what you need.</em></h2>
        </div>
        <div className="addons">
          {items.map((a, i) => (
            <div key={i} className="addon reveal">
              <h4>{a.name}</h4>
              <p>{a.desc}</p>
              <span className="price-tag">{a.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
