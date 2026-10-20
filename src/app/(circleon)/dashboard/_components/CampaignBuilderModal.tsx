'use client';

import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { setLeadVoiceConsent, type AgentConfig, type CampaignBrief, type CampaignSequenceStep, type ConnectedAccount, type Lead } from '@/lib/api';

type CampaignDraft = {
  name: string;
  channel: 'email' | 'voice';
  max_call_attempts: number;
  retry_gap_hours: number;
  daily_send_cap: number;
  sending_hours_start: string;
  sending_hours_end: string;
  timezone: string;
  cadence_per_hour: number;
  active_days: number[];
  lead_source: 'apollo' | 'csv' | 'manual';
};

type StepPurpose = 'personalized_intro' | 'new_angle' | 'proof_point' | 'objection' | 'gentle_close';
type DesignerStep = {
  id: string;
  name: string;
  delay_days: number;
  purpose: StepPurpose;
  focus: string;
  attachment: File | null;
};

const initialCampaign: CampaignDraft = {
  name: '', channel: 'email', max_call_attempts: 3, retry_gap_hours: 24,
  daily_send_cap: 40, sending_hours_start: '09:00', sending_hours_end: '17:30',
  timezone: 'Asia/Singapore', cadence_per_hour: 25, active_days: [1, 2, 3, 4, 5], lead_source: 'apollo',
};

// A lead can join an email campaign if we can email it, and a voice campaign if
// we can legally call it. Those are different lists, and a list that makes a
// good email campaign is often half unusable for voice.
function isLeadEligible(lead: Lead, channel: 'email' | 'voice') {
  if (lead.lifecycle_status === 'suppressed' || lead.dnc_status === 'blocked') return false;
  if (channel === 'voice') return Boolean(lead.phone_e164 || lead.phone) || needsPhoneLookup(lead);
  return Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status);
}

// Apollo leads come with an email only; adding one to a voice campaign asks
// Apollo for its phone number, which arrives a little later.
function needsPhoneLookup(lead: Lead) {
  return !lead.phone_e164 && !lead.phone && lead.source === 'apollo' && Boolean(lead.external_id);
}

// Business lines are outside Singapore's Do Not Call provisions. Personal
// numbers need a PDPC check before the first call, so the user should see the
// split before they launch rather than discover it afterwards.
function callableCoverage(leads: Lead[]) {
  const withPhone = leads.filter(lead => Boolean(lead.phone_e164 || lead.phone));
  const business = withPhone.filter(lead => lead.phone_type === 'business');
  const personal = withPhone.filter(lead => lead.phone_type !== 'business');
  const cleared = personal.filter(lead => lead.dnc_status === 'clear' || lead.voice_consent_status === 'consented');
  return {
    lookups: leads.filter(needsPhoneLookup).length,
    withPhone: withPhone.length,
    callableNow: business.length + cleared.length,
    needsCheck: personal.length - cleared.length,
  };
}

