const SIDE = [
  { group: 'Getting started', items: [
    ['quickstart', 'Quickstart'],
    ['authentication', 'Authentication'],
    ['concepts', 'Core concepts'],
  ]},
  { group: 'Building agents', items: [
    ['sdks', 'SDKs'],
    ['guardrails', 'Guardrails'],
    ['voices-api', 'Voices'],
    ['memory', 'Memory & retrieval'],
  ]},
  { group: 'Calls', items: [
    ['outbound', 'Outbound calls'],
    ['inbound', 'Inbound calls'],
    ['transfer', 'Transfers & hand-off'],
    ['recording', 'Recording & transcripts'],
  ]},
  { group: 'Events', items: [
    ['webhooks', 'Webhooks'],
    ['signals', 'Signals & intents'],
    ['streaming', 'Audio streaming'],
  ]},
  { group: 'Operations', items: [
    ['observability', 'Observability'],
    ['evals', 'Evaluation harness'],
    ['rate-limits', 'Rate limits'],
    ['errors', 'Error reference'],
  ]},
];

export default function DocsSidebar({ active = 'quickstart' }: { active?: string }) {
  return (
    <aside className="docs-side">
      {SIDE.map((g, i) => (
        <div key={i} className="group">
          <div className="group-h">{g.group}</div>
          {g.items.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>
          ))}
        </div>
      ))}
    </aside>
  );
}
