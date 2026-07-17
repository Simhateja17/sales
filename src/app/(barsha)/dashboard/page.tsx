'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveInboxMessage,
  connectSmtp,
  createCampaign,
  createLead,
  downloadCsvImportErrors,
  generateCampaignEmails,
  getCampaignPreview,
  getCampaigns,
  getApolloFilters,
  getApolloImport,
  getLeadImport,
  getInbox,
  getLeads,
  getMeetings,
  getSmtpStatus,
  getWorkspace,
  importApolloLeads,
  launchCampaign,
  pauseCampaign,
  previewCsvMapping,
  resumeCampaign,
  startCsvImport,
  syncApolloEmails,
  testSmtp,
  type ApolloFilters,
  type Campaign,
  type ConnectedAccount,
  type CsvMapping,
  type EmailMessage,
  type Lead,
  type LeadImportRun,
  type Meeting,
  type Workspace,
} from '@/lib/api';

type Page = 'overview' | 'campaigns' | 'leads' | 'inbox' | 'meetings' | 'analytics' | 'settings' | 'billing' | 'support';

const navItems: Array<{ id: Page; label: string; marker: string }> = [
  { id: 'overview', label: 'Overview', marker: 'Ov' },
  { id: 'campaigns', label: 'Campaigns', marker: 'Ca' },
  { id: 'leads', label: 'Leads', marker: 'Le' },
  { id: 'inbox', label: 'Inbox', marker: 'In' },
  { id: 'meetings', label: 'Meetings', marker: 'Me' },
  { id: 'analytics', label: 'Analytics', marker: 'An' },
  { id: 'settings', label: 'Settings', marker: 'Se' },
  { id: 'billing', label: 'Billing', marker: 'Bi' },
  { id: 'support', label: 'Support', marker: 'Su' },
];

const emptyLeadForm = {
  full_name: '',
  company_name: '',
  title: '',
  email: '',
  phone: '',
  notes_summary: '',
};

const emptyCampaignForm = {
  name: '',
  daily_send_cap: 40,
  send_window_start: '09:00',
  send_window_end: '17:30',
  timezone: 'Asia/Singapore',
  require_approval: true,
  auto_send_replies: false,
};

const emptySmtpForm = {
  from_email: '',
  from_name: '',
  reply_to_email: '',
  smtp_host: '',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  imap_host: '',
  imap_port: 993,
  imap_username: '',
  imap_password: '',
};

const emptyApolloFilters: ApolloFilters = {
  titles: ['Founder', 'CEO', 'Managing Director', 'Head of Sales'],
  region: 'Singapore',
  industry: '',
  companySize: '',
  limit: 25,
};

function initials(name?: string | null) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'NA';
}

function statusBadge(status?: string | null) {
  if (!status) return 'b-noanswer';
  if (['active', 'sent', 'auto_sent', 'booked', 'positive'].includes(status)) return 'b-booked';
  if (['ready', 'approved', 'interested'].includes(status)) return 'b-interested';
  if (['draft', 'pending_approval', 'generating', 'queued'].includes(status)) return 'b-pending';
  if (['failed', 'rejected', 'not_interested', 'dnc_request'].includes(status)) return 'b-noanswer';
  return 'b-new';
}

