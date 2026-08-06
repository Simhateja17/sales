'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateCampaignEmails,
  approveCampaignEmails,
  getCampaign,
  getCampaignGeneration,
  getCampaignLeads,
  getCampaignPreview,
  getInbox,
  getLeadImport,
  getLeads,
  getSmtpStatus,
  getWorkspace,
  launchCampaign,
  pauseCampaign,
  previewCsvMapping,
  replaceCampaignLeads,
  resumeCampaign,
  regenerateCampaignEmail,
  rescheduleCampaignEmail,
  sendCampaignEmailNow,
  sendCampaignEmailsNow,
  startCsvImport,
  updateCampaignEmail,
  type Campaign,
  type CampaignGeneration,
  type ConnectedAccount,
  type CsvMapping,
  type EmailMessage,
  type Lead,
  type LeadImportRun,
  type Workspace,
} from '@/lib/api';
import Sidebar from '../../_lib/Sidebar';
import { EmptyState, Metric, initials, statusBadge, type Page } from '../../_lib/ui';
import { csvTargets, terminalImportStatuses } from '../../_lib/leadImport';

export default function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [smtpAccount, setSmtpAccount] = useState<ConnectedAccount | null>(null);
  const [pendingReplies, setPendingReplies] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [preview, setPreview] = useState<EmailMessage[]>([]);
  const [generation, setGeneration] = useState<CampaignGeneration | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [tab, setTab] = useState<'emails' | 'leads'>('leads');
  const [showImportChooser, setShowImportChooser] = useState(false);
  const [showExistingPicker, setShowExistingPicker] = useState(false);
  const [existingPickerIds, setExistingPickerIds] = useState<string[]>([]);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [openedEmail, setOpenedEmail] = useState<EmailMessage | null>(null);
  const [emailEditSubject, setEmailEditSubject] = useState('');
  const [emailEditBody, setEmailEditBody] = useState('');
  const [sendConfirmTarget, setSendConfirmTarget] = useState<'single' | 'selected' | null>(null);

  const canEdit = Boolean(campaign && ['draft', 'paused'].includes(campaign.status));
  const generationBusy = Boolean(generation && (
    ['waiting', 'active', 'delayed', 'prioritized'].includes(generation.status)
    || generation.stage === 'research_complete'
  ));
  const eligibleLeads = useMemo(
    () => leads.filter(lead => Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status) && lead.dnc_status !== 'blocked'),
    [leads]
  );
  // Leads already in this campaign, and the eligible ones that are not yet in it.
  const campaignLeads = useMemo(
    () => leads.filter(lead => selectedLeadIds.includes(lead.id)),
    [leads, selectedLeadIds]
  );
  const availableLeads = useMemo(
    () => eligibleLeads.filter(lead => !selectedLeadIds.includes(lead.id)),
    [eligibleLeads, selectedLeadIds]
  );
  const approvablePreviewIds = useMemo(
    () => preview.filter(item => item.status === 'draft').map(item => item.id),
    [preview]
  );
  const previewSequenceGroups = useMemo(() => {
    const sequenceByStep = new Map((campaign?.email_sequences || []).map(sequence => [sequence.step_number, sequence]));
    const groups = new Map<number, { stepNumber: number; name: string; delayDays: number; instruction: string; messages: EmailMessage[] }>();

    for (const item of preview) {
      const stepNumber = Number(item.sequence_step || 0);
      const sequence = sequenceByStep.get(stepNumber);
      const group = groups.get(stepNumber) || {
        stepNumber,
        name: sequence?.name || (stepNumber === 1 ? 'First touch' : stepNumber ? `Follow-up ${stepNumber - 1}` : 'Unassigned step'),
        delayDays: sequence?.delay_days || 0,
        instruction: sequence?.ai_instruction || '',
        messages: [],
      };
      group.messages.push(item);
      groups.set(stepNumber, group);
    }

    return Array.from(groups.values()).sort((a, b) => a.stepNumber - b.stepNumber);
  }, [campaign?.email_sequences, preview]);
  const sentCount = preview.filter(item => item.status === 'sent' || item.status === 'auto_sent').length;
  const researchEvidenceGroups = useMemo(() => {
    const groups = new Map<string, {
      leadId: string;
      name: string;
      company: string;
      score: number;
      status: string;
      error: string | null;
      evidence: Array<{ claim?: string; fact?: string; excerpt?: string; source_url?: string | null; source_type?: string | null }>;
    }>();
    for (const item of preview) {
      if (!item.lead_id || groups.has(item.lead_id)) continue;
      const profile = item.leads?.personalization_profile;
      const research = item.generation_meta?.research;
      const evidence = (research?.evidence?.length ? research.evidence : profile?.evidence || profile?.email_context || []).slice(0, 2);
      groups.set(item.lead_id, {
        leadId: item.lead_id,
        name: item.leads?.full_name || 'Lead',
        company: item.leads?.company_name || 'Company unavailable',
        score: Number(research?.score ?? profile?.personalization_score ?? 0),
        status: research?.status || item.leads?.research_status || 'not_started',
        error: item.leads?.research_last_error || null,
        evidence,
      });
    }
    return Array.from(groups.values());
  }, [preview]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCampaign(campaignId),
      getCampaignPreview(campaignId),
      getCampaignLeads(campaignId),
      getLeads(),
      getSmtpStatus(),
      getWorkspace(),
      getInbox(),
    ])
      .then(([campaignData, previewData, leadIdData, leadData, smtpData, workspaceData, inboxData]) => {
        if (cancelled) return;
        setCampaign(campaignData.campaign);
        setPreview(previewData.messages);
        setSelectedLeadIds(leadIdData.lead_ids);
        setLeads(leadData.leads);
        setSmtpAccount(smtpData.account);
        setWorkspace(workspaceData.workspace);
        setPendingReplies((inboxData.conversations || []).filter(item => item.direction === 'inbound' || item.status === 'pending_approval').length);
      })
      .catch(error => {
        if (cancelled) return;
        setNotFound(true);
        setMessage(error instanceof Error ? error.message : 'Could not load this campaign');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    getCampaignGeneration(campaignId)
      .then(data => {
        if (!cancelled) setGeneration(data.generation);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    if (!generation || (!['waiting', 'active', 'delayed', 'prioritized'].includes(generation.status) && generation.stage !== 'research_complete')) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await getCampaignGeneration(campaignId);
        if (cancelled) return;
        setGeneration(data.generation);
        const progress = data.generation.progress;
        if (data.generation.stage === 'researching') {
          setMessage(`Researching public company and prospect evidence: ${progress?.processed || 0}/${progress?.total || selectedLeadIds.length} leads completed.`);
        } else if (data.generation.stage === 'research_complete') {
          setMessage('Research complete. Starting email writing…');
        } else if (['completed', 'failed'].includes(data.generation.status)) {
          await reloadPreview();
          if (!cancelled) {
            const failed = Number(progress?.failed || 0);
            setMessage(data.generation.status === 'failed'
              ? `Draft generation stopped: ${data.generation.failed_reason || 'please retry.'}`
              : failed ? `Draft generation finished with ${failed} lead failure${failed === 1 ? '' : 's'}. Retry Generate to resume them.`
                : `Draft generation finished: ${data.generation.generated_messages || progress?.generated || 0} emails are ready for review.`);
          }
        } else {
          setMessage(`Generating drafts: ${progress?.processed || 0}/${progress?.total || selectedLeadIds.length} leads, ${data.generation.generated_messages || progress?.generated || 0} emails ready.`);
        }
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Could not check draft generation');
      }
    };
    poll();
    const timer = window.setInterval(poll, 2500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [campaignId, generation?.stage, generation?.status]);

  useEffect(() => {
    setEmailEditSubject(openedEmail?.subject || '');
    setEmailEditBody(openedEmail?.body || openedEmail?.draft_body || '');
  }, [openedEmail?.id]);

  function navigate(page: Page) {
    router.push(page === 'overview' ? '/dashboard' : `/dashboard?page=${page}`);
  }

  async function reloadPreview() {
    const [previewData, leadIdData] = await Promise.all([getCampaignPreview(campaignId), getCampaignLeads(campaignId)]);
    setPreview(previewData.messages);
    setSelectedLeadIds(leadIdData.lead_ids);
    setSelectedPreviewIds(current => current.filter(id => previewData.messages.some(item => item.id === id && item.status === 'draft')));
  }

  async function handleGenerate() {
    if (!campaign) return;
    if (!canEdit) {
      setMessage('Pause the campaign before generating additional emails.');
      return;
    }
    if (!selectedLeadIds.length) {
      setMessage('Select campaign leads before generating.');
      return;
    }
    setBusy('generate');
    setMessage('');
    try {
      const data = await generateCampaignEmails(campaign.id);
      setCampaign(data.campaign);
      setGeneration(data.generation);
      setTab('emails');
      setMessage(`Draft generation queued for ${data.generation.progress?.total || selectedLeadIds.length} leads. You can leave this page while it runs.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not generate emails');
    } finally {
      setBusy('');
    }
  }

  async function handleLaunch() {
    if (!campaign) return;
    if (campaign.attention_required && !window.confirm('Are you happy with this campaign’s targeting, limits, and sequence? Launching confirms these settings and makes it eligible for Autopilot.')) return;
    setBusy('launch');
    setMessage('');
    try {
      const data = await launchCampaign(campaign.id);
      setCampaign(data.campaign);
      await reloadPreview();
      setMessage(data.queued ? `${data.queued} emails queued.` : 'Campaign launched. It is now eligible for Autopilot.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not launch campaign');
    } finally {
      setBusy('');
    }
  }

  async function handleReschedule(messageItem: EmailMessage) {
    if (!campaign) return;
    const suggested = messageItem.scheduled_at ? new Date(messageItem.scheduled_at).toISOString().slice(0, 16) : '';
    const value = window.prompt('Schedule date and time (local):', suggested);
    if (!value) return;
    const scheduledAt = new Date(value);
    if (Number.isNaN(scheduledAt.getTime())) {
      setMessage('Enter a valid date and time.');
      return;
    }
    setBusy(`reschedule-${messageItem.id}`);
    try {
      const result = await rescheduleCampaignEmail(campaign.id, messageItem.id, scheduledAt.toISOString());
      setPreview(current => current.map(item => item.id === result.message.id ? { ...item, ...result.message } : item));
      setMessage('Email rescheduled within the campaign and workspace sending limits.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reschedule email.');
    } finally {
      setBusy('');
    }
  }

  async function toggleCampaignStatus() {
    if (!campaign) return;
    setBusy('toggle');
    setMessage('');
    try {
      const data = campaign.status === 'active' ? await pauseCampaign(campaign.id) : await resumeCampaign(campaign.id);
      setCampaign(data.campaign);
      setMessage(campaign.status === 'active' ? 'Campaign paused.' : 'Campaign resumed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update campaign');
    } finally {
      setBusy('');
    }
  }

  async function pauseThenImport() {
    await toggleCampaignStatus();
    setMessage('Campaign paused. You can now add or remove its leads.');
  }

  // The campaign-leads endpoint replaces the whole set, so add/remove both send the full list.
  async function writeCampaignLeads(leadIds: string[], describe: (count: number) => string) {
    if (!campaign) return;
    setBusy('campaign-leads');
    setMessage('');
    try {
      const data = await replaceCampaignLeads(campaign.id, leadIds);
      setSelectedLeadIds(data.lead_ids);
      const leadData = await getLeads();
      setLeads(leadData.leads);
      setMessage(describe(data.lead_ids.length));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update campaign leads');
    } finally {
      setBusy('');
    }
  }

  async function addExistingLeads() {
    const added = existingPickerIds.length;
    await writeCampaignLeads([...new Set([...selectedLeadIds, ...existingPickerIds])], () => `${added} lead${added === 1 ? '' : 's'} added to this campaign.`);
    setExistingPickerIds([]);
    setShowExistingPicker(false);
  }

  async function removeLeadFromCampaign(leadId: string) {
    if (!canEdit) {
      setMessage('Pause the campaign before changing its leads.');
      return;
    }
    await writeCampaignLeads(selectedLeadIds.filter(id => id !== leadId), count => `Lead removed. ${count} remaining in this campaign.`);
  }

  async function handleCsvPreview() {
    if (!csvText.trim()) {
      setMessage('Choose a CSV file first.');
      return;
    }
    setBusy('csv-preview');
    setMessage('');
    try {
      const data = await previewCsvMapping(csvText);
      setCsvMappings(data.mappings);
      setCsvPreview(data.preview);
      setMessage(`AI mapped ${data.row_count} rows. Review the mapping before importing.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not map CSV');
    } finally {
      setBusy('');
    }
  }

  async function waitForImport(runId: string) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const { importRun } = await getLeadImport(runId);
      setMessage(`Import ${importRun.status}: ${importRun.created_count} created, ${importRun.skipped_count} skipped.`);
      if (terminalImportStatuses.has(importRun.status)) return importRun;
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    throw new Error('Import is still running. You can safely refresh and check it later.');
  }

  async function handleCsvImportIntoCampaign() {
    if (!campaign) return;
    if (!csvMappings.length) {
      setMessage('Review the AI column mapping first.');
      return;
    }
    setBusy('csv-import');
    setMessage('');
    let run: LeadImportRun;
    try {
      const started = await startCsvImport(csvText, csvMappings, 'import');
      run = await waitForImport(started.importRun.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import leads');
      setBusy('');
      return;
    }

    // Imported leads land in the workspace leadbase first; attach the usable ones to this campaign.
    try {
      const leadData = await getLeads();
      setLeads(leadData.leads);
      const importedIds = leadData.leads
        .filter(lead => lead.import_run_id === run.id && Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status) && lead.dnc_status !== 'blocked')
        .map(lead => lead.id);

      setCsvText('');
      setCsvMappings([]);
      setCsvPreview([]);
      setShowCsvImport(false);

      if (!importedIds.length) {
        setMessage(`CSV ${run.status}: ${run.created_count} created, ${run.skipped_count} skipped. No imported rows were ready to add (each needs a valid email).`);
        return;
      }

      const data = await replaceCampaignLeads(campaign.id, [...new Set([...selectedLeadIds, ...importedIds])]);
      setSelectedLeadIds(data.lead_ids);
      setMessage(`CSV ${run.status}: ${importedIds.length} lead${importedIds.length === 1 ? '' : 's'} added to this campaign, ${run.skipped_count} skipped.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Leads were imported, but could not be added to this campaign');
    } finally {
      setBusy('');
    }
  }

  function togglePreviewSelection(messageId: string) {
    setSelectedPreviewIds(current => current.includes(messageId) ? current.filter(id => id !== messageId) : [...current, messageId]);
  }

  function toggleAllPreviewSelection() {
    setSelectedPreviewIds(current => current.length === approvablePreviewIds.length ? [] : approvablePreviewIds);
  }

  function toggleSequencePreviewSelection(messageIds: string[]) {
    const selectableIds = messageIds.filter(id => approvablePreviewIds.includes(id));
    if (!selectableIds.length) return;
    setSelectedPreviewIds(current => {
      const selected = new Set(current);
      const allSelected = selectableIds.every(id => selected.has(id));
      for (const id of selectableIds) {
        if (allSelected) selected.delete(id);
        else selected.add(id);
      }
      return Array.from(selected);
    });
  }

  async function handleApproveDrafts(messageIds: string[]) {
    if (!campaign || !messageIds.length) return;
    setBusy('approve-drafts');
    setMessage('');
    try {
      const data = await approveCampaignEmails(campaign.id, messageIds);
      const approved = new Map(data.messages.map(item => [item.id, item]));
      setPreview(current => current.map(item => approved.get(item.id) || item));
      setSelectedPreviewIds([]);
      setMessage(`${data.approved} email${data.approved === 1 ? '' : 's'} approved and ready for launch.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not approve the selected emails');
    } finally {
      setBusy('');
    }
  }

  async function handleRegenerateEmail() {
    if (!campaign || !openedEmail) return;
    setBusy('regenerate-email');
    setMessage('');
    try {
      const data = await regenerateCampaignEmail(campaign.id, openedEmail.id);
      setOpenedEmail(data.message);
      setPreview(current => current.map(item => item.id === data.message.id ? data.message : item));
      setMessage('A fresh draft is ready for your review.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not regenerate the email');
    } finally {
      setBusy('');
    }
  }

  async function handleSaveEmailEdit() {
    if (!campaign || !openedEmail) return;
    setBusy('save-email');
    setMessage('');
    try {
      const data = await updateCampaignEmail(campaign.id, openedEmail.id, {
        subject: emailEditSubject,
        body: emailEditBody,
      });
      setOpenedEmail(data.message);
      setPreview(current => current.map(item => item.id === data.message.id ? data.message : item));
      setMessage('Email updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the email');
    } finally {
      setBusy('');
    }
  }

  async function handleSendEmailNow() {
    if (!campaign || !openedEmail) return;
    setBusy('send-now');
    setMessage('');
    try {
      await sendCampaignEmailNow(campaign.id, openedEmail.id);
      setOpenedEmail({ ...openedEmail, status: 'approved' });
      setPreview(current => current.map(item => item.id === openedEmail.id ? { ...item, status: 'approved' } : item));
      setMessage('Email queued to send immediately.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not queue the email');
    } finally {
      setBusy('');
      setSendConfirmTarget(null);
    }
  }

  async function handleSendSelectedEmailsNow() {
    if (!campaign || !selectedPreviewIds.length) return;
    setBusy('send-selected-now');
    setMessage('');
    try {
      const data = await sendCampaignEmailsNow(campaign.id, selectedPreviewIds);
      const queued = new Set(data.message_ids);
      setPreview(current => current.map(item => queued.has(item.id) ? { ...item, status: 'approved' } : item));
      setSelectedPreviewIds([]);
      setMessage(`${data.queued} email${data.queued === 1 ? '' : 's'} queued to send immediately.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not queue the selected emails');
    } finally {
      setBusy('');
      setSendConfirmTarget(null);
    }
  }

  const sending = busy === 'send-now' || busy === 'send-selected-now';

  return (
    <>
      <Sidebar
        activePage="campaigns"
        onNavigate={navigate}
        workspace={workspace}
        smtpAccount={smtpAccount}
        pendingReplies={pendingReplies}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(current => !current)}
        onError={setMessage}
      />

      <main className={`main-content${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
        <div className="dash-topbar">
          <div>
            <button className="card-action" type="button" onClick={() => navigate('campaigns')} style={{ border: 0, background: 'transparent', padding: 0, marginBottom: 6 }}>
              ← All campaigns
            </button>
            <h1 className="dash-greeting">{campaign?.name || (loading ? 'Loading campaign...' : 'Campaign')}</h1>
            <p className="dash-date">
              {campaign ? `${campaign.daily_send_cap}/day · ${campaign.sending_hours_start || '09:00'}–${campaign.sending_hours_end || '18:00'} · ${campaign.timezone || 'Asia/Singapore'}` : ''}
            </p>
            {campaign?.attention_required ? <p className="sf-hint" style={{ marginTop: 8 }}>Requires your attention: {campaign.attention_reason || 'Review the campaign settings, then launch when you are happy with them.'}</p> : null}
          </div>
          {campaign ? (
            <div className="page-actions">
              <button className="btn-outline" type="button" disabled={busy === 'generate' || generationBusy || !canEdit} onClick={handleGenerate}>
                {busy === 'generate' || generationBusy ? 'Researching and writing...' : 'Generate emails'}
              </button>
              <button className="btn-primary" type="button" disabled={busy === 'launch'} onClick={handleLaunch}>
                {busy === 'launch' ? 'Launching...' : 'Launch'}
              </button>
              {campaign.status === 'active' || campaign.status === 'paused' ? (
                <button className="btn-outline" type="button" disabled={busy === 'toggle'} onClick={toggleCampaignStatus}>
                  {campaign.status === 'active' ? 'Pause' : 'Resume'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {message ? <div className="pdpa-banner">{message}</div> : null}

        {notFound ? (
          <div className="card"><EmptyState text="This campaign could not be loaded." /></div>
        ) : loading ? (
          <div className="card"><EmptyState text="Loading campaign..." /></div>
        ) : campaign ? (
          <div className="campaign-review-layout">
            <div>
              <div className="ptabs campaign-review-tabs">
                <button type="button" className={`ptab${tab === 'emails' ? ' active' : ''}`} onClick={() => setTab('emails')}>
                  2. Review emails ({preview.length})
                </button>
                <button type="button" className={`ptab${tab === 'leads' ? ' active' : ''}`} onClick={() => setTab('leads')}>
                  1. Verified leads ({selectedLeadIds.length})
                </button>
              </div>

              {tab === 'emails' ? (
            <div className="card campaign-review-panel">
              <div className="card-head">
                <div>
                  <div className="card-title">Review generated emails</div>
                  <div className="sf-hint">Edit anything you need. Manual launches use approval; launched campaigns included in Autopilot can research, write, and send automatically within the configured safeguards.</div>
                </div>
                <div className="preview-actions">
                  <button className="card-action preview-select-all" type="button" disabled={!approvablePreviewIds.length} onClick={toggleAllPreviewSelection}>
                    {selectedPreviewIds.length === approvablePreviewIds.length && approvablePreviewIds.length ? 'Clear selection' : `Select all drafts (${approvablePreviewIds.length})`}
                  </button>
                  {selectedPreviewIds.length ? (
                    <button className="btn-primary preview-send-selected" type="button" disabled={busy === 'approve-drafts'} onClick={() => handleApproveDrafts(selectedPreviewIds)}>
                      {busy === 'approve-drafts' ? 'Approving...' : `Approve selected (${selectedPreviewIds.length})`}
                    </button>
                  ) : null}
                  <span className="card-action">{preview.length} email{preview.length === 1 ? '' : 's'}</span>
                </div>
              </div>
              {researchEvidenceGroups.length ? (
                <section className="campaign-research-panel" aria-label="Research evidence used for email writing">
                  <div className="campaign-research-panel-head">
                    <div>
                      <div className="card-title">Evidence used for writing</div>
                      <div className="sf-hint">Autopilot uses these public facts automatically. Apollo remains the contact source; Apify evidence is cached and shown here for traceability.</div>
                    </div>
                    <span className="card-action">{researchEvidenceGroups.length} lead{researchEvidenceGroups.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="campaign-research-list">
                    {researchEvidenceGroups.slice(0, 12).map(group => (
                      <article className="campaign-research-item" key={group.leadId}>
                        <div className="campaign-research-item-topline"><strong>{group.name}</strong><span>{group.company}</span><em>Score {group.score}/3 · {group.status}</em></div>
                        {group.evidence.length ? group.evidence.map((item, index) => (
                          <div className="campaign-research-evidence" key={`${group.leadId}-${index}`}>
                            <span>{item.claim || item.fact || 'Evidence'}</span>
                            <p>{item.excerpt || item.fact || 'No excerpt stored.'}</p>
                            {item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer">Open source ↗</a> : <small>{item.source_type || 'Apollo field'}</small>}
                          </div>
                        )) : <p className="campaign-research-empty">No source-backed evidence was available; this lead uses the safe fallback profile.</p>}
                        {group.error ? <small className="campaign-research-error">Fallback note: {group.error}</small> : null}
                      </article>
                    ))}
                  </div>
                  {researchEvidenceGroups.length > 12 ? <p className="sf-hint" style={{ marginTop: 12 }}>Showing the first 12 leads. Each generated message retains its own provenance in the stored generation metadata.</p> : null}
                </section>
              ) : null}
              {preview.length ? previewSequenceGroups.map(group => {
                const draftIds = group.messages.filter(item => item.status === 'draft').map(item => item.id);
                const allGroupDraftsSelected = draftIds.length > 0 && draftIds.every(id => selectedPreviewIds.includes(id));
                const timing = group.stepNumber === 1 || !group.delayDays ? 'Send immediately' : `Send on Day ${group.delayDays}`;
                return (
                  <section key={group.stepNumber} className="campaign-sequence-group" aria-label={`Step ${group.stepNumber}: ${group.name}`}>
                    <header className="campaign-sequence-group-head">
                      <div className="campaign-sequence-group-title">
                        <span className="campaign-sequence-step">{String(group.stepNumber || 0).padStart(2, '0')}</span>
                        <div>
                          <h2>Step {group.stepNumber || '—'} · {group.name}</h2>
                          <p>{timing} · {group.messages.length} email{group.messages.length === 1 ? '' : 's'} ready</p>
                        </div>
                      </div>
                      {draftIds.length ? (
                        <button className="card-action campaign-sequence-select" type="button" onClick={() => toggleSequencePreviewSelection(draftIds)}>
                          {allGroupDraftsSelected ? 'Clear step' : `Select ${draftIds.length} draft${draftIds.length === 1 ? '' : 's'}`}
                        </button>
                      ) : null}
                    </header>
                    {group.instruction ? <p className="campaign-sequence-instruction">{group.instruction}</p> : null}
                    <div className="campaign-sequence-message-list">
                      {group.messages.map(item => (
                        <div key={item.id} className="mtr">
                          <input
                            aria-label={`Select ${item.subject || 'email'}`}
                            type="checkbox"
                            checked={selectedPreviewIds.includes(item.id)}
                            disabled={item.status !== 'draft'}
                            onChange={() => togglePreviewSelection(item.id)}
                          />
                          <button className="mtr-button" type="button" onClick={() => setOpenedEmail(item)}>
                            <div className="mtr-av">{initials(item.leads?.full_name)}</div>
                            <div className="mtr-info">
                              <div className="mtr-name">{item.subject || 'Untitled email'}</div>
                              <div className="mtr-detail">{item.leads?.full_name || 'Lead'} at {item.leads?.company_name || 'Unknown company'}</div>
                              {item.scheduled_at ? <div className="mtr-detail" style={{ marginTop: 4 }}>Scheduled {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.scheduled_at))}{item.schedule_reason ? ` · ${item.schedule_reason}` : ''}</div> : null}
                              <div className="mtr-detail" style={{ marginTop: 6 }}>{(item.body || item.draft_body || '').slice(0, 180)}</div>
                            </div>
                            <span className={`badge ${statusBadge(item.status)}`}><span className="bdot" />{item.status}</span>
                          </button>
                          {item.scheduled_at && ['draft', 'approved'].includes(item.status) ? <button className="card-action" type="button" onClick={() => handleReschedule(item)} disabled={busy === `reschedule-${item.id}`}>Reschedule</button> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }) : <EmptyState text="Generate emails to see previews." />}
            </div>
              ) : (
            <div className="card campaign-review-panel">
              <div className="card-head">
                <div className="card-title">Campaign leads</div>
                <div className="preview-actions">
                  <span className="card-action">{campaignLeads.length} lead{campaignLeads.length === 1 ? '' : 's'}</span>
                  <button className="btn-primary" type="button" disabled={busy === 'campaign-leads' || !canEdit} onClick={() => setShowExistingPicker(true)}>
                    Add verified leads
                  </button>
                </div>
              </div>
              {!canEdit ? (
                <div className="sf-hint" style={{ padding: '12px 20px 0' }}>
                  This campaign is {campaign.status} — pause it to add or remove leads.
                </div>
              ) : null}
              {campaignLeads.length ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Company</th><th>Email</th><th>Fit</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignLeads.map(lead => (
                      <tr key={lead.id}>
                        <td>{lead.full_name}</td>
                        <td>{lead.company_name || '-'}</td>
                        <td>{lead.email || '-'}</td>
                        <td>{lead.fit_score || 0}</td>
                        <td><span className={`badge ${statusBadge(lead.lifecycle_status || lead.status)}`}><span className="bdot" />{lead.lifecycle_status || lead.status}</span></td>
                        <td>
                          <button className="card-action" type="button" disabled={busy === 'campaign-leads' || !canEdit} onClick={() => removeLeadFromCampaign(lead.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <EmptyState text="No verified leads have been added yet. Add them here, then generate the drafts." />}
            </div>
              )}
            </div>

            <div className="set-panel campaign-review-aside">
              <div className="sf" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <div className="sf-lbl">Campaign details</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 25, marginTop: 8 }}>{campaign.name}</div>
                </div>
                <span className={`badge ${statusBadge(campaign.status)}`}><span className="bdot" />{campaign.status}</span>
              </div>
              <div className="msl-list">
                <Metric label="Selected leads" value={selectedLeadIds.length.toString()} />
                <Metric label="Generated emails" value={preview.length.toString()} />
                <Metric label="Sent" value={sentCount.toString()} />
                <Metric label="Daily cap" value={campaign.daily_send_cap.toString()} />
                <Metric label="Send window" value={`${campaign.sending_hours_start || '09:00'}–${campaign.sending_hours_end || '18:00'} ${campaign.timezone || 'Asia/Singapore'}`} />
                <Metric label="Cadence" value={`${campaign.cadence_per_hour || 25}/hour`} />
              </div>
              <div className="sf" style={{ marginTop: 18 }}>
                <div className="sf-lbl">Sequence</div>
                {(campaign.email_sequences || []).map(sequence => (
                  <div className="msl-row" key={sequence.id}>
                    <span className="msl-lbl">Step {sequence.step_number}</span>
                    <span className="msl-val">{sequence.delay_days ? `Day ${sequence.delay_days}` : 'Immediately'}</span>
                  </div>
                ))}
              </div>
              <div className="sf-hint" style={{ marginTop: 16 }}>
                Manual launch safeguard: only approved emails are queued immediately. Autopilot keeps its automatic path for launched campaigns and records the research evidence used for each draft.
              </div>
              <div className="set-save">
                <button className="btn-outline" type="button" onClick={() => selectedLeadIds.length ? setTab('leads') : setShowExistingPicker(true)}>
                  {selectedLeadIds.length ? `Manage ${selectedLeadIds.length} leads` : 'Add verified leads'}
                </button>
                <button className="btn-primary" type="button" disabled={busy === 'generate' || generationBusy || !canEdit} onClick={handleGenerate}>
                  {busy === 'generate' || generationBusy ? 'Researching and writing...' : 'Generate emails'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {showImportChooser ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowImportChooser(false)}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-label="Import leads" onMouseDown={event => event.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="card-head">
              <div>
                <div className="card-title">Import more leads</div>
                <div className="sf-hint" style={{ marginTop: 4 }}>Choose where these leads should come from.</div>
              </div>
              <button className="btn-outline" type="button" onClick={() => setShowImportChooser(false)}>Close</button>
            </div>
            {!canEdit ? (
              <div>
                <div className="sf-hint" style={{ paddingBottom: 16 }}>
                  This campaign is {campaign?.status}. Leads can only be changed while it is draft or paused, so that sending never
                  picks up a lead mid-flight.
                </div>
                <div className="set-save">
                  <button className="btn-primary" type="button" disabled={busy === 'toggle'} onClick={pauseThenImport}>
                    {busy === 'toggle' ? 'Pausing...' : 'Pause campaign'}
                  </button>
                </div>
              </div>
            ) : (
            <div className="set-nav" style={{ marginTop: 4 }}>
              <button
                type="button"
                className="sn-item"
                onClick={() => {
                  setExistingPickerIds([]);
                  setShowImportChooser(false);
                  setShowExistingPicker(true);
                }}
              >
                <span>
                  <strong>From existing leads</strong>
                  <div className="sf-hint" style={{ marginTop: 2 }}>{availableLeads.length} lead{availableLeads.length === 1 ? '' : 's'} in your leadbase are not in this campaign yet.</div>
                </span>
              </button>
              <button
                type="button"
                className="sn-item"
                onClick={() => {
                  setCsvText('');
                  setCsvMappings([]);
                  setCsvPreview([]);
                  setShowImportChooser(false);
                  setShowCsvImport(true);
                }}
              >
                <span>
                  <strong>Upload a CSV</strong>
                  <div className="sf-hint" style={{ marginTop: 2 }}>Map the columns with AI, then add the imported leads straight into this campaign.</div>
                </span>
              </button>
            </div>
            )}
          </section>
        </div>
      ) : null}

      {showExistingPicker && campaign ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowExistingPicker(false)}>
          <section className="modal-card campaign-lead-picker" role="dialog" aria-modal="true" aria-label={`Add leads to ${campaign.name}`} onMouseDown={event => event.stopPropagation()}>
            <div className="card-head">
              <div>
                <div className="card-title">Add from existing leads</div>
                <div className="sf-hint" style={{ marginTop: 4 }}>{existingPickerIds.length} of {availableLeads.length} selected. Leads already in {campaign.name} are not listed.</div>
              </div>
              <button className="btn-outline" type="button" onClick={() => setShowExistingPicker(false)}>Close</button>
            </div>
            <div className="lead-picker-list">
              {availableLeads.map(lead => (
                <label className="lead-picker-row" key={lead.id}>
                  <input
                    type="checkbox"
                    checked={existingPickerIds.includes(lead.id)}
                    onChange={() => setExistingPickerIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])}
                  />
                  <span>
                    <strong>{lead.full_name}</strong>
                    <small>{lead.title ? `${lead.title} · ` : ''}{lead.company_name || 'Unknown company'} · {lead.email}</small>
                  </span>
                  <span className="badge b-interested">Fit {lead.fit_score || 0}</span>
                </label>
              ))}
              {!availableLeads.length ? <EmptyState text="Every ready lead with an email address is already in this campaign." /> : null}
            </div>
            <div className="set-save">
              <button className="btn-outline" type="button" onClick={() => setExistingPickerIds(availableLeads.map(lead => lead.id))} disabled={!availableLeads.length}>
                Select all
              </button>
              <button className="btn-primary" type="button" disabled={busy === 'campaign-leads' || !existingPickerIds.length} onClick={addExistingLeads}>
                {busy === 'campaign-leads' ? 'Adding...' : `Add ${existingPickerIds.length} lead${existingPickerIds.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showCsvImport && campaign ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => (busy.startsWith('csv') ? null : setShowCsvImport(false))}>
          <section className="modal-card campaign-lead-picker" role="dialog" aria-modal="true" aria-label="Import leads from CSV" onMouseDown={event => event.stopPropagation()}>
            <div className="card-head">
              <div>
                <div className="card-title">Import leads from CSV</div>
                <div className="sf-hint" style={{ marginTop: 4 }}>Imported leads are added to your leadbase and to {campaign.name}.</div>
              </div>
              <button className="btn-outline" type="button" disabled={busy.startsWith('csv')} onClick={() => setShowCsvImport(false)}>Close</button>
            </div>
            <div className="lead-picker-list">
              <div className="sf">
                <input
                  className="sf-inp"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setCsvText(await file.text());
                    setCsvMappings([]);
                    setCsvPreview([]);
                  }}
                />
              </div>
              <button className="btn-outline" type="button" disabled={!csvText || busy === 'csv-preview'} onClick={handleCsvPreview}>
                {busy === 'csv-preview' ? 'Mapping...' : 'Map columns with AI'}
              </button>
              {csvMappings.length ? (
                <div style={{ marginTop: 14 }}>
                  {csvMappings.map((mapping, index) => (
                    <div key={`${mapping.source}-${index}`} className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="sf-hint">{mapping.source} · {Math.round(Number(mapping.confidence || 0) * 100)}%</div>
                      <select
                        className="sf-inp"
                        value={mapping.target}
                        onChange={event => setCsvMappings(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, target: event.target.value } : item))}
                      >
                        {csvTargets.map(target => <option key={target} value={target}>{target}</option>)}
                      </select>
                    </div>
                  ))}
                  {csvPreview.length ? <pre className="sf-hint" style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>{JSON.stringify(csvPreview, null, 2)}</pre> : null}
                </div>
              ) : null}
            </div>
            <div className="set-save">
              <button className="btn-primary" type="button" disabled={!csvMappings.length || busy === 'csv-import'} onClick={handleCsvImportIntoCampaign}>
                {busy === 'csv-import' ? 'Importing...' : 'Import and add to campaign'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {openedEmail ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpenedEmail(null)}>
          <section className="modal-card email-detail" role="dialog" aria-modal="true" aria-label="Campaign email" onMouseDown={event => event.stopPropagation()}>
            <div className="card-head">
              <div>
                <div className="card-title">Email to {openedEmail.leads?.full_name || 'lead'}</div>
                <div className="sf-hint" style={{ marginTop: 4 }}>{openedEmail.leads?.email || 'No email address'}</div>
              </div>
              <button className="btn-outline" type="button" onClick={() => setOpenedEmail(null)}>Close</button>
            </div>
            <div className="email-detail-body">
              <div className="email-detail-label">Subject</div>
              {['draft', 'approved'].includes(openedEmail.status) ? (
                <input
                  className="sf-inp"
                  value={emailEditSubject}
                  onChange={event => setEmailEditSubject(event.target.value)}
                  placeholder="Subject"
                />
              ) : (
                <div className="email-detail-subject">{openedEmail.subject || 'Untitled email'}</div>
              )}
              <div className="email-detail-label" style={{ marginTop: 14 }}>Message</div>
              {['draft', 'approved'].includes(openedEmail.status) ? (
                <textarea
                  className="sf-inp"
                  style={{ minHeight: 220, resize: 'vertical', fontFamily: 'inherit' }}
                  value={emailEditBody}
                  onChange={event => setEmailEditBody(event.target.value)}
                  placeholder="Message"
                />
              ) : (
                <div className="email-detail-copy">{openedEmail.body || openedEmail.draft_body || 'No email body was generated.'}</div>
              )}
            </div>
            <div className="set-save">
              {['draft', 'approved'].includes(openedEmail.status) ? (
                <button
                  className="btn-outline"
                  type="button"
                  disabled={busy === 'save-email' || !emailEditSubject.trim() || !emailEditBody.trim()}
                  onClick={handleSaveEmailEdit}
                >
                  {busy === 'save-email' ? 'Saving...' : 'Save changes'}
                </button>
              ) : null}
              {openedEmail.status === 'draft' ? (
                <button className="btn-outline" type="button" disabled={busy === 'regenerate-email'} onClick={handleRegenerateEmail}>
                  {busy === 'regenerate-email' ? 'Regenerating...' : 'Regenerate'}
                </button>
              ) : null}
              {openedEmail.status === 'draft' ? (
                <button className="btn-primary" type="button" disabled={busy === 'approve-drafts'} onClick={() => handleApproveDrafts([openedEmail.id])}>
                  {busy === 'approve-drafts' ? 'Approving...' : 'Approve email'}
                </button>
              ) : null}
              {campaign?.status === 'active' && openedEmail.status === 'approved' ? (
                <button className="btn-primary" type="button" disabled={busy === 'send-now'} onClick={() => setSendConfirmTarget('single')}>
                  {busy === 'send-now' ? 'Queueing...' : 'Send immediately'}
                </button>
              ) : (
                <div className="sf-hint">
                  {openedEmail.status === 'draft'
                    ? 'Approve this draft before it can be sent.'
                    : 'Send immediately is available after this campaign is launched.'}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {sendConfirmTarget ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => (sending ? null : setSendConfirmTarget(null))}>
          <section className="modal-card" role="alertdialog" aria-modal="true" aria-label="Confirm send" onMouseDown={event => event.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="card-head">
              <div className="card-title">Send now?</div>
            </div>
            <div className="sf-hint" style={{ padding: '4px 0 18px' }}>
              {sendConfirmTarget === 'single'
                ? `Send this email to ${openedEmail?.leads?.email || 'this lead'} now?`
                : `Send ${selectedPreviewIds.length} selected email${selectedPreviewIds.length === 1 ? '' : 's'} now?`}
            </div>
            <div className="set-save">
              <button className="btn-outline" type="button" disabled={sending} onClick={() => setSendConfirmTarget(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                disabled={sending}
                onClick={sendConfirmTarget === 'single' ? handleSendEmailNow : handleSendSelectedEmailsNow}
              >
                {sending ? 'Queueing...' : 'Send now'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