const FALLBACK_TIMEZONES = ['Asia/Singapore', 'Asia/Kolkata', 'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'America/Los_Angeles', 'America/Chicago', 'America/New_York', 'Pacific/Auckland'];
const TIMEZONES = typeof Intl !== 'undefined' && typeof (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf === 'function'
  ? (Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone')
  : FALLBACK_TIMEZONES;

function timezoneLabel(timezone: string) {
  return timezone.replace(/_/g, ' ').replace(/\//g, ' / ');
}

const purposeCopy: Record<StepPurpose, { label: string; name: string; instruction: string }> = {
  personalized_intro: {
    label: 'A personalized introduction', name: 'First touch',
    instruction: 'Write a concise first email using one factual company insight, the campaign offer, and a simple invitation to talk.',
  },
  new_angle: {
    label: 'A new useful angle', name: 'Follow-up',
    instruction: 'Write a brief follow-up that adds one useful new angle without repeating the first email.',
  },
  proof_point: {
    label: 'A relevant proof point', name: 'Relevant proof',
    instruction: 'Write a concise follow-up that offers a relevant proof point or practical example without inventing facts.',
  },
  objection: {
    label: 'A thoughtful objection response', name: 'Useful follow-up',
    instruction: 'Write a short follow-up that addresses a likely concern with a useful, low-pressure perspective.',
  },
  gentle_close: {
    label: 'A gentle final close', name: 'Final note',
    instruction: 'Write a polite final follow-up with a low-pressure close and no repeated company facts.',
  },
};

function defaultSteps(count: number): DesignerStep[] {
  const blueprint: Array<[StepPurpose, number]> = [
    ['personalized_intro', 0], ['new_angle', 3], ['proof_point', 7], ['objection', 11], ['new_angle', 15], ['gentle_close', 20],
  ];
  const selected = blueprint.slice(0, Math.max(1, Math.min(6, count)));
  if (selected.length > 1) selected[selected.length - 1] = ['gentle_close', selected[selected.length - 1][1]];
  return selected.map(([purpose, delay_days], index) => ({
    id: `${purpose}-${index}-${delay_days}`,
    name: purposeCopy[purpose].name,
    delay_days,
    purpose,
    focus: '',
    attachment: null,
  }));
}

function toSequenceSteps(steps: DesignerStep[]): CampaignSequenceStep[] {
  return steps.map((step, index) => ({
    step_number: index + 1,
    name: step.name.trim() || purposeCopy[step.purpose].name,
    delay_days: Math.max(0, Number(step.delay_days) || 0),
    ai_instruction: `${purposeCopy[step.purpose].instruction}${step.focus.trim() ? ` Focus on: ${step.focus.trim()}` : ''}`,
  }));
}

export type CampaignBuilderSubmission = {
  campaign: CampaignDraft;
  brief: Pick<CampaignBrief, 'campaign_angle' | 'cta' | 'tone' | 'proof' | 'language' | 'signature' | 'sector'>;
  leadIds: string[];
  steps: CampaignSequenceStep[];
  attachments: Array<{ stepNumber: number; file: File }>;
};

export default function CampaignBuilderModal({
  open, leads, agentConfig, mailboxAccount, initialLeadIds = [], maxSteps = 6, isSubmitting, onClose, onSubmit,
}: {
  open: boolean;
  leads: Lead[];
  agentConfig: AgentConfig | null;
  mailboxAccount: Pick<ConnectedAccount, 'from_name' | 'from_email'> | null;
  initialLeadIds?: string[];
  maxSteps?: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (submission: CampaignBuilderSubmission) => void;
}) {
  const [campaign, setCampaign] = useState<CampaignDraft>(initialCampaign);
  const [steps, setSteps] = useState<DesignerStep[]>(() => defaultSteps(maxSteps===4?4:3));
  const [brief, setBrief] = useState<Pick<CampaignBrief, 'campaign_angle' | 'cta' | 'tone' | 'proof' | 'language' | 'signature' | 'sector'>>({ campaign_angle: '', cta: '', tone: '', proof: '', language: 'English', signature: '', sector: '' });
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadFilter, setLeadFilter] = useState('');
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  // Consent recorded here is saved on the lead, but the parent list only refreshes
  // after the modal closes, so overlay it locally for the coverage count.
  const [consents, setConsents] = useState<Record<string, Lead['voice_consent_status']>>({});
  const [consentBusy, setConsentBusy] = useState<string | null>(null);
  const [consentError, setConsentError] = useState('');
  const effectiveLeads = useMemo(() => leads.map(lead => consents[lead.id] ? { ...lead, voice_consent_status: consents[lead.id] } : lead), [consents, leads]);

  async function recordConsent(lead: Lead) {
    if (!window.confirm(`Has ${lead.full_name} agreed to receive calls from your business at ${lead.phone_e164 || lead.phone}? Only confirm if you hold that consent; you are responsible for keeping a record of it.`)) return;
    setConsentBusy(lead.id); setConsentError('');
    try {
      const { lead: saved } = await setLeadVoiceConsent(lead.id, 'consented');
      setConsents(current => ({ ...current, [lead.id]: saved.voice_consent_status }));
    } catch (error) {
      setConsentError(error instanceof Error ? error.message : 'Could not record consent.');
    } finally { setConsentBusy(null); }
  }

  useEffect(() => {
    if (!open) return;
    const eligibleIds = new Set(leads.filter(lead => isLeadEligible(lead, 'email')).map(lead => lead.id));
    setCampaign(initialCampaign);
    setSteps(defaultSteps(maxSteps===4?4:3));
    const mailboxSignature = [mailboxAccount?.from_name, mailboxAccount?.from_email].filter(Boolean).join('\n');
    setBrief({ campaign_angle: '', cta: agentConfig?.booking_link || '', tone: agentConfig?.tone || '', proof: '', language: 'English', signature: mailboxSignature, sector: '' });
    setSelectedLeadIds(initialLeadIds.filter(id => eligibleIds.has(id)));
    setLeadFilter('');
    setDraggedStepIndex(null);
    setDropTargetIndex(null);
    setTimezoneOpen(false);
    setTimezoneSearch('');
  }, [agentConfig?.booking_link, agentConfig?.tone, initialLeadIds, leads, mailboxAccount?.from_email, mailboxAccount?.from_name, open]);

  const visibleLeads = useMemo(() => {
    const query = leadFilter.trim().toLowerCase();
    const eligible = effectiveLeads.filter(lead => isLeadEligible(lead, campaign.channel));
    if (!query) return eligible;
    return eligible.filter(lead => [lead.full_name, lead.company_name, lead.title, lead.email, lead.phone_e164].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [campaign.channel, leadFilter, effectiveLeads]);

  const isVoice = campaign.channel === 'voice';
  const coverage = useMemo(
    () => callableCoverage(effectiveLeads.filter(lead => selectedLeadIds.includes(lead.id))),
    [effectiveLeads, selectedLeadIds],
  );
  const allVisibleSelected = Boolean(visibleLeads.length) && visibleLeads.every(lead => selectedLeadIds.includes(lead.id));
  const visibleTimezones = useMemo(() => {
    const query = timezoneSearch.trim().toLowerCase();
    if (!query) return TIMEZONES.slice(0, 80);
    return TIMEZONES.filter(timezone => `${timezone} ${timezoneLabel(timezone)}`.toLowerCase().includes(query)).slice(0, 80);
  }, [timezoneSearch]);

  if (!open) return null;

  function updateStep(index: number, patch: Partial<DesignerStep>) {
    setSteps(current => current.map((step, itemIndex) => itemIndex === index ? { ...step, ...patch } : step));
  }

  function moveStepTo(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= steps.length || targetIndex >= steps.length) return;
    setSteps(current => {
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function handleStepDragStart(event: DragEvent<HTMLElement>, index: number) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDraggedStepIndex(index);
    setDropTargetIndex(index);
  }

  function handleStepDrop(event: DragEvent<HTMLElement>, targetIndex: number) {
    event.preventDefault();
    const sourceIndex = draggedStepIndex ?? Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(sourceIndex)) moveStepTo(sourceIndex, targetIndex);
    setDraggedStepIndex(null);
    setDropTargetIndex(null);
  }

  function setStepCount(count: number) {
    setSteps(defaultSteps(count));
  }

  function addStep() {
    setSteps(current => {
      const next = [...current];
      const finalIndex = next.map(step => step.purpose).lastIndexOf('gentle_close');
      const insertAt = finalIndex >= 0 ? finalIndex : next.length;
      const prior = next[Math.max(0, insertAt - 1)];
      next.splice(insertAt, 0, {
        id: `manual-${Date.now()}`,
        name: purposeCopy.new_angle.name,
        delay_days: Math.max(1, (prior?.delay_days || 0) + 4),
        purpose: 'new_angle',
        focus: '',
        attachment: null,
      });
      return next;
    });
  }

  function toggleAllVisibleLeads() {
    const visibleIds = new Set(visibleLeads.map(lead => lead.id));
    setSelectedLeadIds(current => allVisibleSelected ? current.filter(id => !visibleIds.has(id)) : [...new Set([...current, ...visibleIds])]);
  }

  return (
    <div className="modal-backdrop campaign-builder-backdrop" role="presentation" onMouseDown={() => !isSubmitting && onClose()}>
      <section className="campaign-builder" role="dialog" aria-modal="true" aria-labelledby="campaign-builder-title" onMouseDown={event => event.stopPropagation()}>
        <header className="campaign-builder-head">
          <div><p>NEW CAMPAIGN</p><h2 id="campaign-builder-title">{isVoice ? 'Build a call worth answering.' : 'Build a considered outreach sequence.'}</h2></div>
          <button className="campaign-builder-close" type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close campaign builder">×</button>
        </header>

        <div className="campaign-builder-body">
          <section className="campaign-builder-section campaign-builder-basics">
            <div className="campaign-builder-section-head"><span>01</span><div><h3>Campaign details</h3><p>Set practical sending rules once.</p></div></div>
            <div className="campaign-channel-picker" role="radiogroup" aria-label="Campaign channel">
              {([
                { value: 'email' as const, title: 'Email campaign', copy: 'A written sequence, drafted per lead.' },
                { value: 'voice' as const, title: 'Voice campaign', copy: 'An AI agent calls and books meetings.' },
              ]).map(option => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={campaign.channel === option.value}
                  className={campaign.channel === option.value ? 'is-selected' : ''}
                  onClick={() => { setCampaign(current => ({ ...current, channel: option.value })); setSelectedLeadIds([]); }}
                >
                  <strong>{option.title}</strong>
                  <small>{option.copy}</small>
                </button>
              ))}
            </div>
            <label className="campaign-builder-field campaign-builder-field-wide"><span>Campaign name</span><input autoFocus value={campaign.name} onChange={event => setCampaign(current => ({ ...current, name: event.target.value }))} placeholder="Q3 founder outreach" /></label>
            <div className="campaign-builder-grid">
              <label className="campaign-builder-field"><span>{isVoice ? 'Daily call cap' : 'Daily send cap'}</span><input type="number" min="1" max="300" value={campaign.daily_send_cap} onChange={event => setCampaign(current => ({ ...current, daily_send_cap: Number(event.target.value) }))} /></label>
              {isVoice
                ? <label className="campaign-builder-field"><span>Attempts per lead</span><input type="number" min="1" max="10" value={campaign.max_call_attempts} onChange={event => setCampaign(current => ({ ...current, max_call_attempts: Number(event.target.value) }))} /></label>
                : <label className="campaign-builder-field"><span>Emails per hour</span><input type="number" min="1" max="100" value={campaign.cadence_per_hour} onChange={event => setCampaign(current => ({ ...current, cadence_per_hour: Number(event.target.value) }))} /></label>}
              <label className="campaign-builder-field"><span>Start</span><input type="time" value={campaign.sending_hours_start} onChange={event => setCampaign(current => ({ ...current, sending_hours_start: event.target.value }))} /></label>
              <label className="campaign-builder-field"><span>End</span><input type="time" value={campaign.sending_hours_end} onChange={event => setCampaign(current => ({ ...current, sending_hours_end: event.target.value }))} /></label>
            </div>
            <div className="campaign-builder-field campaign-builder-field-wide campaign-timezone-field"><span>Campaign timezone</span><div className="campaign-timezone-picker"><button className="campaign-timezone-trigger" type="button" aria-haspopup="listbox" aria-expanded={timezoneOpen} onClick={() => setTimezoneOpen(current => !current)}><span>{campaign.timezone}</span><b>▾</b></button>{timezoneOpen ? <div className="campaign-timezone-menu" role="listbox"><input autoFocus aria-label="Search timezones" value={timezoneSearch} onChange={event => setTimezoneSearch(event.target.value)} placeholder="Search city or timezone…" />{visibleTimezones.map(timezone => <button key={timezone} type="button" role="option" aria-selected={campaign.timezone === timezone} className={campaign.timezone === timezone ? 'is-selected' : ''} onClick={() => { setCampaign(current => ({ ...current, timezone })); setTimezoneOpen(false); setTimezoneSearch(''); }}><strong>{timezoneLabel(timezone)}</strong><small>{timezone}</small></button>)}{!visibleTimezones.length ? <p className="campaign-timezone-empty">No matching timezones.</p> : null}</div> : null}</div><small className="campaign-builder-timezone-hint">The sending window follows this timezone, including daylight-saving changes where applicable.</small></div>
            <div className="campaign-brief-panel">
              <strong>Campaign brief</strong>
              <p>CircleOn starts with your onboarding context{agentConfig?.company_name ? ` for ${agentConfig.company_name}` : ''} and saves these campaign choices as a snapshot.</p>
              <label className="campaign-builder-field"><span>Specific angle (optional)</span><input value={brief.campaign_angle} onChange={event => setBrief(current => ({ ...current, campaign_angle: event.target.value }))} placeholder="e.g. help founder-led teams tighten follow-up" /></label>
              <label className="campaign-builder-field"><span>Call to action</span><input value={brief.cta} onChange={event => setBrief(current => ({ ...current, cta: event.target.value }))} placeholder="Book a short call" /></label>
              <label className="campaign-builder-field"><span>Campaign tone</span><input value={brief.tone} onChange={event => setBrief(current => ({ ...current, tone: event.target.value }))} placeholder="Warm, concise, direct" /></label>
              <label className="campaign-builder-field"><span>Proof or offer context (optional)</span><input value={brief.proof} onChange={event => setBrief(current => ({ ...current, proof: event.target.value }))} placeholder="A verified case study, offer, or useful angle" /></label>
              <label className="campaign-builder-field"><span>Language</span><input value={brief.language} onChange={event => setBrief(current => ({ ...current, language: event.target.value }))} placeholder="English" /></label>
              <label className="campaign-builder-field"><span>Sector (optional context)</span><input value={brief.sector} onChange={event => setBrief(current => ({ ...current, sector: event.target.value }))} placeholder="Leave blank for a general campaign" /></label>
              <label className="campaign-builder-field campaign-builder-field-wide"><span>Signature</span><textarea className="campaign-builder-textarea" value={brief.signature} onChange={event => setBrief(current => ({ ...current, signature: event.target.value }))} placeholder="Prefilled from the connected mailbox; edit if needed" /></label>
            </div>
          </section>

          <section className="campaign-builder-section">
            <div className="campaign-builder-section-head"><span>02</span><div><h3>{isVoice ? 'Callable leads' : 'Verified leads'}</h3><p>{isVoice ? 'Leads with a phone number, plus Apollo leads whose number we can look up.' : 'Only work-email leads can enter a campaign.'}</p></div><strong>{selectedLeadIds.length} selected</strong></div>
            {isVoice && selectedLeadIds.length ? (
              <p className="campaign-coverage-note">
                <strong>{coverage.callableNow}</strong> of {selectedLeadIds.length} selected can be called right away.
                {coverage.needsCheck > 0
                  ? ` ${coverage.needsCheck} ${coverage.needsCheck === 1 ? 'is a personal number that needs' : 'are personal numbers that need'} a Do Not Call check or recorded consent first.`
                  : ' Business lines are exempt from the Do Not Call register.'}
                {coverage.lookups > 0 ? ` We will look up ${coverage.lookups === 1 ? 'a phone number' : `${coverage.lookups} phone numbers`} with Apollo; they appear on the campaign within a few minutes.` : ''}
                {selectedLeadIds.length - coverage.withPhone - coverage.lookups > 0 ? ` ${selectedLeadIds.length - coverage.withPhone - coverage.lookups} have no phone number.` : ''}
              </p>
            ) : null}
            {consentError ? <p className="campaign-coverage-note" role="alert">{consentError}</p> : null}
            <div className="campaign-lead-controls"><input aria-label="Search verified leads" value={leadFilter} onChange={event => setLeadFilter(event.target.value)} placeholder="Search name, company, title…" /><button type="button" onClick={toggleAllVisibleLeads}>{allVisibleSelected ? 'Clear visible' : 'Select visible'}</button></div>
            <div className="campaign-builder-leads">
              {visibleLeads.map(lead => <label key={lead.id} className="campaign-builder-lead-row">
                <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => setSelectedLeadIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])} />
                <span className="campaign-builder-avatar">{lead.full_name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
                <span><strong>{lead.full_name}</strong><small>{lead.title ? `${lead.title} · ` : ''}{lead.company_name || 'Company unavailable'} · {isVoice ? (lead.phone_e164 || lead.phone || 'Phone lookup') : lead.email}</small></span>
                {isVoice && !needsPhoneLookup(lead) && lead.phone_type !== 'business' && lead.dnc_status !== 'clear' ? (
                  lead.voice_consent_status === 'consented'
                    ? <em className="phone-type-tag is-business">Consented</em>
                    : <button type="button" className="consent-btn" disabled={consentBusy === lead.id} onClick={event => { event.preventDefault(); recordConsent(lead); }}>{consentBusy === lead.id ? 'Saving…' : 'Record consent'}</button>
                ) : null}
                {isVoice
                  ? <em className={`phone-type-tag is-${lead.phone_type || 'unknown'}`}>{lead.phone_type === 'business' ? 'Business' : lead.phone_type === 'personal' ? 'Personal' : 'Unclassified'}</em>
                  : <em>Fit {lead.fit_score || 0}</em>}
              </label>)}
              {!visibleLeads.length ? <p className="campaign-builder-empty">{isVoice ? 'No leads with a phone number match this search.' : 'No verified work-email leads match this search.'}</p> : null}
            </div>
          </section>

          {isVoice ? (
          <section className="campaign-builder-section">
            <div className="campaign-builder-section-head"><span>03</span><div><h3>The call</h3><p>Write the script on the next screen, where you can review every line before anything is dialled.</p></div></div>
            <div className="campaign-voice-explainer">
              <p>Your agent opens by saying it is an AI calling on behalf of {agentConfig?.company_name || 'your company'}, and that the call is recorded. That part is fixed and cannot be edited away.</p>
              <p>It then gives a short pitch, offers real times from your calendar, and books the meeting. It does not sell, negotiate, or work objections, and calls stay under two minutes.</p>
              <ul>
                <li><strong>You write the opening line.</strong> It is the sentence the call lives or dies on, so we draft a suggestion and you decide.</li>
                <li><strong>Attempts are spread across the day.</strong> {campaign.max_call_attempts} tries, at least a business day apart, at different times so you sample their day.</li>
                <li><strong>Calling starts when your Singapore number clears.</strong> Build everything now; nothing dials until the number is verified.</li>
              </ul>
            </div>
          </section>
          ) : (
          <section className="campaign-builder-section">
            <div className="campaign-builder-section-head"><span>03</span><div><h3>Email sequence</h3><p>CircleOn creates a distinct draft for every lead and every step. You can edit all drafts before launch.</p></div></div>
            <div className="campaign-sequence-controls"><label className="campaign-builder-field"><span>Emails in this sequence</span><select value={steps.length} onChange={event => setStepCount(Number(event.target.value))}>{Array.from({length:maxSteps},(_,i)=>i+1).map(count => <option key={count} value={count}>{count} email{count === 1 ? '' : 's'}</option>)}</select></label><p>Changing the structure regenerates the recommended plan. Drag cards to set the sending order.</p></div>
            <div className="campaign-steps">
              {steps.map((step, index) => <article key={step.id} draggable className={`campaign-step${draggedStepIndex === index ? ' is-dragging' : ''}${dropTargetIndex === index && draggedStepIndex !== index ? ' is-drop-target' : ''}`} onDragStart={event => handleStepDragStart(event, index)} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; if (draggedStepIndex !== index) setDropTargetIndex(index); }} onDrop={event => handleStepDrop(event, index)} onDragEnd={() => { setDraggedStepIndex(null); setDropTargetIndex(null); }}>
                <div className="campaign-step-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="campaign-step-fields">
                  <div className="campaign-step-topline"><button className="campaign-step-drag-handle" type="button" aria-label={`Drag ${step.name || `step ${index + 1}`} to reorder`} title="Drag to reorder">⠿</button><label><span>Step name</span><input value={step.name} onChange={event => updateStep(index, { name: event.target.value })} /></label><label><span>{index === 0 ? 'Send' : 'Delay'}</span><div className="campaign-delay-input"><input type="number" min="0" value={step.delay_days} onChange={event => updateStep(index, { delay_days: Number(event.target.value) })} /><i>{index === 0 ? 'days' : 'days after'}</i></div></label></div>
                  <div className="campaign-step-plan"><label><span>CircleOn will do</span><select value={step.purpose} onChange={event => { const purpose = event.target.value as StepPurpose; updateStep(index, { purpose, name: step.name === purposeCopy[step.purpose].name ? purposeCopy[purpose].name : step.name }); }} >{Object.entries(purposeCopy).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}</select></label><label><span>Optional focus</span><input value={step.focus} onChange={event => updateStep(index, { focus: event.target.value })} placeholder="e.g. highlight fast onboarding" /></label></div>
                  <p className="campaign-step-preview">{purposeCopy[step.purpose].instruction}</p>
                  <label className="campaign-step-attachment"><span>Attachment (optional)</span><input type="file" accept="application/pdf,image/png,image/jpeg,image/webp,video/mp4,video/quicktime" onChange={event => updateStep(index, { attachment: event.target.files?.[0] || null })} /><small>{step.attachment ? `${step.attachment.name} · ${(step.attachment.size / 1024 / 1024).toFixed(1)} MB` : 'PDF, image, or video · up to 10 MB'}</small></label>
                  <div className="campaign-step-actions"><button type="button" disabled={index === 0} onClick={() => moveStepTo(index, index - 1)}>Move up</button><button type="button" disabled={index === steps.length - 1} onClick={() => moveStepTo(index, index + 1)}>Move down</button><button type="button" className="campaign-step-remove" disabled={steps.length === 1} onClick={() => setSteps(current => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>
                </div>
              </article>)}
            </div>
            <button className="campaign-add-step" type="button" disabled={steps.length >= maxSteps} onClick={addStep}>+ Add a custom follow-up</button>
          </section>
          )}
        </div>

        <footer className="campaign-builder-footer">
          <p>{isVoice
            ? 'Nothing is dialled until you approve the script and your Singapore number is verified. Every call is recorded and transcribed.'
            : 'Attachments are sent to every lead in their sequence step. When a launched campaign is included in Autopilot, CircleOn can research, write, and send automatically within its safeguards.'}</p>
          <div>
            <button className="btn-outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button
              className="btn-primary"
              type="button"
              disabled={isSubmitting
                || !campaign.name.trim()
                || !selectedLeadIds.length
                || (isVoice ? !coverage.withPhone : (!steps.every(step => step.name.trim()) || steps.some(step => step.attachment && step.attachment.size > 10 * 1024 * 1024)))}
              onClick={() => onSubmit({
                campaign,
                brief,
                leadIds: selectedLeadIds,
                steps: isVoice ? [] : toSequenceSteps(steps),
                attachments: isVoice ? [] : steps.flatMap((step, index) => step.attachment ? [{ stepNumber: index + 1, file: step.attachment }] : []),
              })}
            >
              {isSubmitting
                ? 'Creating…'
                : isVoice
                  ? `Create voice campaign with ${selectedLeadIds.length} lead${selectedLeadIds.length === 1 ? '' : 's'}`
                  : `Create campaign with ${selectedLeadIds.length} lead${selectedLeadIds.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
