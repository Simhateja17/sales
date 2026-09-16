'use client';

import { useEffect, useState } from 'react';
import {
  attachVoiceNumber,
  getCallCredits,
  getVoiceTelephony,
  savePdpcCredentials,
  type VoiceTelephony,
} from '@/lib/api';

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_COPY: Record<VoiceTelephony['phone_number_status'], { label: string; tone: string }> = {
  missing: { label: 'No number connected', tone: 'idle' },
  pending_verification: { label: 'Waiting on verification', tone: 'waiting' },
  attached: { label: 'Connected', tone: 'ok' },
  verified: { label: 'Verified and ready', tone: 'ok' },
  error: { label: 'Could not be connected', tone: 'bad' },
};

export default function VoiceSettingsPanel({ onMessage }: { onMessage: (message: string) => void }) {
  const [telephony, setTelephony] = useState<VoiceTelephony | null>(null);
  const [credits, setCredits] = useState<{ balance_cents: number; lifetime_spent_cents: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [number, setNumber] = useState('');
  const [terminationUri, setTerminationUri] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');

  const [pdpcAccount, setPdpcAccount] = useState('');
  const [pdpcKey, setPdpcKey] = useState('');

  async function refresh() {
    const [telephonyResult, creditResult] = await Promise.all([getVoiceTelephony(), getCallCredits()]);
    setTelephony(telephonyResult.telephony);
    setCredits(creditResult.credits);
    if (telephonyResult.telephony?.from_number) setNumber(telephonyResult.telephony.from_number);
  }

  useEffect(() => { refresh().catch(() => {}); }, []);

  async function connectNumber(event: React.FormEvent) {
    event.preventDefault();
    setBusy('number');
    try {
      const result = await attachVoiceNumber({
        from_number: number,
        termination_uri: terminationUri,
        sip_username: sipUsername || undefined,
        sip_password: sipPassword || undefined,
      });
      setTelephony(result.telephony);
      onMessage(result.verified ? 'Your Singapore number is verified and ready to call.' : 'Number saved.');
      setSipPassword('');
      await refresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Could not connect the number');
    } finally {
      setBusy(null);
    }
  }

  async function connectPdpc(event: React.FormEvent) {
    event.preventDefault();
    setBusy('pdpc');
    try {
      await savePdpcCredentials({ account_id: pdpcAccount, api_key: pdpcKey });
      setPdpcKey('');
      onMessage('Do Not Call account connected.');
      await refresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Could not save the PDPC credentials');
    } finally {
      setBusy(null);
    }
  }

  const status = telephony ? STATUS_COPY[telephony.phone_number_status] : STATUS_COPY.missing;

  return (
    <div className="set-panel voice-settings">
      <section>
        <div className="voice-settings-head">
          <h3>Your Singapore calling number</h3>
          <span className={`voice-pill is-${status.tone}`}>{status.label}</span>
        </div>
        <p className="voice-settings-copy">
          Calls go out from a +65 number registered to your own business, so the person you are calling sees a number
          they can call back and your company stays the one making the call. You buy it on Twilio under your own UEN,
          then point it at us through a SIP trunk.
        </p>
        <ol className="voice-settings-steps">
          <li>Buy a Singapore number on Twilio. It needs a regulatory bundle: business registration, an authorised
            representative with photo ID, and proof of a local address. No PO boxes. Approval usually takes a few days.</li>
          <li>Create an Elastic SIP Trunk in Twilio and point the number at it.</li>
          <li>Paste the number and the trunk&rsquo;s termination URI below.</li>
        </ol>

        {telephony?.last_error ? <p className="voice-settings-error">{telephony.last_error}</p> : null}

        <form onSubmit={connectNumber}>
          <label className="voice-field">
            <span>Singapore number</span>
            <input value={number} onChange={event => setNumber(event.target.value)} placeholder="+65 6123 4567" required />
          </label>
          <label className="voice-field">
            <span>SIP termination URI</span>
            <input value={terminationUri} onChange={event => setTerminationUri(event.target.value)} placeholder="your-trunk.pstn.twilio.com" required />
          </label>
          <div className="voice-settings-grid">
            <label className="voice-field">
              <span>SIP username <em>optional</em></span>
              <input value={sipUsername} onChange={event => setSipUsername(event.target.value)} autoComplete="off" />
            </label>
            <label className="voice-field">
              <span>SIP password <em>optional</em></span>
              <input type="password" value={sipPassword} onChange={event => setSipPassword(event.target.value)} autoComplete="new-password" />
            </label>
          </div>
          <button className="btn-primary" type="submit" disabled={busy === 'number'}>
            {busy === 'number' ? 'Verifying with the provider…' : 'Connect number'}
          </button>
        </form>
      </section>

      <section>
        <div className="voice-settings-head">
          <h3>Do Not Call register</h3>
          <span className={`voice-pill is-${telephony?.pdpc_configured ? 'ok' : 'idle'}`}>
            {telephony?.pdpc_configured ? 'Connected' : 'Not connected'}
          </span>
        </div>
        <p className="voice-settings-copy">
          A PDPC account belongs to one organisation&rsquo;s UEN, so you register your own rather than sharing ours.
          You only need this once your lists contain personal mobile numbers. Calls to company switchboards are
          outside the Do Not Call provisions and cost you nothing to check.
        </p>
        <form onSubmit={connectPdpc}>
          <div className="voice-settings-grid">
            <label className="voice-field">
              <span>DNC account ID</span>
              <input value={pdpcAccount} onChange={event => setPdpcAccount(event.target.value)} required />
            </label>
            <label className="voice-field">
              <span>API key</span>
              <input type="password" value={pdpcKey} onChange={event => setPdpcKey(event.target.value)} autoComplete="new-password" required />
            </label>
          </div>
          <button className="btn-outline" type="submit" disabled={busy === 'pdpc'}>
            {busy === 'pdpc' ? 'Saving…' : 'Connect DNC account'}
          </button>
        </form>
      </section>

      <section>
        <div className="voice-settings-head">
          <h3>Call credits</h3>
          {credits ? <span className="voice-pill is-ok">{money(credits.balance_cents)} left</span> : null}
        </div>
        <p className="voice-settings-copy">
          Calls are paid from prepaid credit, so a campaign pauses when the balance runs out rather than running up a
          bill. Telephony is billed by Twilio directly to your own account; credits cover the AI agent.
          {credits ? ` You have spent ${money(credits.lifetime_spent_cents)} so far.` : ''}
        </p>
        {/* Purchasing runs through the existing billing flow. Until that is
            wired up, credits are granted manually so demos and pilots work. */}
        <p className="voice-settings-note">Contact us to top up while self-serve purchasing is being finished.</p>
      </section>
    </div>
  );
}
