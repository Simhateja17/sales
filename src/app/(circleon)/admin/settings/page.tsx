'use client';

import { Header, LoadState, Status, useAction, useAdmin } from '../_components/ui';

type Settings = Record<string, boolean | string | null>;

const FLAGS: { key: string; label: string; hint: string }[] = [
  { key: 'founding_offer_active', label: 'Founding offer active', hint: 'Shows founding prices at checkout.' },
  { key: 'legal_ready', label: 'Legal ready', hint: 'Only after reviewing Terms, Privacy Policy and Stripe checkout consent.' },
  { key: 'gst_registered', label: 'GST registered', hint: 'Only after registration is confirmed.' },
  { key: 'pdpa_verified', label: 'PDPA verified', hint: 'Compliance claims require completed verification.' },
  { key: 'dnc_verified', label: 'DNC verified', hint: 'Compliance claims require completed verification.' },
];

export default function LaunchSettings() {
  const { data, error, loading, reload } = useAdmin<{ settings: Settings }>('/settings');
  const action = useAction(reload);
  const settings = data?.settings;

  return (
    <>
      <Header title="Launch settings" />
      <LoadState loading={loading && !data} error={error} />
      {settings ? (
        <>
          <section className="adm-card">
            <h2>Offer and compliance</h2>
            {FLAGS.map(f => (
              <label key={f.key} className="adm-toggle">
                <input type="checkbox" checked={Boolean(settings[f.key])} disabled={action.busy} onChange={e => action.run('/settings', 'PATCH', { [f.key]: e.target.checked })} />
                <span><strong>{f.label}</strong><span className="adm-small adm-muted">{f.hint}</span></span>
              </label>
            ))}
          </section>
          <section className="adm-card">
            <h2>Demo booking</h2>
            <form className="adm-form" onSubmit={e => { e.preventDefault(); action.run('/settings', 'PATCH', { demo_url: new FormData(e.currentTarget).get('url') }); }}>
              <label>Booking URL<input type="url" name="url" defaultValue={String(settings.demo_url || '')} placeholder="https://" /></label>
              <button className="adm-btn adm-primary" disabled={action.busy}>Save</button>
            </form>
          </section>
          <Status message={action.message} />
        </>
      ) : null}
    </>
  );
}
