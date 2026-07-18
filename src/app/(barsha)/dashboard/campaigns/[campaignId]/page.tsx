'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateCampaignEmails,
  getCampaign,
  getCampaignLeads,
  getCampaignPreview,
  getInbox,
  getLeads,
  getSmtpStatus,
  getWorkspace,
  launchCampaign,
  pauseCampaign,
  replaceCampaignLeads,
  resumeCampaign,
  sendCampaignEmailNow,
  sendCampaignEmailsNow,
  updateCampaignEmail,
  type Campaign,
  type ConnectedAccount,
  type EmailMessage,
  type Lead,
  type Workspace,
} from '@/lib/api';
import Sidebar from '../../_lib/Sidebar';
import { EmptyState, Metric, initials, statusBadge, type Page } from '../../_lib/ui';

export default function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [smtpAccount, setSmtpAccount] = useState<ConnectedAccount | null>(null);
  const [pendingReplies, setPendingReplies] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [preview, setPreview] = useState<EmailMessage[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [leadPickerIds, setLeadPickerIds] = useState<string[]>([]);
  const [openedEmail, setOpenedEmail] = useState<EmailMessage | null>(null);
  const [emailEditSubject, setEmailEditSubject] = useState('');
  const [emailEditBody, setEmailEditBody] = useState('');
  const [sendConfirmTarget, setSendConfirmTarget] = useState<'single' | 'selected' | null>(null);

  const canEdit = Boolean(campaign && ['draft', 'paused'].includes(campaign.status));
  const emailLeads = useMemo(
    () => leads.filter(lead => Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status)),
    [leads]
  );
  const sendablePreviewIds = useMemo(
    () => preview.filter(item => ['draft', 'approved'].includes(item.status)).map(item => item.id),
    [preview]
  );
  const sentCount = preview.filter(item => item.status === 'sent' || item.status === 'auto_sent').length;

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
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

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
    setSelectedPreviewIds(current => current.filter(id => previewData.messages.some(item => item.id === id && ['draft', 'approved'].includes(item.status))));
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
      setPreview(data.messages);
      setCampaign(data.campaign);
      setMessage(`${data.messages.length} emails generated for review.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not generate emails');
    } finally {
      setBusy('');
    }
  }

  async function handleLaunch() {
    if (!campaign) return;
    setBusy('launch');
    setMessage('');
    try {
      const data = await launchCampaign(campaign.id);
      setCampaign(data.campaign);
      await reloadPreview();
      setMessage(`${data.queued} emails queued.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not launch campaign');
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

  function openLeadPicker() {
    if (!canEdit) {
      setMessage('Pause the campaign before changing its selected leads.');
      return;
    }
    setLeadPickerIds(selectedLeadIds);
    setShowLeadPicker(true);
  }

  async function saveLeadSelection() {
    if (!campaign) return;
    setBusy('campaign-leads');
    setMessage('');
    try {
      const data = await replaceCampaignLeads(campaign.id, leadPickerIds);
      setSelectedLeadIds(data.lead_ids);
      setLeadPickerIds(data.lead_ids);
      setShowLeadPicker(false);
      const leadData = await getLeads();
      setLeads(leadData.leads);
      setMessage(`${data.lead_ids.length} lead${data.lead_ids.length === 1 ? '' : 's'} selected for ${campaign.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update campaign leads');
    } finally {
      setBusy('');
    }
  }

  function togglePreviewSelection(messageId: string) {
    setSelectedPreviewIds(current => current.includes(messageId) ? current.filter(id => id !== messageId) : [...current, messageId]);
  }

  function toggleAllPreviewSelection() {
    setSelectedPreviewIds(current => current.length === sendablePreviewIds.length ? [] : sendablePreviewIds);
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
        onError={setMessage}
      />

      <main className="main-content">
        <div className="dash-topbar">
          <div>
            <button className="card-action" type="button" onClick={() => navigate('campaigns')} style={{ border: 0, background: 'transparent', padding: 0, marginBottom: 6 }}>
              ← All campaigns
            </button>
            <h1 className="dash-greeting">{campaign?.name || (loading ? 'Loading campaign...' : 'Campaign')}</h1>
            <p className="dash-date">
              {campaign ? `${campaign.daily_send_cap}/day · ${campaign.sending_hours_start || '09:00'}–${campaign.sending_hours_end || '18:00'}` : ''}
            </p>
          </div>
          {campaign ? (
            <div className="page-actions">
              <button className="btn-outline" type="button" disabled={busy === 'generate' || !canEdit} onClick={handleGenerate}>
                {busy === 'generate' ? 'Generating...' : 'Generate emails'}
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
          <div className="dash-grid">
            <div className="card">
              <div className="card-head">
                <div className="card-title">Email preview</div>
                <div className="preview-actions">
                  <button className="card-action preview-select-all" type="button" disabled={!sendablePreviewIds.length || campaign.status !== 'active'} onClick={toggleAllPreviewSelection}>
                    {selectedPreviewIds.length === sendablePreviewIds.length && sendablePreviewIds.length ? 'Clear selection' : `Select all eligible (${sendablePreviewIds.length})`}
                  </button>
                  {selectedPreviewIds.length ? (
                    <button className="btn-primary preview-send-selected" type="button" disabled={busy === 'send-selected-now' || campaign.status !== 'active'} onClick={() => setSendConfirmTarget('selected')}>
                      {busy === 'send-selected-now' ? 'Queueing...' : `Send selected (${selectedPreviewIds.length})`}
                    </button>
                  ) : null}
                  <span className="card-action">{preview.length} email{preview.length === 1 ? '' : 's'}</span>
                </div>
              </div>
              {preview.length ? preview.map(item => (
                <div key={item.id} className="mtr">
                  <input
                    aria-label={`Select ${item.subject || 'email'}`}
                    type="checkbox"
                    checked={selectedPreviewIds.includes(item.id)}
                    disabled={!['draft', 'approved'].includes(item.status) || campaign.status !== 'active'}
                    onChange={() => togglePreviewSelection(item.id)}
                  />
                  <button className="mtr-button" type="button" onClick={() => setOpenedEmail(item)}>
                    <div className="mtr-av">{initials(item.leads?.full_name)}</div>
                    <div className="mtr-info">
                      <div className="mtr-name">{item.subject || 'Untitled email'}</div>
                      <div className="mtr-detail">{item.leads?.full_name || 'Lead'} at {item.leads?.company_name || 'Unknown company'}</div>
                      <div className="mtr-detail" style={{ marginTop: 6 }}>{(item.body || item.draft_body || '').slice(0, 180)}</div>
                    </div>
                    <span className={`badge ${statusBadge(item.status)}`}><span className="bdot" />{item.status}</span>
                  </button>
                </div>
              )) : <EmptyState text="Generate emails to see previews." />}
            </div>

            <div className="set-panel">
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
                <Metric label="Send window" value={`${campaign.sending_hours_start || '09:00'}–${campaign.sending_hours_end || '18:00'}`} />
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
                Select leads, generate and review the emails, then launch from a verified mailbox.
              </div>
              <div className="set-save">
                <button className="btn-outline" type="button" disabled={busy === 'campaign-leads' || !canEdit} onClick={openLeadPicker}>
                  {selectedLeadIds.length ? `Manage ${selectedLeadIds.length} leads` : 'Select leads'}
                </button>
                <button className="btn-primary" type="button" disabled={busy === 'generate' || !canEdit} onClick={handleGenerate}>Generate emails</button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {showLeadPicker && campaign ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLeadPicker(false)}>
          <section className="modal-card campaign-lead-picker" role="dialog" aria-modal="true" aria-label={`Select leads for ${campaign.name}`} onMouseDown={event => event.stopPropagation()}>
            <div className="card-head">
              <div>
                <div className="card-title">Select campaign leads</div>
                <div className="sf-hint" style={{ marginTop: 4 }}>{leadPickerIds.length} ready leads selected for {campaign.name}.</div>
              </div>
              <button className="btn-outline" type="button" onClick={() => setShowLeadPicker(false)}>Close</button>
            </div>
            <div className="lead-picker-list">
              {emailLeads.map(lead => (
                <label className="lead-picker-row" key={lead.id}>
                  <input
                    type="checkbox"
                    checked={leadPickerIds.includes(lead.id)}
                    onChange={() => setLeadPickerIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])}
                  />
                  <span>
                    <strong>{lead.full_name}</strong>
                    <small>{lead.title ? `${lead.title} · ` : ''}{lead.company_name || 'Unknown company'} · {lead.email}</small>
                  </span>
                  <span className="badge b-interested">Fit {lead.fit_score || 0}</span>
                </label>
              ))}
              {!emailLeads.length ? <EmptyState text="No ready leads with email addresses are available." /> : null}
            </div>
            <div className="set-save">
              <button className="btn-outline" type="button" onClick={() => setLeadPickerIds([])}>Clear selection</button>
              <button className="btn-primary" type="button" disabled={busy === 'campaign-leads'} onClick={saveLeadSelection}>
                {busy === 'campaign-leads' ? 'Saving...' : `Save ${leadPickerIds.length} leads`}
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
              {campaign?.status === 'active' && ['draft', 'approved'].includes(openedEmail.status) ? (
                <button className="btn-primary" type="button" disabled={busy === 'send-now'} onClick={() => setSendConfirmTarget('single')}>
                  {busy === 'send-now' ? 'Queueing...' : 'Send immediately'}
                </button>
              ) : (
                <div className="sf-hint">Send immediately is available after this campaign is launched.</div>
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