function fmtDate(value?: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-SG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const csvTargets = ['full_name', 'first_name', 'last_name', 'company_name', 'title', 'email', 'phone', 'location', 'linkedin_url', 'company_domain', 'company_industry', 'company_size', 'external_id', 'ignore'];

export default function DashboardPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('overview');
  const [today, setToday] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inbox, setInbox] = useState<EmailMessage[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [smtpAccount, setSmtpAccount] = useState<ConnectedAccount | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [preview, setPreview] = useState<EmailMessage[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [smtpForm, setSmtpForm] = useState(emptySmtpForm);
  const [apolloFilters, setApolloFilters] = useState<ApolloFilters>(emptyApolloFilters);
  const [csvText, setCsvText] = useState('');
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [lastCsvRun, setLastCsvRun] = useState<LeadImportRun | null>(null);
  const [csvMode, setCsvMode] = useState<'import' | 'suppress'>('import');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const selectedCampaign = campaigns.find(campaign => campaign.id === selectedCampaignId) || campaigns[0] || null;
  const emailLeads = useMemo(
    () => leads.filter(lead => Boolean(lead.email) && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status)),
    [leads]
  );
  const pendingReplies = useMemo(
    () => inbox.filter(item => item.direction === 'inbound' || item.status === 'pending_approval'),
    [inbox]
  );
  const sentMessages = preview.filter(item => item.status === 'sent' || item.status === 'auto_sent').length;
  const openedMessages = preview.filter(item => item.open_count > 0).length;

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('en-SG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Singapore',
      }).format(new Date())
    );
  }, []);

  useEffect(() => {
    getWorkspace()
      .then(data => {
        setWorkspace(data.workspace);
        if (!data.workspace.plan) {
          router.push('/plan-select');
        } else if (!data.workspace.onboarding_completed) {
          router.push('/onboarding');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    refreshAll().catch(error => setMessage(error.message));
    getApolloFilters()
      .then(data => setApolloFilters(data.filters))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedCampaign?.id) {
      setPreview([]);
      return;
    }
    getCampaignPreview(selectedCampaign.id)
      .then(data => setPreview(data.messages))
      .catch(() => setPreview([]));
  }, [selectedCampaign?.id]);

  useEffect(() => {
    setSelectedLeadIds(current => {
      const eligibleIds = [...emailLeads].sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0)).map(lead => lead.id);
      const retained = current.filter(id => eligibleIds.includes(id));
      return retained.length ? retained : eligibleIds.slice(0, 100);
    });
  }, [emailLeads]);

  async function refreshAll() {
    const [leadData, campaignData, inboxData, meetingData, smtpData] = await Promise.all([
      getLeads(),
      getCampaigns(),
      getInbox(),
      getMeetings(),
      getSmtpStatus(),
    ]);
    console.log('[apollo:frontend:refresh_all]', {
      leads: leadData.leads.length,
      leadsWithEmail: leadData.leads.filter(lead => Boolean(lead.email)).length,
      campaigns: campaignData.campaigns.length,
      inbox: inboxData.conversations?.length || 0,
    });
    setLeads(leadData.leads);
    setCampaigns(campaignData.campaigns);
    setInbox(inboxData.conversations || []);
    setMeetings(meetingData.meetings);
    setSmtpAccount(smtpData.account);
    if (!selectedCampaignId && campaignData.campaigns[0]) {
      setSelectedCampaignId(campaignData.campaigns[0].id);
    }
  }

  async function handleCreateLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('lead');
    setMessage('');
    try {
      await createLead({
        ...leadForm,
        source: 'manual',
      });
      setLeadForm(emptyLeadForm);
      const data = await getLeads();
      setLeads(data.leads);
      setMessage('Lead saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save lead');
    } finally {
      setBusy('');
    }
  }

  async function waitForImport(runId: string, loader: (id: string) => Promise<{ importRun: LeadImportRun }>) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const { importRun } = await loader(runId);
      const meta = importRun.raw_meta || {};
      setMessage(`Import ${importRun.status}: ${String(meta.ready_count ?? importRun.created_count)} ready/created, ${importRun.skipped_count} skipped.`);
      if (['completed', 'partial', 'pending_enrichment', 'failed'].includes(importRun.status)) return importRun;
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    throw new Error('Import is still running. You can safely refresh and check it later.');
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

  async function handleCsvImport() {
    if (!csvMappings.length) {
      setMessage('Review the AI column mapping first.');
      return;
    }
    setBusy('csv');
    setMessage('');
    try {
      const started = await startCsvImport(csvText, csvMappings, csvMode);
      const run = await waitForImport(started.importRun.id, getLeadImport);
      setLastCsvRun(run);
      setCsvText('');
      setCsvMappings([]);
      setCsvPreview([]);
      const data = await getLeads();
      setLeads(data.leads);
      setMessage(`CSV ${run.status}: ${run.created_count} created, ${run.updated_count} updated, ${run.skipped_count} skipped.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import leads');
    } finally {
      setBusy('');
    }
  }

  async function handleDownloadCsvErrors() {
    if (!lastCsvRun) return;
    try {
      const blob = await downloadCsvImportErrors(lastCsvRun.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `barsha-import-${lastCsvRun.id}-errors.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not download import errors');
    }
  }

  async function handleApolloImport() {
    setBusy('apollo');
    setMessage('');
    console.log('[apollo:frontend:import_start]', apolloFilters);
    try {
      const data = await importApolloLeads(apolloFilters);
      console.log('[apollo:frontend:import_response]', {
        importRun: data.importRun,
        sync: data.sync,
      });
      const run = await waitForImport(data.importRun.id, getApolloImport);
      const leadData = await getLeads();
      console.log('[apollo:frontend:leads_after_import]', {
        leads: leadData.leads.length,
        leadsWithEmail: leadData.leads.filter(lead => Boolean(lead.email)).length,
        sample: leadData.leads.slice(0, 5).map(lead => ({
          name: lead.full_name,
          company: lead.company_name,
          hasEmail: Boolean(lead.email),
          status: lead.status,
        })),
      });
      setLeads(leadData.leads);
      const meta = run.raw_meta || {};
      setMessage(`Apollo ${run.status}: ${String(meta.ready_count ?? 0)} ready leads from ${run.created_count} new candidates.`);
    } catch (error) {
      console.error('[apollo:frontend:import_failed]', error);
      setMessage(error instanceof Error ? error.message : 'Could not import Apollo leads');
    } finally {
      setBusy('');
    }
  }

  async function handleApolloSync() {
    setBusy('apollo-sync');
    setMessage('');
    console.log('[apollo:frontend:sync_start]');
    try {
      const data = await syncApolloEmails();
      console.log('[apollo:frontend:sync_response]', data);
      const leadData = await getLeads();
      console.log('[apollo:frontend:leads_after_sync]', {
        leads: leadData.leads.length,
        leadsWithEmail: leadData.leads.filter(lead => Boolean(lead.email)).length,
        sample: leadData.leads.slice(0, 5).map(lead => ({
          name: lead.full_name,
          company: lead.company_name,
          hasEmail: Boolean(lead.email),
          status: lead.status,
        })),
      });
      setLeads(leadData.leads);
      setMessage(`Apollo sync checked ${data.requestIds.length} requests: ${data.sync.updated} updated, ${data.sync.pending} pending.`);
    } catch (error) {
      console.error('[apollo:frontend:sync_failed]', error);
      setMessage(error instanceof Error ? error.message : 'Could not sync Apollo emails');
    } finally {
      setBusy('');
    }
  }

  async function handleCreateCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('campaign');
    setMessage('');
    try {
      const data = await createCampaign({
        ...campaignForm,
        target_segment: { source: 'dashboard', lead_count: emailLeads.length },
      });
      setCampaigns([data.campaign, ...campaigns]);
      setSelectedCampaignId(data.campaign.id);
      setCampaignForm(emptyCampaignForm);
      setMessage('Campaign created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create campaign');
    } finally {
      setBusy('');
    }
  }

  async function handleGenerate() {
    if (!selectedCampaign) return;
    if (!selectedLeadIds.length) {
      setMessage('Add leads with email addresses before generating.');
      return;
    }
    setBusy('generate');
    setMessage('');
    try {
      const data = await generateCampaignEmails(selectedCampaign.id, selectedLeadIds);
      setPreview(data.messages);
      await refreshCampaignsOnly(data.campaign.id);
      setMessage(`${data.messages.length} emails generated for review.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not generate emails');
    } finally {
      setBusy('');
    }
  }

  async function refreshCampaignsOnly(nextSelectedId?: string) {
    const data = await getCampaigns();
    setCampaigns(data.campaigns);
    if (nextSelectedId) setSelectedCampaignId(nextSelectedId);
  }

  async function handleLaunch() {
    if (!selectedCampaign) return;
    setBusy('launch');
    setMessage('');
    try {
      const data = await launchCampaign(selectedCampaign.id);
      await refreshCampaignsOnly(data.campaign.id);
      setMessage(`${data.queued} emails queued.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not launch campaign');
    } finally {
      setBusy('');
    }
  }

  async function toggleCampaign() {
    if (!selectedCampaign) return;
    setBusy('toggle');
    setMessage('');
    try {
      const data = selectedCampaign.status === 'active'
        ? await pauseCampaign(selectedCampaign.id)
        : await resumeCampaign(selectedCampaign.id);
      await refreshCampaignsOnly(data.campaign.id);
      setMessage(selectedCampaign.status === 'active' ? 'Campaign paused.' : 'Campaign resumed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update campaign');
    } finally {
      setBusy('');
    }
  }

  async function handleSmtpConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('smtp');
    setMessage('');
    try {
      const data = await connectSmtp({
        ...smtpForm,
        imap_username: smtpForm.imap_username || smtpForm.smtp_username,
        imap_password: smtpForm.imap_password || smtpForm.smtp_password,
      });
      setSmtpAccount(data.account);
      setSmtpForm(emptySmtpForm);
      setMessage('Mailbox connected.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not connect mailbox');
    } finally {
      setBusy('');
    }
  }

  function applyMailboxPreset(provider: 'gmail' | 'outlook') {
    setSmtpForm(current => provider === 'gmail' ? {
      ...current,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      imap_host: 'imap.gmail.com',
      imap_port: 993,
    } : {
      ...current,
      smtp_host: 'smtp.office365.com',
      smtp_port: 587,
      imap_host: 'outlook.office365.com',
      imap_port: 993,
    });
  }

  async function handleTestSmtp() {
    setBusy('smtp-test');
    setMessage('');
    try {
      const data = await testSmtp();
      setSmtpAccount(data.account);
      setMessage('SMTP test passed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'SMTP test failed');
    } finally {
      setBusy('');
    }
  }

  async function handleApproveReply(messageId: string) {
    setBusy(messageId);
    setMessage('');
    try {
      await approveInboxMessage(messageId);
      const data = await getInbox();
      setInbox(data.conversations || []);
      setMessage('Reply approved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not approve reply');
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <div className="sb-mark">B</div>
            <div>
              <div className="sb-name">Barsha</div>
              <div className="sb-sub">Email sales agent</div>
            </div>
          </div>
        </div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
            >
              <span style={{ width: 22, fontSize: 10, fontWeight: 700 }}>{item.marker}</span>
              {item.label}
              {item.id === 'inbox' && pendingReplies.length > 0 ? <span className="nav-badge">{pendingReplies.length}</span> : null}
            </button>
          ))}
        </nav>
        <div className="agent-pill">
          <div className="ap-lbl">Mailbox</div>
          <div className="ap-row">
            <span className="ap-dot" style={{ background: smtpAccount?.status === 'connected' ? undefined : '#A89FB5' }} />
            <div>
              <div className="ap-name-txt">{smtpAccount?.from_email || 'Not connected'}</div>
              <div className="ap-num">{workspace?.name || 'Workspace'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-greeting">Email command center</h1>
            <p className="dash-date">{today}</p>
          </div>
          <div className="page-actions">
            <button type="button" className="btn-outline" onClick={() => refreshAll().catch(error => setMessage(error.message))}>
              Refresh
            </button>
            <button type="button" className="btn-primary" onClick={() => setActivePage('campaigns')}>
              New campaign
            </button>
          </div>
        </div>

        {message ? <div className="pdpa-banner">{message}</div> : null}

        {activePage === 'overview' ? (
          <section>
            <KpiRow
              items={[
                ['Campaigns', campaigns.length, 'Ca'],
                ['Email leads', emailLeads.length, 'Le'],
                ['Inbox review', pendingReplies.length, 'In'],
                ['Meetings', meetings.length, 'Me'],
              ]}
            />
            <div className="dash-grid">
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Active campaigns</div>
                  <button className="card-action" type="button" onClick={() => setActivePage('campaigns')}>Manage</button>
                </div>
                {campaigns.length ? campaigns.slice(0, 6).map(campaign => (
                  <CampaignRow key={campaign.id} campaign={campaign} onClick={() => {
                    setSelectedCampaignId(campaign.id);
                    setActivePage('campaigns');
                  }} />
                )) : <EmptyState text="No campaigns yet." />}
              </div>
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Readiness</div>
                </div>
                <div className="msl-list">
                  <Metric label="Mailbox" value={smtpAccount ? smtpAccount.status : 'missing'} />
                  <Metric label="Leads with email" value={emailLeads.length.toString()} />
                  <Metric label="Campaign drafts" value={campaigns.filter(c => c.status === 'draft' || c.status === 'ready').length.toString()} />
                  <Metric label="Human approvals" value={pendingReplies.length.toString()} />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === 'campaigns' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Campaigns</h2>
                <p className="page-sub">Generate, review, and launch email sequences.</p>
              </div>
              {selectedCampaign ? (
                <div className="page-actions">
                  <button className="btn-outline" type="button" disabled={busy === 'generate'} onClick={handleGenerate}>
                    {busy === 'generate' ? 'Generating...' : 'Generate emails'}
                  </button>
                  <button className="btn-primary" type="button" disabled={busy === 'launch'} onClick={handleLaunch}>
                    {busy === 'launch' ? 'Launching...' : 'Launch'}
                  </button>
                  {selectedCampaign.status === 'active' || selectedCampaign.status === 'paused' ? (
                    <button className="btn-outline" type="button" disabled={busy === 'toggle'} onClick={toggleCampaign}>
                      {selectedCampaign.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="dash-grid">
              <div>
                <div className="card" style={{ marginBottom: 18 }}>
                  <div className="card-head">
                    <div className="card-title">Campaign list</div>
                  </div>
                  {campaigns.length ? campaigns.map(campaign => (
                    <CampaignRow key={campaign.id} campaign={campaign} active={campaign.id === selectedCampaign?.id} onClick={() => setSelectedCampaignId(campaign.id)} />
                  )) : <EmptyState text="Create your first campaign." />}
                </div>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Email preview</div>
                    <span className="card-action">{preview.length} drafts</span>
                  </div>
                  {preview.length ? preview.slice(0, 5).map(item => (
                    <div key={item.id} className="mtr">
                      <div className="mtr-av">{initials(item.leads?.full_name)}</div>
                      <div className="mtr-info">
                        <div className="mtr-name">{item.subject || 'Untitled email'}</div>
                        <div className="mtr-detail">{item.leads?.full_name || 'Lead'} at {item.leads?.company_name || 'Unknown company'}</div>
                        <div className="mtr-detail" style={{ marginTop: 6 }}>{(item.body || item.draft_body || '').slice(0, 180)}</div>
                      </div>
                      <span className={`badge ${statusBadge(item.status)}`}><span className="bdot" />{item.status}</span>
                    </div>
                  )) : <EmptyState text="Generate emails to see previews." />}
                </div>
              </div>
              <form className="set-panel" onSubmit={handleCreateCampaign}>
                <div className="sf">
                  <div className="sf-lbl">New campaign</div>
                  <input className="sf-inp" value={campaignForm.name} onChange={event => setCampaignForm({ ...campaignForm, name: event.target.value })} placeholder="Q3 founder outreach" required />
                </div>
                <div className="sf">
                  <div className="sf-lbl">Daily send cap</div>
                  <input className="sf-inp" type="number" min={1} max={300} value={campaignForm.daily_send_cap} onChange={event => setCampaignForm({ ...campaignForm, daily_send_cap: Number(event.target.value) })} />
                </div>
                <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div className="sf-lbl">Start</div>
                    <input className="sf-inp" value={campaignForm.send_window_start} onChange={event => setCampaignForm({ ...campaignForm, send_window_start: event.target.value })} />
                  </div>
                  <div>
                    <div className="sf-lbl">End</div>
                    <input className="sf-inp" value={campaignForm.send_window_end} onChange={event => setCampaignForm({ ...campaignForm, send_window_end: event.target.value })} />
                  </div>
                </div>
                <label className="tog-switch">
                  <span>
                    <span className="ts-name">Require approval</span>
                    <span className="ts-desc">Keep replies in inbox review.</span>
                  </span>
                  <span className="ts-ctrl">
                    <input type="checkbox" checked={campaignForm.require_approval} onChange={event => setCampaignForm({ ...campaignForm, require_approval: event.target.checked })} />
                    <span className="ts-sldr" />
                  </span>
                </label>
                <div className="set-save">
                  <button className="btn-primary" type="submit" disabled={busy === 'campaign'}>{busy === 'campaign' ? 'Creating...' : 'Create campaign'}</button>
                </div>
              </form>
            </div>
          </section>
        ) : null}

        {activePage === 'leads' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Leads</h2>
                <p className="page-sub">{emailLeads.length} of {leads.length} leads have email addresses.</p>
              </div>
            </div>
            <div className="dash-grid">
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Lead list</div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Select</th><th>Name</th><th>Company</th><th>Email</th><th>Fit</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}>
                        <td><input type="checkbox" checked={selectedLeadIds.includes(lead.id)} disabled={!lead.email || !['ready', 'selected_for_campaign'].includes(lead.lifecycle_status)} onChange={() => setSelectedLeadIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])} /></td>
                        <td>{lead.full_name}</td>
                        <td>{lead.company_name || '-'}</td>
                        <td>{lead.email || '-'}</td>
                        <td title={(lead.fit_reasons || []).map(reason => `+${reason.points} ${reason.reason}`).join('\n')}>{lead.fit_score || 0}</td>
                        <td><span className={`badge ${statusBadge(lead.lifecycle_status || lead.status)}`}><span className="bdot" />{lead.lifecycle_status || lead.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!leads.length ? <EmptyState text="No leads imported yet." /> : null}
              </div>
              <div>
                <div className="set-panel" style={{ marginBottom: 18 }}>
                  <div className="sf">
                    <div className="sf-lbl">Apollo import</div>
                    <div className="sf-hint">Filters are prefilled from onboarding and can be adjusted per import.</div>
                  </div>
                  <div className="sf">
                    <input
                      className="sf-inp"
                      value={apolloFilters.titles.join(', ')}
                      onChange={event => setApolloFilters({
                        ...apolloFilters,
                        titles: event.target.value.split(',').map(item => item.trim()).filter(Boolean),
                      })}
                      placeholder="Founder, CEO, Head of Sales"
                    />
                  </div>
                  <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      className="sf-inp"
                      value={apolloFilters.region}
                      onChange={event => setApolloFilters({ ...apolloFilters, region: event.target.value })}
                      placeholder="Singapore"
                    />
                    <input
                      className="sf-inp"
                      value={apolloFilters.industry}
                      onChange={event => setApolloFilters({ ...apolloFilters, industry: event.target.value })}
                      placeholder="Industry"
                    />
                  </div>
                  <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10 }}>
                    <input
                      className="sf-inp"
                      value={apolloFilters.companySize}
                      onChange={event => setApolloFilters({ ...apolloFilters, companySize: event.target.value })}
                      placeholder="11-50"
                    />
                    <input
                      className="sf-inp"
                      type="number"
                      min={1}
                      max={100}
                      value={apolloFilters.limit}
                      onChange={event => setApolloFilters({ ...apolloFilters, limit: Number(event.target.value) })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-primary" type="button" disabled={busy === 'apollo'} onClick={handleApolloImport}>
                      {busy === 'apollo' ? 'Importing...' : 'Import from Apollo'}
                    </button>
                    <button className="btn-outline" type="button" disabled={busy === 'apollo-sync'} onClick={handleApolloSync}>
                      {busy === 'apollo-sync' ? 'Syncing...' : 'Sync Apollo emails'}
                    </button>
                  </div>
                </div>
                <form className="set-panel" onSubmit={handleCreateLead}>
                  <div className="sf-lbl">Add lead</div>
                  {Object.keys(emptyLeadForm).map(key => (
                    <div className="sf" key={key}>
                      <input
                        className="sf-inp"
                        value={leadForm[key as keyof typeof leadForm]}
                        onChange={event => setLeadForm({ ...leadForm, [key]: event.target.value })}
                        placeholder={key.replaceAll('_', ' ')}
                        required={key === 'full_name' || key === 'email'}
                      />
                    </div>
                  ))}
                  <button className="btn-primary" type="submit" disabled={busy === 'lead'}>{busy === 'lead' ? 'Saving...' : 'Save lead'}</button>
                </form>
                <div className="set-panel" style={{ marginTop: 18 }}>
                  <div className="sf">
                    <div className="sf-lbl">CSV import</div>
                    <div className="sf-hint">Upload a CSV, let AI map the columns, then confirm the preview before anything is written.</div>
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
                  <div className="sf">
                    <select className="sf-inp" value={csvMode} onChange={event => setCsvMode(event.target.value as 'import' | 'suppress')}>
                      <option value="import">Import leads</option>
                      <option value="suppress">Exclude from future searches</option>
                    </select>
                  </div>
                  <button className="btn-outline" type="button" disabled={!csvText || busy === 'csv-preview'} onClick={handleCsvPreview}>{busy === 'csv-preview' ? 'Mapping...' : 'Map columns with AI'}</button>
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
                      <button className="btn-primary" type="button" disabled={busy === 'csv'} onClick={handleCsvImport}>{busy === 'csv' ? 'Importing...' : `Confirm and ${csvMode === 'suppress' ? 'exclude' : 'import'}`}</button>
                    </div>
                  ) : null}
                  {lastCsvRun && lastCsvRun.skipped_count > 0 ? (
                    <button className="btn-outline" type="button" style={{ marginTop: 10 }} onClick={handleDownloadCsvErrors}>
                      Download skipped-row report
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === 'inbox' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Inbox</h2>
                <p className="page-sub">Inbound replies and AI drafted responses.</p>
              </div>
            </div>
            <div className="card">
              {inbox.length ? inbox.map(item => (
                <div key={item.id} className="call-card">
                  <div className="call-av">{initials(item.leads?.full_name)}</div>
                  <div className="call-meta">
                    <div className="call-name">{item.leads?.full_name || item.subject || 'Inbound email'}</div>
                    <div className="call-detail">{item.leads?.company_name || item.leads?.email || 'Unknown lead'} · {fmtDate(item.received_at || item.created_at)}</div>
                    <div className="call-detail" style={{ marginTop: 7 }}>{(item.draft_body || item.body || '').slice(0, 220)}</div>
                  </div>
                  <div className="call-right">
                    <span className={`badge ${statusBadge(item.intent_classification || item.status)}`}><span className="bdot" />{item.intent_classification || item.status}</span>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn-outline" type="button" disabled={busy === item.id} onClick={() => handleApproveReply(item.id)}>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )) : <EmptyState text="No inbound replies yet." />}
            </div>
          </section>
        ) : null}

        {activePage === 'meetings' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Meetings</h2>
                <p className="page-sub">Booked meetings from positive replies.</p>
              </div>
            </div>
            <div className="card">
              {meetings.length ? meetings.map(meeting => (
                <div key={meeting.id} className="mtg-item">
                  <div className="mi-time">{fmtDate(meeting.starts_at)}</div>
                  <div className="mi-name">{meeting.title}</div>
                  <div className="mi-detail">{meeting.invitee_name || meeting.invitee_email || meeting.leads?.full_name || 'Invitee pending'}</div>
                  <span className="mi-type">{meeting.status}</span>
                </div>
              )) : <EmptyState text="No meetings booked yet." />}
            </div>
          </section>
        ) : null}

        {activePage === 'analytics' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Analytics</h2>
                <p className="page-sub">Live counts from campaigns, messages, and inbox.</p>
              </div>
            </div>
            <KpiRow
              items={[
                ['Generated', preview.length, 'Ge'],
                ['Sent', sentMessages, 'Se'],
                ['Opened', openedMessages, 'Op'],
                ['Replies', inbox.length, 'Re'],
              ]}
            />
            <div className="an-grid">
              <div className="card">
                <div className="card-head"><div className="card-title">Campaign status</div></div>
                <div className="chart-wrap">
                  {['draft', 'ready', 'active', 'paused', 'completed'].map(status => (
                    <Metric key={status} label={status} value={campaigns.filter(c => c.status === status).length.toString()} />
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-title">Reply intent</div></div>
                <div className="chart-wrap">
                  {['positive', 'pricing', 'not_interested', 'dnc_request', 'auto_reply'].map(intent => (
                    <Metric key={intent} label={intent} value={inbox.filter(item => item.intent_classification === intent).length.toString()} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === 'settings' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Settings</h2>
                <p className="page-sub">Connect the sender mailbox used by campaigns and inbox polling.</p>
              </div>
            </div>
            <div className="set-grid">
              <div className="set-nav">
                <div className="sn-item active">SMTP and IMAP</div>
                <div className="sn-item">Workspace</div>
                <div className="sn-item">Compliance</div>
              </div>
              <form className="set-panel" onSubmit={handleSmtpConnect}>
                <div className="sf">
                  <div className="sf-lbl">Connected account</div>
                  <div className="sf-hint">{smtpAccount ? `${smtpAccount.from_email} · ${smtpAccount.status}` : 'No mailbox connected.'}</div>
                  {smtpAccount ? <div className="sf-hint">SMTP {smtpAccount.smtp_verified_at ? 'verified' : 'not verified'} · IMAP {smtpAccount.imap_verified_at ? 'verified' : 'not verified'}</div> : null}
                </div>
                <div className="sf" style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-outline" type="button" onClick={() => applyMailboxPreset('gmail')}>Gmail preset</button>
                  <button className="btn-outline" type="button" onClick={() => applyMailboxPreset('outlook')}>Outlook preset</button>
                </div>
                <div className="sf-hint">Use an app password when your provider requires two-step verification. Your credentials are encrypted before storage.</div>
                <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input className="sf-inp" value={smtpForm.from_email} onChange={event => setSmtpForm({ ...smtpForm, from_email: event.target.value })} placeholder="sender@company.com" required />
                  <input className="sf-inp" value={smtpForm.from_name} onChange={event => setSmtpForm({ ...smtpForm, from_name: event.target.value })} placeholder="Display name" required />
                </div>
                <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
                  <input className="sf-inp" value={smtpForm.smtp_host} onChange={event => setSmtpForm({ ...smtpForm, smtp_host: event.target.value })} placeholder="smtp.gmail.com" required />
                  <input className="sf-inp" type="number" value={smtpForm.smtp_port} onChange={event => setSmtpForm({ ...smtpForm, smtp_port: Number(event.target.value) })} required />
                </div>
                <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input className="sf-inp" value={smtpForm.smtp_username} onChange={event => setSmtpForm({ ...smtpForm, smtp_username: event.target.value })} placeholder="SMTP username" required />
                  <input className="sf-inp" type="password" value={smtpForm.smtp_password} onChange={event => setSmtpForm({ ...smtpForm, smtp_password: event.target.value })} placeholder="SMTP password" required />
                </div>
                <div className="sf" style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
                  <input className="sf-inp" value={smtpForm.imap_host} onChange={event => setSmtpForm({ ...smtpForm, imap_host: event.target.value })} placeholder="imap.gmail.com" required />
                  <input className="sf-inp" type="number" value={smtpForm.imap_port} onChange={event => setSmtpForm({ ...smtpForm, imap_port: Number(event.target.value) })} />
                </div>
                <div className="set-save">
                  <button className="btn-outline" type="button" disabled={!smtpAccount || busy === 'smtp-test'} onClick={handleTestSmtp}>
                    {busy === 'smtp-test' ? 'Testing...' : 'Test SMTP'}
                  </button>
                  <button className="btn-primary" type="submit" disabled={busy === 'smtp'}>{busy === 'smtp' ? 'Connecting...' : 'Save mailbox'}</button>
                </div>
              </form>
            </div>
          </section>
        ) : null}

        {activePage === 'billing' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Billing</h2>
                <p className="page-sub">Current plan and usage controls.</p>
              </div>
            </div>
            <div className="bill-grid">
              <div className="plan-card">
                <div className="plan-tag">{workspace?.plan || 'No plan'}</div>
                <div className="plan-name">Email automation</div>
                <div className="plan-price">V1 <small>configured locally</small></div>
                <div style={{ marginTop: 18 }}>
                  <Metric label="Daily cap across active campaign" value={selectedCampaign?.daily_send_cap?.toString() || '0'} />
                  <Metric label="Mailbox" value={smtpAccount?.from_email || 'missing'} />
                </div>
              </div>
              <div className="up-card">
                <div className="up-title">Stripe</div>
                <div className="up-sub">Checkout and subscription management are not connected in this build yet.</div>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === 'support' ? (
          <section>
            <div className="page-header">
              <div>
                <h2 className="page-title">Support</h2>
                <p className="page-sub">Operational checks for the email workflow.</p>
              </div>
            </div>
            <div className="an-grid">
              <div className="card">
                <div className="card-head"><div className="card-title">Setup checklist</div></div>
                <div className="msl-list">
                  <Metric label="Mailbox connected" value={smtpAccount ? 'yes' : 'no'} />
                  <Metric label="Leads with email" value={emailLeads.length.toString()} />
                  <Metric label="Campaign selected" value={selectedCampaign ? selectedCampaign.name : 'none'} />
                  <Metric label="Replies pending" value={pendingReplies.length.toString()} />
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-title">Known backend requirements</div></div>
                <div className="msl-list">
                  <Metric label="Redis worker" value="required for launch" />
                  <Metric label="Service role key" value="required for workers" />
                  <Metric label="Gemini key" value="required for generation" />
                  <Metric label="SMTP app password" value="required to send" />
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

function KpiRow({ items }: { items: Array<[string, number, string]> }) {
  return (
    <div className="kpi-row">
      {items.map(([label, value, marker], index) => (
        <div className="kpi-card" key={label}>
          <div className={`kpi-icon ${['ki-p', 'ki-g', 'ki-gr', 'ki-b'][index]}`}>{marker}</div>
          <div className="kpi-val">{value}</div>
          <div className="kpi-lbl">{label}</div>
          <span className="kpi-delta kd-neutral">Live</span>
        </div>
      ))}
    </div>
  );
}

function CampaignRow({ campaign, active, onClick }: { campaign: Campaign; active?: boolean; onClick: () => void }) {
  return (
    <button
      className="mtr"
      type="button"
      onClick={onClick}
      style={{ width: '100%', border: 0, textAlign: 'left', background: active ? 'var(--purple-pale)' : 'transparent' }}
    >
      <div className="mtr-av">{initials(campaign.name)}</div>
      <div className="mtr-info">
        <div className="mtr-name">{campaign.name}</div>
        <div className="mtr-detail">{campaign.daily_send_cap}/day · {campaign.send_window_start}-{campaign.send_window_end}</div>
      </div>
      <span className={`badge ${statusBadge(campaign.status)}`}><span className="bdot" />{campaign.status}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="msl-row">
      <span className="msl-lbl">{label}</span>
      <span className="msl-val">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="sf-hint" style={{ padding: 20 }}>{text}</div>;
}
