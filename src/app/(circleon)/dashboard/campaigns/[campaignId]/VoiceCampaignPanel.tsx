'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  approveVoiceScript,
  disconnectCalendar,
  generateVoiceScript,
  getCalendarConnection,
  getVoiceCalls,
  getVoiceCampaignStatus,
  getVoiceCoverage,
  getVoiceScript,
  getVoices,
  runCampaignDncCheck,
  saveVoiceScript,
  setLeadPhoneType,
  startCalendarConnect,
  type CallabilityCoverage,
  type Campaign,
  type VoiceCall,
  type VoiceCampaignStatus,
  type VoiceLanguage,
  type VoiceOption,
  type VoiceScript,
  type UnclassifiedNumber,
  type CalendarConnection,
} from '@/lib/api';

const LANGUAGES: Array<{ code: VoiceLanguage; label: string }> = [
  { code: 'en-US', label: 'English' },
  { code: 'en-GB', label: 'English (British)' },
  { code: 'zh-CN', label: 'Mandarin' },
];

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function duration(seconds: number | null) {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function outcomeLabel(call: VoiceCall) {
  const outcome = call.call_outcomes?.[0]?.outcome_type;
  if (!outcome) return call.status.replace(/_/g, ' ');
  return outcome.replace(/_/g, ' ');
}

/** The queue state, in the words a user would use to ask about it. */
function stateCopy(status: VoiceCampaignStatus | null) {
  if (!status) return { tone: 'neutral', headline: 'Loading…', detail: '' };
  const { state } = status;

  if (state.dialing) {
    return { tone: 'live', headline: 'Calling now', detail: `${status.targets.pending} leads left to work.` };
  }

  switch (state.state) {
    case 'waiting_on_setup':
      return { tone: 'waiting', headline: 'Ready, waiting on your number', detail: state.reason || '' };
    case 'needs_setup':
      return { tone: 'blocked', headline: 'Needs your attention', detail: state.reason || '' };
    case 'outside_hours':
      return { tone: 'waiting', headline: 'Outside calling hours', detail: state.reason || '' };
    case 'daily_cap':
      return { tone: 'waiting', headline: 'Daily cap reached', detail: 'Calling resumes tomorrow morning.' };
    case 'out_of_credits':
      return { tone: 'blocked', headline: 'Out of call credits', detail: 'Top up to resume this campaign.' };
    case 'awaiting_retry':
      return { tone: 'waiting', headline: 'Waiting on the next retry', detail: state.reason || '' };
    case 'finished':
      return { tone: 'done', headline: 'Every lead worked', detail: 'Nothing left in the queue.' };
    case 'paused':
      return { tone: 'waiting', headline: 'Paused', detail: 'Resume to start calling again.' };
    default:
      return { tone: 'neutral', headline: 'Not calling', detail: state.reason || '' };
  }
}

export default function VoiceCampaignPanel({ campaign }: { campaign: Campaign }) {
  const [script, setScript] = useState<VoiceScript | null>(null);
  const [openingPreview, setOpeningPreview] = useState('');
  const [requiresAttestation, setRequiresAttestation] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [status, setStatus] = useState<VoiceCampaignStatus | null>(null);
  const [coverage, setCoverage] = useState<CallabilityCoverage | null>(null);
  const [warnings, setWarnings] = useState<Array<{ company_domain: string; company_name: string | null }>>([]);
  const [unclassified, setUnclassified] = useState<UnclassifiedNumber[]>([]);
  const [calendar, setCalendar] = useState<CalendarConnection | null>(null);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadScript = useCallback(async () => {
    const result = await getVoiceScript(campaign.id);
    setScript(result.script);
    setOpeningPreview(result.opening_preview);
    setRequiresAttestation(result.requires_attestation);
    setVoiceId(result.voice_id);
  }, [campaign.id]);

  const loadStatus = useCallback(async () => {
    const [state, cover, callList] = await Promise.all([
      getVoiceCampaignStatus(campaign.id),
      getVoiceCoverage(campaign.id),
      getVoiceCalls(campaign.id),
    ]);
    setStatus(state);
    setCoverage(cover.coverage);
    setWarnings(cover.company_warnings);
    setUnclassified(cover.unclassified);
    setCalls(callList.calls);
  }, [campaign.id]);

  const loadCalendar = useCallback(async () => {
    const result = await getCalendarConnection();
    setCalendar(result.calendar);
  }, []);

  useEffect(() => {
    loadScript().catch(loadError => setError(loadError.message));
    loadStatus().catch(loadError => setError(loadError.message));
    loadCalendar().catch(() => setCalendar(null));
  }, [loadCalendar, loadScript, loadStatus]);

  // Poll only while the campaign is actually running.
  useEffect(() => {
    if (campaign.status !== 'active') return undefined;
    const timer = window.setInterval(() => { loadStatus().catch(() => {}); }, 20000);
    return () => window.clearInterval(timer);
  }, [campaign.status, loadStatus]);

  useEffect(() => {
    if (!script?.language) return;
    getVoices(script.language).then(result => setVoices(result.voices)).catch(() => setVoices([]));
  }, [script?.language]);

  const copy = useMemo(() => stateCopy(status), [status]);

  async function patchScript(patch: Partial<VoiceScript> & { voice_id?: string }) {
    setBusy('save');
    setError(null);
    try {
      await saveVoiceScript(campaign.id, patch);
      await loadScript();
      setAttested(false);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function draftScript() {
    setBusy('generate');
    setError(null);
    try {
      const result = await generateVoiceScript(campaign.id, script?.language || 'en-US');
      setScript(result.script);
      setSuggestion(result.suggested_opening_line);
      await loadScript();
    } catch (generateError) {
      setError((generateError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    setBusy('approve');
    setError(null);
    try {
      await approveVoiceScript(campaign.id, attested);
      await Promise.all([loadScript(), loadStatus()]);
      setNotice('Script approved. Your agent is ready.');
    } catch (approveError) {
      setError((approveError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function checkDnc() {
    setBusy('dnc');
    setError(null);
    try {
      const result = await runCampaignDncCheck(campaign.id);
      setNotice(result.message || `Checked ${result.checked} numbers. ${result.blocked} are on the register.`);
      await loadStatus();
    } catch (dncError) {
      setError((dncError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function classify(leadId: string, phoneType: 'business' | 'personal') {
    setError(null);
    // Drop it from the list immediately; the user has answered the question.
    setUnclassified(current => current.filter(item => item.id !== leadId));
    try {
      await setLeadPhoneType(leadId, phoneType);
      await loadStatus();
    } catch (classifyError) {
      setError((classifyError as Error).message);
      await loadStatus();
    }
  }

  async function connectCalendar() {
    setBusy('calendar');
    setError(null);
    try {
      const { url } = await startCalendarConnect();
      window.location.href = url;
    } catch (connectError) {
      setError((connectError as Error).message);
      setBusy(null);
    }
  }

  async function removeCalendar() {
    setBusy('calendar');
    try {
      await disconnectCalendar();
      await loadCalendar();
    } catch (removeError) {
      setError((removeError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const questions = script?.qualifying_questions || [];

  return (
    <div className="voice-panel">
      {/* The queue, explained. Nearly every "why is nothing happening" question
          is answered by one of these five numbers. */}
      <section className={`voice-status voice-status-${copy.tone}`}>
        <div className="voice-status-head">
          <div>
            <p className="voice-eyebrow">Campaign status</p>
            <h3>{copy.headline}</h3>
            {copy.detail ? <p className="voice-status-detail">{copy.detail}</p> : null}
          </div>
          {status ? (
            <dl className="voice-status-credits">
              <div><dt>Spent</dt><dd>{money(status.credits.spent_on_campaign_cents)}</dd></div>
              {status.monthly ? null : <div><dt>Credits left</dt><dd>{money(status.credits.balance_cents)}</dd></div>}
            </dl>
          ) : null}
        </div>

        {status ? (
          <ul className="voice-queue-counts">
            <li><strong>{status.targets.pending}</strong><span>To call</span></li>
            <li><strong>{status.targets.in_flight}</strong><span>On a call</span></li>
            <li><strong>{status.targets.completed}</strong><span>Worked</span></li>
            <li><strong>{status.targets.exhausted}</strong><span>No answer</span></li>
            <li><strong>{status.targets.blocked}</strong><span>Blocked</span></li>
          </ul>
        ) : null}

        {status?.next_attempt_at ? (
          <p className="voice-next-call">Next call scheduled for {new Date(status.next_attempt_at).toLocaleString()}.</p>
        ) : null}

        {status?.state.blockers?.length ? (
          <ul className="voice-blockers">
            {status.state.blockers.map(blocker => (
              <li key={blocker.key} className={blocker.waiting ? 'is-waiting' : 'is-blocking'}>
                <strong>{blocker.label}</strong>
                <span>{blocker.reason}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {coverage ? (
        <section className="voice-coverage">
          <h3>Who can be called</h3>
          <ul>
            <li><strong>{coverage.callableNow}</strong><span>Callable now</span></li>
            <li><strong>{coverage.business}</strong><span>Business lines</span></li>
            <li><strong>{coverage.personal}</strong><span>Personal numbers</span></li>
            <li><strong>{coverage.needsDncCheck}</strong><span>Need a DNC check</span></li>
          </ul>
          <p className="voice-coverage-note">
            Business lines sit outside Singapore&rsquo;s Do Not Call provisions, so only personal numbers are checked
            against the register.
          </p>
          {unclassified.length ? (
            <div className="voice-classify">
              <strong>We could not tell whether {unclassified.length === 1 ? 'this number is' : 'these numbers are'} a company line or a personal one.</strong>
              <p>Unclassified numbers are treated as personal and checked against the register, which costs a credit each. Tell us which is which and we will skip the company lines.</p>
              <ul>
                {unclassified.map(item => (
                  <li key={item.id}>
                    <span>
                      <strong>{item.full_name}</strong>
                      <small>{[item.company_name, item.phone_e164].filter(Boolean).join(' · ')}</small>
                    </span>
                    <span className="voice-classify-actions">
                      <button type="button" onClick={() => classify(item.id, 'business')}>Company line</button>
                      <button type="button" onClick={() => classify(item.id, 'personal')}>Personal</button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {coverage.needsDncCheck > 0 ? (
            <button className="btn-outline" type="button" disabled={busy === 'dnc'} onClick={checkDnc}>
              {busy === 'dnc' ? 'Checking…' : `Check ${coverage.needsDncCheck} personal numbers`}
            </button>
          ) : null}
          {warnings.length ? (
            <div className="voice-warning">
              <strong>Someone at {warnings.length === 1 ? 'one of these companies' : `${warnings.length} of these companies`} has asked not to be called.</strong>
              <p>{warnings.map(warning => warning.company_name || warning.company_domain).join(', ')}. Their colleagues are still in this campaign, so decide whether to keep them.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Without a calendar the agent can only promise to send a link, which
          ends the conversation instead of booking it. */}
      <section className={`voice-calendar${calendar?.status === 'connected' ? ' is-connected' : ''}`}>
        <div className="voice-calendar-copy">
          <h3>Booking</h3>
          {calendar?.status === 'connected' ? (
            <p>
              Connected to <strong>{calendar.account_email || 'your Google Calendar'}</strong>. The agent offers real open
              times from {calendar.booking_hours_start.slice(0, 5)} to {calendar.booking_hours_end.slice(0, 5)} and books
              a {calendar.slot_minutes} minute meeting during the call.
            </p>
          ) : (
            <p>
              Connect a calendar and the agent offers genuine open times and books the meeting while the prospect is
              still on the phone. Without one it can only offer to email a booking link, which is a much weaker call.
            </p>
          )}
          {calendar?.last_error ? <p className="voice-calendar-error">{calendar.last_error}</p> : null}
        </div>
        {calendar?.status === 'connected' ? (
          <button className="btn-outline" type="button" disabled={busy === 'calendar'} onClick={removeCalendar}>
            {busy === 'calendar' ? 'Working…' : 'Disconnect'}
          </button>
        ) : (
          <button className="btn-primary" type="button" disabled={busy === 'calendar'} onClick={connectCalendar}>
            {busy === 'calendar' ? 'Opening Google…' : 'Connect Google Calendar'}
          </button>
        )}
      </section>

      <section className="voice-script">
        <div className="voice-script-head">
          <div>
            <h3>Call script</h3>
            <p>Review every line before anything is dialled. Editing the script withdraws its approval.</p>
          </div>
          <div className="voice-script-actions">
            <label className="voice-field voice-field-inline">
              <span>Language</span>
              <select
                value={script?.language || 'en-US'}
                onChange={event => patchScript({ language: event.target.value as VoiceLanguage })}
              >
                {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
              </select>
            </label>
            <button className="btn-outline" type="button" disabled={busy === 'generate'} onClick={draftScript}>
              {busy === 'generate' ? 'Drafting…' : script?.objective ? 'Redraft' : 'Draft with AI'}
            </button>
          </div>
        </div>

        {/* The opening line is the one field we never generate into. */}
        <div className="voice-opening">
          <label className="voice-field">
            <span>Opening line <em>you write this</em></span>
            <textarea
              rows={2}
              defaultValue={script?.opening_line || ''}
              placeholder="I am calling because we help teams like yours follow up faster. Do you have two minutes?"
              onBlur={event => {
                if (event.target.value !== (script?.opening_line || '')) patchScript({ opening_line: event.target.value });
              }}
            />
          </label>
          {suggestion ? (
            <p className="voice-suggestion">
              Suggested: &ldquo;{suggestion}&rdquo;
              <button type="button" onClick={() => patchScript({ opening_line: suggestion })}>Use this</button>
            </p>
          ) : null}
          <div className="voice-preview">
            <strong>What the prospect hears first</strong>
            <p>{openingPreview || '—'}</p>
            <small>The AI disclosure and recording notice are always spoken first and cannot be removed.</small>
          </div>
        </div>

        <div className="voice-fields">
          <label className="voice-field">
            <span>Objective</span>
            <textarea rows={2} defaultValue={script?.objective || ''} onBlur={event => patchScript({ objective: event.target.value })} />
          </label>
          <label className="voice-field">
            <span>What you offer</span>
            <textarea rows={3} defaultValue={script?.offer || ''} onBlur={event => patchScript({ offer: event.target.value })} />
          </label>
          <label className="voice-field">
            <span>Qualifying questions <em>one per line, up to four</em></span>
            <textarea
              rows={4}
              defaultValue={questions.join('\n')}
              onBlur={event => patchScript({
                qualifying_questions: event.target.value.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 4),
              })}
            />
          </label>
          <label className="voice-field">
            <span>Handling objections</span>
            <textarea rows={3} defaultValue={script?.objection_handling || ''} onBlur={event => patchScript({ objection_handling: event.target.value })} />
          </label>
          <label className="voice-field">
            <span>What counts as success</span>
            <textarea rows={2} defaultValue={script?.success_criteria || ''} onBlur={event => patchScript({ success_criteria: event.target.value })} />
          </label>
        </div>

        {voices.length ? (
          <label className="voice-field">
            <span>Voice</span>
            <select value={voiceId || ''} onChange={event => patchScript({ voice_id: event.target.value })}>
              <option value="">Choose a voice</option>
              {voices.map(voice => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}{voice.accent ? ` · ${voice.accent}` : ''}{voice.gender ? ` · ${voice.gender}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {voiceId && voices.find(voice => voice.voice_id === voiceId)?.preview_url ? (
          <audio className="voice-preview-audio" controls src={voices.find(voice => voice.voice_id === voiceId)?.preview_url || undefined}>
            Your browser cannot play this preview.
          </audio>
        ) : null}

        {requiresAttestation ? (
          <label className="voice-attestation">
            <input type="checkbox" checked={attested} onChange={event => setAttested(event.target.checked)} />
            <span>
              I have read this {LANGUAGES.find(language => language.code === script?.language)?.label} script and approve it
              being spoken to prospects on behalf of my company.
            </span>
          </label>
        ) : null}

        <div className="voice-script-footer">
          <p className={script?.status === 'approved' ? 'is-approved' : ''}>
            {script?.status === 'approved' ? 'Approved and ready to dial.' : 'Not yet approved. Nothing will be called.'}
          </p>
          <button
            className="btn-primary"
            type="button"
            disabled={busy === 'approve' || !script?.opening_line || (requiresAttestation && !attested) || script?.status === 'approved'}
            onClick={approve}
          >
            {busy === 'approve' ? 'Approving…' : 'Approve script'}
          </button>
        </div>
      </section>

      <section className="voice-calls">
        <h3>Calls</h3>
        {calls.length ? (
          <div className="voice-calls-table">
            <table>
              <thead>
                <tr><th>Lead</th><th>Outcome</th><th>Attempt</th><th>Length</th><th>Cost</th><th>Recording</th></tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr key={call.id}>
                    <td>
                      <strong>{call.leads?.full_name || call.to_number}</strong>
                      <small>{call.leads?.company_name || ''}</small>
                    </td>
                    <td><span className={`voice-outcome is-${call.call_outcomes?.[0]?.outcome_type || call.status}`}>{outcomeLabel(call)}</span></td>
                    <td>{call.attempt_number}</td>
                    <td>{duration(call.duration_seconds)}</td>
                    <td>{call.credit_charged_cents ? money(call.credit_charged_cents) : '—'}</td>
                    <td>{call.recording_url ? <a href={call.recording_url} target="_blank" rel="noreferrer">Listen</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="voice-empty">No calls yet. They will appear here as the campaign works through its list.</p>
        )}
      </section>

      {error ? <p className="voice-error" role="alert">{error}</p> : null}
      {notice ? <p className="voice-notice">{notice}</p> : null}
    </div>
  );
}
