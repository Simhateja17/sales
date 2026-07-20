'use client';

import { useEffect, useMemo, useState, type DragEvent } from 'react';
import type { CampaignSequenceStep, Lead } from '@/lib/api';

type CampaignDraft = {
  name: string;
  daily_send_cap: number;
  sending_hours_start: string;
  sending_hours_end: string;
  timezone: string;
  cadence_per_hour: number;
  active_days: number[];
  lead_source: 'apollo' | 'csv' | 'manual';
};

const initialCampaign: CampaignDraft = {
  name: '',
  daily_send_cap: 40,
  sending_hours_start: '09:00',
  sending_hours_end: '17:30',
  timezone: 'Asia/Singapore',
  cadence_per_hour: 25,
  active_days: [1, 2, 3, 4, 5],
  lead_source: 'apollo',
};

const initialSteps: CampaignSequenceStep[] = [
  { step_number: 1, name: 'First touch', delay_days: 0, ai_instruction: 'Write a concise first email using one factual company insight. End with a simple invitation to talk.' },
  { step_number: 2, name: 'Follow-up', delay_days: 3, ai_instruction: 'Write a brief follow-up that adds one useful angle without repeating the first email.' },
  { step_number: 3, name: 'Final note', delay_days: 7, ai_instruction: 'Write a polite final follow-up with a low-pressure close.' },
];

export type CampaignBuilderSubmission = {
  campaign: CampaignDraft;
  leadIds: string[];
  steps: CampaignSequenceStep[];
};

