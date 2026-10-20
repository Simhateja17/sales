'use client';

import { useEffect, useState } from 'react';
import {
  attachVoiceNumber,
  connectTwilioAccount,
  connectTwilioNumber,
  getBillingStatus,
  getCallCredits,
  getTwilioNumbers,
  getVoiceTelephony,
  savePdpcCredentials,
  type TwilioNumber,
  type VoiceTelephony,
} from '@/lib/api';

function money(cents: number) {
  return `S$${(cents / 100).toFixed(2)}`;
}

// Retell accepting the number is not proof that real calls work, so a
// registered number reads as "test call pending" until an operator verifies it.
const STATUS_COPY: Record<VoiceTelephony['phone_number_status'], { label: string; tone: string }> = {
  missing: { label: 'No number connected', tone: 'idle' },
  pending_verification: { label: 'Connecting', tone: 'waiting' },
  attached: { label: 'Registered, test call pending', tone: 'waiting' },
  verified: { label: 'Tested and ready', tone: 'ok' },
  error: { label: 'Could not be connected', tone: 'bad' },
};

export default function VoiceSettingsPanel({ onMessage }: { onMessage: (message: string) => void }) {
  const [telephony, setTelephony] = useState<VoiceTelephony | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [credits, setCredits] = useState<{ balance_cents: number; lifetime_spent_cents: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [numbers, setNumbers] = useState<TwilioNumber[] | null>(null);
  const [selectedNumber, setSelectedNumber] = useState('');

  const [showManual, setShowManual] = useState(false);
  const [number, setNumber] = useState('');
  const [terminationUri, setTerminationUri] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');

  const [pdpcAccount, setPdpcAccount] = useState('');
  const [pdpcKey, setPdpcKey] = useState('');

  async function loadNumbers() {
    const result = await getTwilioNumbers();
    setNumbers(result.numbers);
    setSelectedNumber(current => current || result.numbers[0]?.sid || '');
  }

  async function refresh() {
    const [telephonyResult, creditResult, billingResult] = await Promise.all([
      getVoiceTelephony(),
      getCallCredits(),
      getBillingStatus().catch(() => null),
    ]);
    setTelephony(telephonyResult.telephony);
    setIsOwner(telephonyResult.is_owner);
    setCredits(creditResult.credits);
    setMonthly(Boolean(billingResult?.billing?.plan?.includes('_')));
    if (telephonyResult.telephony?.from_number) setNumber(telephonyResult.telephony.from_number);
    if (telephonyResult.telephony?.twilio_account_sid) setAccountSid(telephonyResult.telephony.twilio_account_sid);
    if (telephonyResult.is_owner && telephonyResult.telephony?.twilio_connected) await loadNumbers().catch(() => {});
  }

  useEffect(() => { refresh().catch(() => {}); }, []);

  async function connectAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy('account');
    try {
      const result = await connectTwilioAccount({ account_sid: accountSid, auth_token: authToken });
      setTelephony(result.telephony);
      setAuthToken('');
      onMessage(`Connected Twilio account ${result.account.friendly_name}.`);
      await loadNumbers();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Could not connect the Twilio account');
    } finally {
      setBusy(null);
    }
  }

  async function connectSelectedNumber(event: React.FormEvent) {
    event.preventDefault();
    setBusy('number');
    try {
      const result = await connectTwilioNumber(selectedNumber);
      setTelephony(result.telephony);
      onMessage('Number registered. Place a test call before relying on it.');
      await refresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Could not connect the number');
      await refresh().catch(() => {});
    } finally {
      setBusy(null);
    }
  }

  async function connectManualNumber(event: React.FormEvent) {
    event.preventDefault();
    setBusy('manual');
    try {
      const result = await attachVoiceNumber({
        from_number: number,
        termination_uri: terminationUri,
        sip_username: sipUsername || undefined,
        sip_password: sipPassword || undefined,
      });
      setTelephony(result.telephony);
      onMessage('Number registered. Place a test call before relying on it.');
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
  const twilioConnected = Boolean(telephony?.twilio_connected);

  return (
    <div className="set-panel voice-settings">
      <section>
        <div className="voice-settings-head">
          <h3>Your Singapore calling number</h3>
          <span className={`voice-pill is-${status.tone}`}>{status.label}</span>
        </div>
        <p className="voice-settings-copy">
          Calls go out from a +65 number registered to your own business, so the person you are calling sees a number
          they can call back and your company stays the one making the call. The number lives in your own Twilio
          account: Twilio bills you directly for the number and carrier minutes.
        </p>
        <ol className="voice-settings-steps">
          <li>Buy a Singapore number on Twilio. It needs a regulatory bundle: business registration, an authorised
            representative with photo ID, and proof of a local address. No PO boxes. Approval usually takes a few days.</li>
          <li>Connect your Twilio account below with its Account SID and Auth Token, found on the Twilio Console home page.</li>
          <li>Choose the number. We create a SIP trunk on your account for outgoing calls and route incoming calls
            through CircleOn, so your fallback number answers whenever the AI cannot.</li>
        </ol>

        {telephony?.from_number && telephony.phone_number_status !== 'missing' ? (
          <p className="voice-settings-note">Connected number: {telephony.from_number}</p>
        ) : null}
        {telephony?.last_error ? <p className="voice-settings-error">{telephony.last_error}</p> : null}

        {!isOwner ? (
          <p className="voice-settings-note">Only the workspace owner can connect Twilio and choose the calling number.</p>
        ) : (
          <>
            <form onSubmit={connectAccount}>
              <div className="voice-settings-grid">
                <label className="voice-field">
                  <span>Twilio Account SID</span>
                  <input value={accountSid} onChange={event => setAccountSid(event.target.value)} placeholder="AC…" autoComplete="off" required />
                </label>
                <label className="voice-field">
                  <span>Auth Token</span>
                  <input
                    type="password"
                    value={authToken}
                    onChange={event => setAuthToken(event.target.value)}
                    placeholder={twilioConnected ? 'Saved. Enter again to replace' : ''}
                    autoComplete="new-password"
                    required
                  />
                </label>
              </div>
              <button className={twilioConnected ? 'btn-outline' : 'btn-primary'} type="submit" disabled={busy === 'account'}>
                {busy === 'account' ? 'Checking with Twilio…' : twilioConnected ? 'Update Twilio account' : 'Connect Twilio account'}
              </button>
            </form>

            {twilioConnected ? (
              numbers && numbers.length === 0 ? (
                <p className="voice-settings-note">
                  This Twilio account has no Singapore voice numbers yet. Once one is approved, it will appear here.
                </p>
              ) : (
                <form onSubmit={connectSelectedNumber}>
                  <label className="voice-field">
                    <span>Singapore number</span>
                    <select value={selectedNumber} onChange={event => setSelectedNumber(event.target.value)} required>
                      {(numbers || []).map(item => (
                        <option key={item.sid} value={item.sid}>
                          {item.phone_number}{item.friendly_name && item.friendly_name !== item.phone_number ? ` · ${item.friendly_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="btn-primary" type="submit" disabled={busy === 'number' || !selectedNumber}>
                    {busy === 'number' ? 'Configuring Twilio and Retell…' : 'Use this number'}
                  </button>
                </form>
              )
            ) : null}

            <button type="button" className="btn-link" onClick={() => setShowManual(value => !value)}>
              {showManual ? 'Hide manual SIP setup' : 'I configured my own SIP trunk'}
            </button>
            {showManual ? (
              <form onSubmit={connectManualNumber}>
                <p className="voice-settings-copy">
                  For a trunk you built yourself. Point the number&rsquo;s incoming Voice webhook at CircleOn yourself;
                  otherwise inbound calls skip your plan limits and fallback.
                </p>
                <label className="voice-field">
                  <span>Singapore number</span>
                  <input value={number} onChange={event => setNumber(event.target.value)} placeholder="+65 6123 4567" required />
                </label>
                <label className="voice-field">
                  <span>SIP termination URI</span>
                  <input value={terminationUri} onChange={event => setTerminationUri(event.target.value)} placeholder="your-trunk.pstn.singapore.twilio.com" required />
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
                <button className="btn-outline" type="submit" disabled={busy === 'manual'}>
                  {busy === 'manual' ? 'Registering…' : 'Register number'}
                </button>
              </form>
            ) : null}
          </>
        )}
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

      {monthly ? (
        <section>
          <div className="voice-settings-head">
            <h3>Call minutes</h3>
          </div>
          <p className="voice-settings-copy">
            AI voice minutes come from your monthly plan allowance, within the spending cap you set in Billing. New
            calls stop at the cap; a call already connected is allowed to finish. If you use up the allowance, prepaid
            call credit covers further calls. Twilio bills you directly for the number and carrier minutes.
          </p>
        </section>
      ) : (
        <section>
          <div className="voice-settings-head">
            <h3>Call credits</h3>
            {credits ? <span className={`voice-pill is-${credits.balance_cents <= 0 ? 'bad' : credits.balance_cents < 500 ? 'waiting' : 'ok'}`}>{money(credits.balance_cents)} left</span> : null}
          </div>
          <p className="voice-settings-copy">
            Your plan has no included AI minutes, so calls are paid from prepaid credit. A campaign pauses when the balance runs out rather than running up a
            bill. Telephony is billed by Twilio directly to your own account; credits cover the AI agent.
            {credits ? ` You have spent ${money(credits.lifetime_spent_cents)} so far.` : ''}
          </p>
          {/* Purchasing runs through the existing billing flow. Until that is
              wired up, credits are granted manually so demos and pilots work. */}
          <p className="voice-settings-note">Self-serve top-ups are coming soon. <a href="/support">Ask us to add credit</a> and we will do it within one business day.</p>
        </section>
      )}
    </div>
  );
}
