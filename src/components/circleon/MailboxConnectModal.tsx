'use client';
import { useEffect, useState } from 'react';
import { connectSmtp, testSmtp, type ConnectedAccount } from '@/lib/api';

// Connect a sending mailbox without leaving the current page (e.g. from a
// campaign that cannot launch yet). Mirrors Settings > Email account.

type Provider = 'gmail' | 'outlook' | 'manual';

const PRESETS: Record<Exclude<Provider, 'manual'>, { smtp_host: string; smtp_port: number; imap_host: string; imap_port: number }> = {
  gmail: { smtp_host: 'smtp.gmail.com', smtp_port: 587, imap_host: 'imap.gmail.com', imap_port: 993 },
  outlook: { smtp_host: 'smtp.office365.com', smtp_port: 587, imap_host: 'outlook.office365.com', imap_port: 993 },
};

const HELP: Record<Provider, string[]> = {
  gmail: [
    'Turn on two-step verification for your Google account.',
    'Create an app password for Mail (Google Account, Security, App passwords) and paste it below.',
  ],
  outlook: [
    'Use an app password if your organisation requires multi-factor sign-in.',
    'If verification fails, ask your Microsoft 365 admin to enable authenticated SMTP and IMAP for this mailbox.',
  ],
  manual: [
    'Copy the SMTP and IMAP hosts and ports from your email provider.',
    'SMTP port 587 normally uses TLS; IMAP commonly uses port 993.',
  ],
};

export function isMailboxReady(account: ConnectedAccount | null | undefined) {
  return Boolean(account?.smtp_verified_at && account?.imap_verified_at);
}

interface Props {
  account: ConnectedAccount | null;
  onClose: () => void;
  onConnected: (account: ConnectedAccount) => void;
}

export default function MailboxConnectModal({ account, onClose, onConnected }: Props) {
  const [provider, setProvider] = useState<Provider>('gmail');
  const [form, setForm] = useState({
    from_email: account?.from_email || '',
    from_name: account?.from_name || '',
    password: '',
    ...PRESETS.gmail,
  });
  const [busy, setBusy] = useState<'' | 'connect' | 'test'>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  function pickProvider(next: Provider) {
    setProvider(next);
    setForm(current => next === 'manual'
      ? { ...current, smtp_host: '', imap_host: '' }
      : { ...current, ...PRESETS[next] });
  }

  // The parent closes the modal once the mailbox is fully verified.
  function finish(next: ConnectedAccount) {
    onConnected(next);
    if (isMailboxReady(next)) return;
    setError(`Saved, but ${next.smtp_verified_at ? 'inbox (IMAP)' : 'sending (SMTP)'} could not be verified yet. Check the details and app password, then try again.`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('connect');
    setError('');
    try {
      const data = await connectSmtp({
        from_email: form.from_email.trim(),
        from_name: form.from_name.trim(),
        reply_to_email: '',
        smtp_host: form.smtp_host.trim(),
        smtp_port: Number(form.smtp_port),
        smtp_username: form.from_email.trim(),
        smtp_password: form.password,
        imap_host: form.imap_host.trim(),
        imap_port: Number(form.imap_port),
        imap_username: form.from_email.trim(),
        imap_password: form.password,
      });
      finish(data.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect the mailbox.');
    } finally {
      setBusy('');
    }
  }

  async function handleTest() {
    setBusy('test');
    setError('');
    try {
      const data = await testSmtp();
      finish(data.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed.');
    } finally {
      setBusy('');
    }
  }

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm(current => ({ ...current, [key]: key.endsWith('_port') ? Number(event.target.value) : event.target.value }));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!busy) onClose(); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-label="Connect your mailbox" style={{ width: 'min(560px, 100%)' }} onMouseDown={event => event.stopPropagation()}>
        <div className="card-head">
          <div>
            <div className="card-title">Connect your mailbox</div>
            <div className="sf-hint" style={{ marginTop: 4 }}>Campaign emails are sent from this address, and replies are read from its inbox.</div>
          </div>
          <button className="btn-outline" type="button" onClick={onClose} disabled={Boolean(busy)}>Close</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          <div className="view-switch" role="group" aria-label="Email provider">
            {(['gmail', 'outlook', 'manual'] as Provider[]).map(option => (
              <button key={option} type="button" className={`rs-pill${provider === option ? ' is-active' : ''}`} aria-pressed={provider === option} onClick={() => pickProvider(option)}>
                {option === 'gmail' ? 'Gmail' : option === 'outlook' ? 'Outlook' : 'Other'}
              </button>
            ))}
          </div>
          <ol className="sf-hint" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            {HELP[provider].map(step => <li key={step}>{step}</li>)}
          </ol>
          <label className="mb-field">Email address<input className="sf-inp" type="email" value={form.from_email} onChange={set('from_email')} placeholder="you@company.com" autoComplete="email" required /></label>
          <label className="mb-field">Your name<input className="sf-inp" value={form.from_name} onChange={set('from_name')} placeholder="Jane Tan" required /><small>Shown to recipients</small></label>
          <label className="mb-field">App password<input className="sf-inp" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder={provider === 'gmail' ? '16-character app password' : 'App password'} required /><small>Encrypted before storage. Used for both sending and reading replies.</small></label>
          <details className="lead-source-details" open={provider === 'manual'}>
            <summary>Server settings{provider !== 'manual' ? ' (filled in for you)' : ''}</summary>
            <div className="mb-grid mb-grid-port" style={{ marginTop: 10 }}>
              <label className="mb-field">SMTP host<input className="sf-inp" value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.example.com" required /></label>
              <label className="mb-field">Port<input className="sf-inp" type="number" value={form.smtp_port} onChange={set('smtp_port')} required /></label>
            </div>
            <div className="mb-grid mb-grid-port" style={{ marginTop: 10 }}>
              <label className="mb-field">IMAP host<input className="sf-inp" value={form.imap_host} onChange={set('imap_host')} placeholder="imap.example.com" required /></label>
              <label className="mb-field">Port<input className="sf-inp" type="number" value={form.imap_port} onChange={set('imap_port')} required /></label>
            </div>
          </details>
          {error ? <p role="alert" className="sf-hint" style={{ color: '#b42318', margin: 0 }}>{error}</p> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            {account ? <button className="btn-outline" type="button" disabled={Boolean(busy)} onClick={handleTest}>{busy === 'test' ? 'Testing…' : 'Test saved mailbox'}</button> : null}
            <button className="btn-primary" type="submit" disabled={Boolean(busy)}>{busy === 'connect' ? 'Connecting and verifying…' : 'Connect mailbox'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
