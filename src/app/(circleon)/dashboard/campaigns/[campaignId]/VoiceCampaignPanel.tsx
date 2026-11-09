'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Select from '@/components/circleon/Select';
import {
  approveVoiceScript,
  generateVoiceScript,
  getVoiceCalls,
  getVoiceCampaignStatus,
  getVoiceCoverage,
  getVoiceScript,
  getVoices,
  runCampaignDncCheck,
  saveVoiceScript,
  setLeadPhoneType,
  type CallabilityCoverage,
  type Campaign,
  type VoiceCall,
  type VoiceCampaignStatus,
  type VoiceLanguage,
  type VoiceOption,
  type VoiceScript,
  type UnclassifiedNumber,
  type VoiceCampaignLead,
} from '@/lib/api';
import { hhmm } from '../../_lib/ui';

const LANGUAGES: Array<{ code: VoiceLanguage; label: string }> = [
  { code: 'en-US', label: 'English' },
  { code: 'en-GB', label: 'English (British)' },
  { code: 'zh-CN', label: 'Mandarin' },
  { code: 'ms-MY', label: 'Malay' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'hi-IN', label: 'Hindi' },
];

type VoiceTab = 'calls' | 'leads' | 'settings';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Same words as the queue counts at the top of the page.
const TARGET_STATE_LABELS: Record<NonNullable<VoiceCampaignLead['target_state']>, string> = {
  pending: 'To call',
  in_flight: 'On a call',
  completed: 'Worked',
  exhausted: 'No answer',
  blocked: 'Blocked',
};

function dncLabel(lead: VoiceCampaignLead) {
  if (!lead.phone_e164) return '—';
  if (lead.dnc_status === 'blocked') return 'On the register';
  if (lead.voice_consent_status === 'consented') return 'Consented';
  if (lead.phone_type === 'business') return 'Exempt';
  if (lead.dnc_status === 'clear') return 'Clear';
  if (lead.dnc_status === 'pending') return 'Checking';
  if (lead.dnc_status === 'error') return 'Check failed';
  return 'Not checked';
}