export default function CampaignBuilderModal({
  open,
  leads,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  leads: Lead[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (submission: CampaignBuilderSubmission) => void;
}) {
  const [campaign, setCampaign] = useState<CampaignDraft>(initialCampaign);
  const [steps, setSteps] = useState<CampaignSequenceStep[]>(initialSteps);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadFilter, setLeadFilter] = useState('');
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setCampaign(initialCampaign);
    setSteps(initialSteps);
    setSelectedLeadIds([]);
    setLeadFilter('');
    setDraggedStepIndex(null);
    setDropTargetIndex(null);
  }, [open]);

  const visibleLeads = useMemo(() => {
    const query = leadFilter.trim().toLowerCase();
    const eligible = leads.filter(lead => Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status) && lead.lifecycle_status !== 'suppressed' && lead.dnc_status !== 'blocked');
    if (!query) return eligible;
    return eligible.filter(lead => [lead.full_name, lead.company_name, lead.title, lead.email].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [leadFilter, leads]);

  if (!open) return null;

  function updateStep(index: number, patch: Partial<CampaignSequenceStep>) {
    setSteps(current => current.map((step, itemIndex) => itemIndex === index ? { ...step, ...patch } : step));
  }

  function renumber(nextSteps: CampaignSequenceStep[]) {
    return nextSteps.map((step, index) => ({ ...step, step_number: index + 1 }));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(renumber(next));
  }

  function moveStepTo(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= steps.length || targetIndex >= steps.length) return;
    const next = [...steps];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setSteps(renumber(next));
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

  function addStep() {
    setSteps(current => [...current, {
      step_number: current.length + 1,
      name: `Follow-up ${Math.max(1, current.length)}`,
      delay_days: current.length ? current[current.length - 1].delay_days + 4 : 0,
      ai_instruction: 'Write a short, relevant follow-up that adds value and keeps the tone warm and low-pressure.',
    }]);
  }

  return (
    <div className="modal-backdrop campaign-builder-backdrop" role="presentation" onMouseDown={() => !isSubmitting && onClose()}>
      <section className="campaign-builder" role="dialog" aria-modal="true" aria-labelledby="campaign-builder-title" onMouseDown={event => event.stopPropagation()}>
        <header className="campaign-builder-head">
          <div>
            <p>NEW CAMPAIGN</p>
            <h2 id="campaign-builder-title">Build a considered outreach sequence.</h2>
          </div>
          <button className="campaign-builder-close" type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close campaign builder">×</button>
        </header>

        <div className="campaign-builder-body">
          <section className="campaign-builder-section campaign-builder-basics">
            <div className="campaign-builder-section-head"><span>01</span><div><h3>Campaign details</h3><p>Set the practical sending rules once.</p></div></div>
            <label className="campaign-builder-field campaign-builder-field-wide"><span>Campaign name</span><input autoFocus value={campaign.name} onChange={event => setCampaign(current => ({ ...current, name: event.target.value }))} placeholder="Q3 founder outreach" /></label>
            <div className="campaign-builder-grid">
              <label className="campaign-builder-field"><span>Daily send cap</span><input type="number" min="1" max="300" value={campaign.daily_send_cap} onChange={event => setCampaign(current => ({ ...current, daily_send_cap: Number(event.target.value) }))} /></label>
              <label className="campaign-builder-field"><span>Emails per hour</span><input type="number" min="1" max="100" value={campaign.cadence_per_hour} onChange={event => setCampaign(current => ({ ...current, cadence_per_hour: Number(event.target.value) }))} /></label>
              <label className="campaign-builder-field"><span>Start</span><input type="time" value={campaign.sending_hours_start} onChange={event => setCampaign(current => ({ ...current, sending_hours_start: event.target.value }))} /></label>
              <label className="campaign-builder-field"><span>End</span><input type="time" value={campaign.sending_hours_end} onChange={event => setCampaign(current => ({ ...current, sending_hours_end: event.target.value }))} /></label>
            </div>
          </section>

          <section className="campaign-builder-section">
            <div className="campaign-builder-section-head"><span>02</span><div><h3>Verified leads</h3><p>Only work-email leads can enter a campaign.</p></div><strong>{selectedLeadIds.length} selected</strong></div>
            <div className="campaign-lead-controls">
              <input aria-label="Search verified leads" value={leadFilter} onChange={event => setLeadFilter(event.target.value)} placeholder="Search name, company, title…" />
              <button type="button" onClick={() => setSelectedLeadIds(current => current.length === visibleLeads.length ? [] : visibleLeads.map(lead => lead.id))}>{selectedLeadIds.length === visibleLeads.length && visibleLeads.length ? 'Clear all' : 'Select all'}</button>
            </div>
            <div className="campaign-builder-leads">
              {visibleLeads.map(lead => <label key={lead.id} className="campaign-builder-lead-row">
                <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => setSelectedLeadIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])} />
                <span className="campaign-builder-avatar">{lead.full_name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
                <span><strong>{lead.full_name}</strong><small>{lead.title ? `${lead.title} · ` : ''}{lead.company_name || 'Company unavailable'} · {lead.email}</small></span>
                <em>Fit {lead.fit_score || 0}</em>
              </label>)}
              {!visibleLeads.length ? <p className="campaign-builder-empty">No verified work-email leads match this search.</p> : null}
            </div>
          </section>

          <section className="campaign-builder-section">
            <div className="campaign-builder-section-head"><span>03</span><div><h3>Email sequence</h3><p>Tell the AI what each touch should achieve. You can edit every draft later.</p></div></div>
            <div className="campaign-steps">
              {steps.map((step, index) => <article
                className={`campaign-step${draggedStepIndex === index ? ' is-dragging' : ''}${dropTargetIndex === index && draggedStepIndex !== index ? ' is-drop-target' : ''}`}
                key={step.step_number}
                draggable
                onDragStart={event => handleStepDragStart(event, index)}
                onDragOver={event => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  if (draggedStepIndex !== index) setDropTargetIndex(index);
                }}
                onDrop={event => handleStepDrop(event, index)}
                onDragEnd={() => {
                  setDraggedStepIndex(null);
                  setDropTargetIndex(null);
                }}
              >
                <div className="campaign-step-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="campaign-step-fields">
                  <div className="campaign-step-topline">
                    <button className="campaign-step-drag-handle" type="button" aria-label={`Drag ${step.name || `step ${index + 1}`} to reorder`} title="Drag to reorder">⠿</button>
                    <label><span>Step name</span><input value={step.name} onChange={event => updateStep(index, { name: event.target.value })} /></label>
                    <label><span>{index === 0 ? 'Send' : 'Delay'}</span><div className="campaign-delay-input"><input type="number" min="0" value={step.delay_days} onChange={event => updateStep(index, { delay_days: Number(event.target.value) })} /><i>{index === 0 ? 'days' : 'days after'}</i></div></label>
                  </div>
                  <label><span>AI instruction</span><textarea value={step.ai_instruction} onChange={event => updateStep(index, { ai_instruction: event.target.value })} /></label>
                  <div className="campaign-step-actions">
                    <button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)}>Move up</button>
                    <button type="button" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}>Move down</button>
                    <button type="button" className="campaign-step-remove" disabled={steps.length === 1} onClick={() => setSteps(current => renumber(current.filter((_, itemIndex) => itemIndex !== index)))}>Remove</button>
                  </div>
                </div>
              </article>)}
            </div>
            <button className="campaign-add-step" type="button" onClick={addStep}>+ Add follow-up</button>
          </section>
        </div>

        <footer className="campaign-builder-footer">
          <p>Drafts are never sent automatically. You’ll review, edit, and approve them before launch.</p>
          <div><button className="btn-outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button><button className="btn-primary" type="button" disabled={isSubmitting || !campaign.name.trim() || !selectedLeadIds.length || !steps.every(step => step.name.trim() && step.ai_instruction.trim())} onClick={() => onSubmit({ campaign, leadIds: selectedLeadIds, steps: renumber(steps) })}>{isSubmitting ? 'Creating…' : `Create campaign with ${selectedLeadIds.length} lead${selectedLeadIds.length === 1 ? '' : 's'}`}</button></div>
        </footer>
      </section>
    </div>
  );
}
