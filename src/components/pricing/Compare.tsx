import { Fragment, ReactNode } from 'react';

const sections = [
  { name: 'Capacity', rows: [
    ['Included minutes per month', '2,000', '10,000', 'Custom'],
    ['Concurrent calls', '5', '50', 'Unlimited'],
    ['Active agents', '1', 'Unlimited', 'Unlimited'],
    ['Numbers (DIDs)', '1', '25', 'Unlimited'],
  ]},
  { name: 'Voice & language', rows: [
    ['Base voice library', '✓', '✓', '✓'],
    ['Languages', '2', '31', '31'],
    ['Custom voice cloning', '—', '1 voice', 'Unlimited'],
    ['Voice director session', '—', '—', '✓'],
  ]},
  { name: 'Integrations', rows: [
    ['HubSpot, Pipedrive', '✓', '✓', '✓'],
    ['Salesforce, Attio, Close', '—', '✓', '✓'],
    ['Calendly, Cal.com, Google, Outlook', '✓', '✓', '✓'],
    ['Snowflake / BigQuery streaming', '—', '✓', '✓'],
    ['Custom field mapping', '—', '✓', '✓'],
  ]},
  { name: 'Security & compliance', rows: [
    ['SOC 2 Type II', '✓', '✓', '✓'],
    ['HIPAA / PCI / GDPR', '—', '✓', '✓'],
    ['Single-tenant deployment', '—', '—', '✓'],
    ['Custom data residency', '—', '—', '✓'],
    ['Audit log export', '—', '✓', '✓'],
  ]},
  { name: 'Support', rows: [
    ['Email + Slack', '✓', '✓', '✓'],
    ['Shared Slack channel', '—', '✓', '✓'],
    ['Dedicated solutions architect', '—', '—', '✓'],
    ['Onboarding workshop', '—', '✓', '✓'],
    ['Uptime SLA', '99.5%', '99.9%', '99.99%'],
  ]},
];

function cell(v: string): ReactNode {
  if (v === '✓') return <span className="check">✓</span>;
  if (v === '—') return <span className="dash">—</span>;
  return v;
}

export default function Compare() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Compare plans</span>
          <h2 className="section-title">Read the fine print, <em>without the fine print.</em></h2>
        </div>

        <div className="compare reveal">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Atelier</th>
                <th>Maison</th>
                <th>Sovereign</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s, si) => (
                <Fragment key={`s-${si}`}>
                  <tr className="section-row">
                    <th colSpan={4}>{s.name}</th>
                  </tr>
                  {s.rows.map((r, ri) => (
                    <tr key={`r-${si}-${ri}`}>
                      <td className="lead">{r[0]}</td>
                      <td>{cell(r[1])}</td>
                      <td>{cell(r[2])}</td>
                      <td>{cell(r[3])}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