function money(cents: number) {
  return `S$${(cents / 100).toFixed(2)}`;
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
function stateCopy(status: VoiceCampaignStatus | null, campaign: Campaign) {
  if (!status) return { tone: 'neutral', headline: 'Loading…', detail: '' };
  const { state, targets } = status;

  if (status.campaign_status === 'completed' || campaign.status === 'completed') {
    const parts = [`${targets.completed} reached`, `${targets.exhausted} no answer`];
    if (targets.blocked) parts.push(`${targets.blocked} blocked`);
    return { tone: 'done', headline: 'Campaign complete', detail: `Every lead has been worked: ${parts.join(', ')}. Call results are in the Calls tab.` };
  }

  if (state.dialing) {
    return { tone: 'live', headline: 'Calling now', detail: `${status.targets.pending} leads left to work.` };
  }

  switch (state.state) {
    case 'waiting_on_setup':
      return { tone: 'waiting', headline: 'Ready, waiting on your number', detail: state.reason || '' };
    case 'needs_setup':
      return { tone: 'blocked', headline: 'Needs your attention', detail: state.reason || '' };
    case 'outside_hours':
      return {
        tone: 'waiting',
        headline: 'Live, outside calling hours',
        detail: `Nothing is dialled until calling opens at ${(campaign.sending_hours_start || '09:00').slice(0, 5)} ${campaign.timezone || 'Asia/Singapore'}.`,
      };
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

export default function VoiceCampaignPanel({ campaign, onStatusChange }: {
  campaign: Campaign;
  onStatusChange?: (status: Campaign['status']) => void;
}) {
  const [script, setScript] = useState<VoiceScript | null>(null);
  const [openingPreview, setOpeningPreview] = useState('');
  const [requiresAttestation, setRequiresAttestation] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [status, setStatus] = useState<VoiceCampaignStatus | null>(null);
  const [coverage, setCoverage] = useState<CallabilityCoverage | null>(null);
  const [warnings, setWarnings] = useState<Array<{ company_domain: string; company_name: string | null }>>([]);
  const [unclassified, setUnclassified] = useState<UnclassifiedNumber[]>([]);
  const [campaignLeads, setCampaignLeads] = useState<VoiceCampaignLead[]>([]);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  // Null until the script loads, because that decides which tab opens first.
  const [tab, setTab] = useState<VoiceTab | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const loadScript = useCallback(async () => {
    const result = await getVoiceScript(campaign.id);
    setScript(result.script);
    setOpeningPreview(result.opening_preview);
    setRequiresAttestation(result.requires_attestation);
    setVoiceId(result.voice_id);
    setAgentStatus(result.agent_status);
    // A script still to approve is the next job; otherwise show the results.
    // Only the first load chooses, so approving does not move the user.
    setTab(current => current ?? (result.script?.status === 'approved' ? 'calls' : 'settings'));
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
    setCampaignLeads(cover.leads || []);
    setCalls(callList.calls);
  }, [campaign.id]);

  useEffect(() => {
    loadScript().catch(loadError => {
      setError(loadError.message);
      setTab(current => current ?? 'calls');
    });
    loadStatus().catch(loadError => setError(loadError.message));
  }, [loadScript, loadStatus]);

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

  const copy = useMemo(() => stateCopy(status, campaign), [status, campaign]);
  const isComplete = campaign.status === 'completed';

  // The last call can finish the campaign while this page is open.
  const liveStatus = status?.campaign_status;
  useEffect(() => {
    if (liveStatus && liveStatus !== campaign.status) onStatusChange?.(liveStatus);
  }, [liveStatus, campaign.status, onStatusChange]);
  const agentFailed = agentStatus === 'error' || Boolean(approveError);

  async function patchScript(patch: Partial<VoiceScript> & { voice_id?: string }) {
    setBusy('save');
    setError(null);
    try {
      await saveVoiceScript(campaign.id, patch);
      // The status panel lists missing script pieces, so refresh it with the script.
      await Promise.all([loadScript(), loadStatus()]);
      setAttested(false);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  // The server withdraws approval on every save, so leaving a field untouched
  // must not save.
  function saveField(field: 'objective' | 'offer' | 'objection_handling' | 'success_criteria', value: string) {
    if (value !== (script?.[field] || '')) patchScript({ [field]: value });
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
    setApproveError(null);
    try {
      await approveVoiceScript(campaign.id, attested);
      await Promise.all([loadScript(), loadStatus()]);
      setNotice('Script approved.');
    } catch (failure) {
      // The script can be approved even when the voice agent could not be
      // prepared, so reload both and show the reason beside the button.
      setApproveError((failure as Error).message);
      await Promise.all([loadScript(), loadStatus()]).catch(() => undefined);
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

  const questions = script?.qualifying_questions || [];
  const leadsNeedAttention = !isComplete && Boolean(unclassified.length || coverage?.needsDncCheck || warnings.length);
  const settingsNeedAttention = !isComplete && script?.status !== 'approved';

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

        {status?.calling_allowed && !status.calling_allowed.ok ? (
          <p className="voice-next-call voice-calling-blocked" role="alert">Calls are on hold: {status.calling_allowed.reason || 'calling is not available for this workspace.'}</p>
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

      <div className="ptabs campaign-review-tabs voice-tabs">
        <button type="button" className={`ptab${tab === 'calls' ? ' active' : ''}`} aria-pressed={tab === 'calls'} onClick={() => setTab('calls')}>
          Calls ({calls.length >= 100 ? '100+' : calls.length})
        </button>
        <button type="button" className={`ptab${tab === 'leads' ? ' active' : ''}`} aria-pressed={tab === 'leads'} onClick={() => setTab('leads')}>
          Leads ({campaignLeads.length}){leadsNeedAttention ? <span className="voice-tab-dot" role="img" aria-label="needs attention" /> : null}
        </button>
        <button type="button" className={`ptab${tab === 'settings' ? ' active' : ''}`} aria-pressed={tab === 'settings'} onClick={() => setTab('settings')}>
          Settings{settingsNeedAttention ? <span className="voice-tab-dot" role="img" aria-label="needs attention" /> : null}
        </button>
      </div>

      {tab === 'leads' && coverage && !isComplete ? (
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

      {tab === 'leads' ? (
        <section className="voice-leads">
          <h3>Leads in this campaign</h3>
          {campaignLeads.length ? (
            <div className="voice-calls-table">
              <table>
                <thead>
                  <tr><th>Lead</th><th>Phone</th><th>Line</th><th>Do Not Call</th><th>Status</th><th>Attempts</th></tr>
                </thead>
                <tbody>
                  {campaignLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.full_name}</strong>
                        <small>{[lead.title, lead.company_name].filter(Boolean).join(' · ')}</small>
                      </td>
                      <td>{lead.phone_e164 || '—'}</td>
                      <td>
                        {lead.phone_e164 ? (
                          <em className={`phone-type-tag is-${lead.phone_type || 'unknown'}`}>
                            {lead.phone_type === 'business' ? 'Business' : lead.phone_type === 'personal' ? 'Personal' : 'Unclassified'}
                          </em>
                        ) : '—'}
                      </td>
                      <td>{dncLabel(lead)}</td>
                      <td>
                        <span className={`voice-outcome is-${lead.target_state || 'not_queued'}`}>
                          {lead.target_state ? TARGET_STATE_LABELS[lead.target_state] : 'Not queued'}
                        </span>
                        {lead.block_reason ? <small>{lead.block_reason}</small> : null}
                      </td>
                      <td>{lead.attempts} of {campaign.max_call_attempts ?? 3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="voice-empty">No leads in this campaign yet.</p>
          )}
        </section>
      ) : null}

      {tab === 'settings' ? (
        <section className="voice-schedule">
          <h3>Calling schedule</h3>
          <dl className="voice-settings-list">
            <div><dt>Calling hours</dt><dd>{hhmm(campaign.sending_hours_start, '09:00')} to {hhmm(campaign.sending_hours_end, '18:00')}</dd></div>
            <div><dt>Time zone</dt><dd>{campaign.timezone || 'Asia/Singapore'}</dd></div>
            <div><dt>Days</dt><dd>{(campaign.active_days?.length ? campaign.active_days : [1, 2, 3, 4, 5]).map(day => DAY_LABELS[day % 7]).join(', ')}</dd></div>
            <div><dt>Daily limit</dt><dd>{campaign.daily_send_cap} calls</dd></div>
            <div><dt>Attempts per lead</dt><dd>{campaign.max_call_attempts ?? 3}</dd></div>
            <div><dt>Time between attempts</dt><dd>{campaign.retry_gap_hours ?? 24} hours</dd></div>
          </dl>
        </section>
      ) : null}

      {tab !== 'settings' || isComplete ? null : (
      <>
      <section className="voice-calendar is-connected">
        <div className="voice-calendar-copy">
          <h3>Booking</h3>
          <p>
            The agent offers open 30 minute times within this campaign&apos;s calling hours and books the meeting while
            the prospect is still on the phone. Bookings appear on your Meetings page.
          </p>
        </div>
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
              <Select
                value={script?.language || 'en-US'}
                onChange={value => patchScript({ language: value as VoiceLanguage })}
                options={LANGUAGES.map(language => ({ value: language.code, label: language.label }))}
              />
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
            <textarea rows={2} defaultValue={script?.objective || ''} onBlur={event => saveField('objective', event.target.value)} />
          </label>
          <label className="voice-field">
            <span>What you offer</span>
            <textarea rows={3} defaultValue={script?.offer || ''} onBlur={event => saveField('offer', event.target.value)} />
          </label>
          <label className="voice-field">
            <span>Qualifying questions <em>one per line, up to four</em></span>
            <textarea
              rows={4}
              defaultValue={questions.join('\n')}
              onBlur={event => {
                const next = event.target.value.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 4);
                if (next.join('\n') !== questions.join('\n')) patchScript({ qualifying_questions: next });
              }}
            />
          </label>
          <label className="voice-field">
            <span>Handling objections</span>
            <textarea rows={3} defaultValue={script?.objection_handling || ''} onBlur={event => saveField('objection_handling', event.target.value)} />
          </label>
          <label className="voice-field">
            <span>What counts as success</span>
            <textarea rows={2} defaultValue={script?.success_criteria || ''} onBlur={event => saveField('success_criteria', event.target.value)} />
          </label>
        </div>

        {voices.length ? (
          <label className="voice-field">
            <span>Voice</span>
            <Select
              value={voiceId || ''}
              onChange={value => patchScript({ voice_id: value })}
              options={[
                { value: '', label: 'Choose a voice' },
                ...voices.map(voice => ({
                  value: voice.voice_id,
                  label: `${voice.name}${voice.accent ? ` · ${voice.accent}` : ''}${voice.gender ? ` · ${voice.gender}` : ''}`,
                })),
              ]}
            />
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
          <p className={script?.status === 'approved' && !agentFailed ? 'is-approved' : ''} role={approveError ? 'alert' : undefined}>
            {script?.status !== 'approved'
              ? 'Not yet approved. Nothing will be called.'
              : agentFailed
                ? `Approved, but the voice agent could not be prepared${approveError ? `: ${approveError}` : '.'} Try again, or contact support if this keeps happening.`
                : 'Approved and ready to dial.'}
          </p>
          <button
            className="btn-primary"
            type="button"
            disabled={busy === 'approve' || !script?.opening_line || (requiresAttestation && !attested) || (script?.status === 'approved' && !agentFailed)}
            onClick={approve}
          >
            {busy === 'approve' ? 'Approving…' : agentFailed ? 'Try again' : 'Approve script'}
          </button>
        </div>
      </section>
      </>
      )}

      {tab === 'calls' ? (
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
      ) : null}

      {error ? <p className="voice-error" role="alert">{error}</p> : null}
      {notice ? <p className="voice-notice">{notice}</p> : null}
    </div>
  );
}
