'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getSingleCall,
  getSingleCallOptions,
  setLeadVoiceConsent,
  startSingleCall,
  type SingleCall,
  type SingleCallLead,
  type SingleCallOptions,
} from '@/lib/api';
import { callResultLabel, callStage, formatCallTime, minutesUsed, resultStillArriving } from '../_lib/singleCall';

const CONFIRMATION = 'I confirm this person may lawfully be contacted for this call, and that my organisation is the sender and is responsible for complying with the PDPA Do Not Call Provisions and other applicable laws. I understand that this screening is not legal advice or a guarantee of compliance.';

const STEPS = [['dialling', 'Dialling'], ['on_call', 'On a call'], ['ended', 'Call ended']] as const;

interface Props {
  onClose: () => void;
  onOpenCampaigns?: () => void;
  onCallsChanged: () => void;
  onViewCall: (callId: string) => void;
}

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CallLeadModal({ onClose, onOpenCampaigns, onCallsChanged, onViewCall }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SingleCallOptions | null>(null);
  const [lead, setLead] = useState<SingleCallLead | null>(null);
  const [campaignId, setCampaignId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [askConsent, setAskConsent] = useState<string>('');
  const [call, setCall] = useState<SingleCall | null>(null);
  const [busy, setBusy] = useState(false);
  const [placing, setPlacing] = useState<'now' | 'schedule'>('now');
  const [error, setError] = useState('');
  const [endedFor, setEndedFor] = useState(0);

  const loadOptions = useCallback(async (search: string) => {
    const data = await getSingleCallOptions(search);
    setOptions(data);
    setCampaignId(current => current || data.default_campaign_id || '');
    return data;
  }, []);

  // Search as the user types, without a request for every key.
  useEffect(() => {
    if (call) return undefined;
    const timer = window.setTimeout(() => {
      loadOptions(query).then(() => setError('')).catch(failure => setError(message(failure, 'Could not load your leads.')));
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [query, call, loadOptions]);

  // The call carries on if this window closes, so Escape is always safe.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const callId = call?.id;
  const status = call?.status;
  const stage = status ? callStage(status) : null;
  const waiting = Boolean(call && resultStillArriving(call, endedFor));
  const keepPolling = stage === 'dialling' || stage === 'on_call' || waiting;

  useEffect(() => {
    if (!callId || !keepPolling) return undefined;
    const timer = window.setInterval(() => {
      getSingleCall(callId).then(data => setCall(data.call)).catch(() => undefined);
      setEndedFor(current => (callStage(status || '') === 'ended' ? current + 3 : current));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [callId, status, keepPolling]);

  // The list behind this window should show the result as soon as there is one.
  useEffect(() => {
    if (stage === 'ended' || stage === 'failed') onCallsChanged();
  }, [stage, waiting, onCallsChanged]);

  const script = useMemo(() => options?.scripts.find(item => item.campaign_id === campaignId) || null, [options, campaignId]);
  const usableScripts = options?.scripts.filter(item => !item.problem) || [];
  const blockedReason = options && !options.calling_allowed.ok ? options.calling_allowed.reason : script?.problem;

  async function recordConsent(target: SingleCallLead) {
    setBusy(true);
    setError('');
    try {
      await setLeadVoiceConsent(target.id, 'consented');
      setAskConsent('');
      const data = await loadOptions(query);
      const updated = data.leads.find(item => item.id === target.id);
      if (updated?.callable) setLead(updated);
    } catch (failure) {
      setError(message(failure, 'Could not record their consent.'));
    } finally {
      setBusy(false);
    }
  }

  async function place(when: 'now' | 'schedule') {
    if (!lead || !script || !confirmed) return;
    setPlacing(when);
    setBusy(true);
    setError('');
    try {
      const data = await startSingleCall({ lead_id: lead.id, campaign_id: script.campaign_id, confirmed: true, ...(when === 'schedule' ? { schedule: true } : { call_now: !script.window_open }) });
      setCall(data.call);
      onCallsChanged();
    } catch (failure) {
      setError(message(failure, 'The call could not be placed.'));
      // The hours or the lead may have changed since this window opened.
      loadOptions(query).catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  const title = call ? (stage === 'scheduled' ? 'Call scheduled' : lead?.full_name || 'Call') : lead ? 'Confirm the call' : 'Call a lead';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!busy) onClose(); }}>
      <section className="modal-card cl-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => event.stopPropagation()}>
        <div className="card-head">
          <div>
            <div className="card-title">{title}</div>
            {!call && !lead ? <div className="sf-hint" style={{ marginTop: 4 }}>Your AI agent calls one person, once, with a script you have approved.</div> : null}
          </div>
          <button className="btn-outline" type="button" onClick={onClose} disabled={busy}>Close</button>
        </div>

        {error ? <div className="pdpa-banner cl-error" role="alert">{error}</div> : null}

        {call ? (
          <CallProgress call={call} stage={stage} waiting={waiting} timeZone={script?.timezone || 'Asia/Singapore'} onViewCall={onViewCall} />
        ) : lead && script ? (
          <div className="cl-confirm">
            <dl className="cl-facts">
              <div><dt>Calling</dt><dd>{lead.full_name}{lead.company_name ? `, ${lead.company_name}` : ''}<small>{lead.phone}</small></dd></div>
              <div><dt>From</dt><dd>{options?.from_number || 'No number connected'}</dd></div>
            </dl>

            <label className="mb-field">
              Script
              <select className="sf-inp" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                {options?.scripts.map(item => (
                  <option key={item.campaign_id} value={item.campaign_id} disabled={Boolean(item.problem)}>{item.name}{item.problem ? ' (not ready)' : ''}</option>
                ))}
              </select>
            </label>
            {script.opening_line ? <p className="cl-opening"><span>Opening line</span>{script.opening_line}</p> : null}

            {lead.queued_in ? <p className="cl-note">This person is also waiting for a call in “{lead.queued_in}”. That campaign will still call them unless you pause it.</p> : null}
            {blockedReason ? <p className="cl-note cl-note-block" role="alert">{blockedReason}</p> : null}
            {!script.window_open ? (
              <p className="cl-note">
                This is outside this script&apos;s calling hours.{script.next_open_at ? ` They open at ${formatCallTime(script.next_open_at, script.timezone)}.` : ''} Calling immediately rings this person now.
              </p>
            ) : null}

            <label className="voice-attestation cl-attest">
              <input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />
              <span>{CONFIRMATION}</span>
            </label>

            <div className="mb-foot">
              <button className="btn-outline" type="button" disabled={busy} onClick={() => { setLead(null); setConfirmed(false); setError(''); }}>Back</button>
              {script.window_open ? (
                <button className="btn-primary" type="button" disabled={busy || !confirmed || Boolean(blockedReason)} onClick={() => place('now')}>{busy ? 'Calling...' : 'Call now'}</button>
              ) : (
                <div className="mb-actions">
                  <button className="btn-outline" type="button" disabled={busy || !confirmed || Boolean(blockedReason)} onClick={() => place('now')}>{busy && placing === 'now' ? 'Calling...' : 'Call immediately'}</button>
                  <button className="btn-primary" type="button" disabled={busy || !confirmed || Boolean(blockedReason) || !options?.scheduling_available || !script.next_open_at} onClick={() => place('schedule')}>
                    {busy && placing === 'schedule' ? 'Scheduling...' : script.next_open_at ? `Schedule for ${formatCallTime(script.next_open_at, script.timezone)}` : 'Schedule'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : options && !usableScripts.length ? (
          <div className="cl-empty">
            <p><b>You need an approved script first.</b> Your agent only says what you have approved. Write and approve one in a voice campaign, and it will appear here.</p>
            {onOpenCampaigns ? <button className="btn-primary" type="button" onClick={onOpenCampaigns}>Go to campaigns</button> : null}
          </div>
        ) : (
          <div className="cl-pick">
            <input className="sf-inp" type="search" autoFocus placeholder="Search by name, company or number" aria-label="Search leads" value={query} onChange={event => setQuery(event.target.value)} />
            <div className="cl-leads">
              {!options ? <p className="sf-hint cl-pad">{error ? 'Leads could not be loaded.' : 'Loading leads…'}</p> : null}
              {options && !options.leads.length ? <p className="sf-hint cl-pad">{query ? 'No leads with a phone number match this search.' : 'None of your leads has a phone number yet.'}</p> : null}
              {options?.leads.map(item => (
                <div key={item.id} className={`cl-lead${item.callable ? '' : ' is-blocked'}`}>
                  <button type="button" disabled={!item.callable} onClick={() => { setLead(item); setError(''); }}>
                    <b>{item.full_name}</b>
                    <small>{[item.company_name, item.phone].filter(Boolean).join(' · ')}</small>
                    {item.reason ? <em>{item.reason}</em> : null}
                  </button>
                  {item.can_record_consent ? (
                    askConsent === item.id ? (
                      <span className="cl-consent">
                        <small>Only confirm this if they agreed to be called.</small>
                        <button className="consent-btn" type="button" disabled={busy} onClick={() => recordConsent(item)}>They agreed</button>
                        <button className="consent-btn" type="button" disabled={busy} onClick={() => setAskConsent('')}>Cancel</button>
                      </span>
                    ) : (
                      <button className="consent-btn" type="button" onClick={() => setAskConsent(item.id)}>Record consent</button>
                    )
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CallProgress({ call, stage, waiting, timeZone, onViewCall }: {
  call: SingleCall;
  stage: ReturnType<typeof callStage> | null;
  waiting: boolean;
  timeZone: string;
  onViewCall: (callId: string) => void;
}) {
  if (stage === 'scheduled') {
    return (
      <div className="cl-result">
        <p className="cl-headline">{call.scheduled_for ? formatCallTime(call.scheduled_for, timeZone) : 'Scheduled'}</p>
        <p className="sf-hint">Your agent calls then, after checking this person can still be called. You can close this window, and cancel from the Calls page.</p>
        <button className="btn-outline" type="button" onClick={() => onViewCall(call.id)}>View on the Calls page</button>
      </div>
    );
  }

  const position = STEPS.findIndex(([key]) => key === stage);
  const live = stage === 'dialling' || stage === 'on_call';

  return (
    <div className="cl-result" aria-live="polite">
      {stage !== 'failed' ? (
        <ol className="cl-steps">
          {STEPS.map(([key, label], index) => (
            <li key={key} className={index < position ? 'is-done' : index === position ? 'is-now' : ''}>{label}</li>
          ))}
        </ol>
      ) : null}

      {live ? <p className="sf-hint">{stage === 'dialling' ? 'Waiting for them to pick up.' : 'Your agent is talking to them now.'} You can close this window. The call carries on and appears on the Calls page.</p> : null}

      {!live ? (
        <>
          <p className="cl-headline">{callResultLabel(call)}</p>
          {call.error_message ? <p className="cl-note cl-note-block">{call.error_message}</p> : null}
          {call.meetings?.starts_at ? <p className="cl-meeting">Meeting on {formatCallTime(call.meetings.starts_at, timeZone)}</p> : null}
          {call.summary || call.outcome_summary ? <p className="cl-summary">{call.summary || call.outcome_summary}</p> : null}
          {waiting ? <p className="sf-hint">Writing up the call summary…</p> : null}
          {call.next_action ? <p className="calls-next"><b>Next step:</b> {call.next_action}</p> : null}
          {stage === 'ended' && call.duration_seconds ? <p className="sf-hint">{minutesUsed(call.duration_seconds)} of your AI minutes used.</p> : null}
          <button className="btn-primary" type="button" onClick={() => onViewCall(call.id)}>View transcript and recording</button>
        </>
      ) : null}
    </div>
  );
}
