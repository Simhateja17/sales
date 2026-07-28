'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  approveInboxMessage,
  connectSmtp,
  createCampaign,
  createLead,
  deleteLead,
  downloadCsvImportErrors,
  getCampaignLeads,
  getCampaignPreview,
  getCampaigns,
  getApolloFilters,
  getApolloImport,
  getLatestApolloImport,
  getLeadImport,
  getInbox,
  getLeads,
  getMeetings,
  getSmtpStatus,
  getWorkspace,
  openBillingPortal,
  importApolloLeads,
  previewCsvMapping,
  replaceCampaignLeads,
  replaceCampaignSequence,
  startCsvImport,
  syncApolloEmails,
  testSmtp,
  updateLead,
  type ApolloFilters,
  type AgentConfig,
  type Campaign,
  type ConnectedAccount,
  type CsvMapping,
  type EmailMessage,
  type Lead,
  type LeadImportRun,
  type Meeting,
  type Workspace,
  type WorkspaceBilling,
} from '@/lib/api';
import Sidebar from './_lib/Sidebar';
import CampaignBuilderModal, { type CampaignBuilderSubmission } from './_components/CampaignBuilderModal';
import HomeOverview from './_components/HomeOverview';
import { CampaignRow, EmptyState, KpiRow, Metric, fmtDate, initials, navItems, statusBadge, type Page } from './_lib/ui';
import { csvTargets, terminalImportStatuses } from './_lib/leadImport';

type SettingsSection = 'mailbox' | 'workspace' | 'compliance';
type LeadView = 'all' | 'ready' | 'campaign' | 'attention';
type LeadDrawerMode = 'profile' | 'source';

const pageIds = new Set<string>(navItems.map(item => item.id));

const emptyLeadForm = {
  full_name: '',
  company_name: '',
  title: '',
  email: '',
  phone: '',
  notes_summary: '',
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

function isCampaignEligibleLead(lead: Lead | undefined) {
  return Boolean(
    lead?.email
    && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status || '')
    && lead.lifecycle_status !== 'suppressed'
    && lead.dnc_status !== 'blocked'
  );
}

function leadViewStatus(lead: Lead) {
  if (lead.lifecycle_status === 'selected_for_campaign' || lead.lifecycle_status === 'contacted') return 'In campaign';
  if (lead.enrichment_status === 'failed' || lead.enrichment_status === 'cooldown' || lead.dnc_status === 'pending') return 'Needs attention';
  return 'Ready to contact';
}

function leadViewClass(lead: Lead) {
  const status = leadViewStatus(lead);
  if (status === 'In campaign') return 'lead-status-campaign';
  if (status === 'Needs attention') return 'lead-status-attention';
  return 'lead-status-ready';
}

function leadEnrichment(lead: Lead) {
  const reasons = (lead.fit_reasons || []).map(reason => reason.reason).filter(Boolean);
  if (reasons.length) return reasons.slice(0, 2).join(', ');
  return lead.enrichment_status === 'completed' ? 'Company and role verified' : 'Work email verified';
}

function formatCompanyNumber(value?: number | null, prefix = '') {
  if (!value) return '—';
  return `${prefix}${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
}

function LeadResearchProfile({
  lead,
  onAddToCampaign,
  onEdit,
}: {
  lead: Lead;
  onAddToCampaign: () => void;
  onEdit: () => void;
}) {
  const company = lead.company_data || {};
  const profile = lead.personalization_profile || {};
  const person = profile.person || {};
  const companyProfile = profile.company || {};
  const companyName = lead.company_name || company.name || 'This company';
  const industry = company.industry || companyProfile.industry;
  const location = companyProfile.location || [company.city, company.state, company.country].filter(Boolean).join(', ') || lead.location;
  const technologies = company.technologies?.length ? company.technologies : (companyProfile.technologies || []);
  const researchFacts = profile.email_context?.map(item => item.fact).filter(Boolean) || [];
  const experience = person.relevant_experience || [];

  return (
    <div className="lead-drawer-scroll lead-profile-panel">
      <div className="lead-profile-top">
        <span className="lead-avatar lead-avatar-large">{initials(lead.full_name)}</span>
        <div>
          <h4>{lead.full_name}</h4>
          <p>{lead.title || 'Contact'} <span>·</span> {companyName}</p>
          <div className="lead-profile-status"><span className="lead-status lead-status-ready">Verified work email</span>{person.seniority ? <span>{person.seniority}</span> : null}</div>
        </div>
      </div>

      <section>
        <h5>Contact intelligence</h5>
        <div className="lead-detail-grid">
          <span><b>Role</b>{lead.title || '—'}</span>
          <span><b>Location</b>{person.location || lead.location || '—'}</span>
          <span><b>Department</b>{person.departments?.join(', ') || '—'}</span>
          <span><b>Email</b>{lead.email || '—'}</span>
        </div>
        {person.headline ? <p className="lead-detail-copy">{person.headline}</p> : null}
        {experience.length ? <div className="lead-experience"><b>Relevant experience</b>{experience.map((item, index) => <span key={`${item.organization}-${index}`}>{item.title || 'Role'} at {item.organization || 'company'}{item.current ? ' · current' : ''}</span>)}</div> : null}
      </section>

      <section>
        <h5>Company intelligence</h5>
        <div className="lead-company-stats lead-company-stats-rich">
          <span><strong>{company.estimated_num_employees || companyProfile.employee_count || '—'}</strong>Employees</span>
          <span><strong>{companyProfile.founded_year || (company.raw?.founded_year as string | number | undefined) || '—'}</strong>Founded</span>
          <span><strong>{company.latest_funding_stage || companyProfile.funding_stage || '—'}</strong>Latest funding</span>
          <span><strong>{formatCompanyNumber(company.total_funding, '$')}</strong>Total funding</span>
        </div>
        <div className="lead-detail-grid lead-company-facts">
          <span><b>Industry</b>{industry || '—'}</span>
          <span><b>Location</b>{location || '—'}</span>
          <span><b>Domain</b>{lead.company_domain || company.domain || '—'}</span>
          <span><b>Revenue</b>{formatCompanyNumber(company.annual_revenue, '$')}</span>
        </div>
        {company.short_description || companyProfile.description || lead.notes_summary ? <p className="lead-detail-copy">{company.short_description || companyProfile.description || lead.notes_summary}</p> : null}
        {technologies.length ? <div className="lead-tags"><b>Technology signals</b><div>{technologies.slice(0, 8).map(technology => <span key={technology}>{technology}</span>)}</div></div> : null}
      </section>

      <section>
        <h5>Why this lead is a fit</h5>
        <div className="lead-fit-list">
          {(lead.fit_reasons || []).length ? lead.fit_reasons.slice(0, 4).map((reason, index) => <span key={`${reason.reason}-${index}`}>+{reason.points} {reason.reason}</span>) : <span>{leadEnrichment(lead)}</span>}
        </div>
        {researchFacts.length ? <div className="lead-research-facts">{researchFacts.slice(0, 2).map((fact, index) => <p key={`${fact}-${index}`}>{fact}</p>)}</div> : null}
      </section>

      <section className="lead-email-use">
        <h5>What Barsha can use in email</h5>
        <p>{researchFacts[0] || `The verified role, ${industry || 'company'} context, and available technology signals can anchor a specific first message.`}</p>
      </section>
      <div className="lead-profile-actions"><button className="btn-primary" type="button" disabled={!isCampaignEligibleLead(lead)} onClick={onAddToCampaign}>Add to campaign</button><button className="btn-outline" type="button" onClick={onEdit}>Edit lead</button></div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = searchParams.get('page');
  const activePage: Page = requestedPage && pageIds.has(requestedPage) ? requestedPage as Page : 'overview';
  const setActivePage = (page: Page) => router.push(page === 'overview' ? '/dashboard' : `/dashboard?page=${page}`);
  const [today, setToday] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [billing, setBilling] = useState<WorkspaceBilling | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
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
  const [smtpForm, setSmtpForm] = useState(emptySmtpForm);
  const [apolloFilters, setApolloFilters] = useState<ApolloFilters>(emptyApolloFilters);
  const [apolloIndustryOptions, setApolloIndustryOptions] = useState<string[]>([]);
  const [csvText, setCsvText] = useState('');
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [lastCsvRun, setLastCsvRun] = useState<LeadImportRun | null>(null);
  const [csvMode, setCsvMode] = useState<'import' | 'suppress'>('import');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [managedLeadIds, setManagedLeadIds] = useState<string[]>([]);
  const [editingLeadId, setEditingLeadId] = useState('');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('mailbox');
  const [mailboxProvider, setMailboxProvider] = useState<'gmail' | 'outlook' | 'manual'>('manual');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignBuilderLeadIds, setCampaignBuilderLeadIds] = useState<string[]>([]);
  const [activeApolloRun, setActiveApolloRun] = useState<LeadImportRun | null>(null);
  const [apolloElapsedSeconds, setApolloElapsedSeconds] = useState(0);
  const [leadView, setLeadView] = useState<LeadView>('all');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leadDrawerMode, setLeadDrawerMode] = useState<LeadDrawerMode>('profile');
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const apolloMonitorRef = useRef('');
  const apolloRecoveryStartedRef = useRef(false);

  function redirectForAuthentication() {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login?reason=session&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const selectedCampaign = campaigns.find(campaign => campaign.id === selectedCampaignId) || campaigns[0] || null;
  const canEditSelectedCampaign = Boolean(selectedCampaign && ['draft', 'paused'].includes(selectedCampaign.status));
  const emailLeads = useMemo(
    () => leads.filter(isCampaignEligibleLead),
    [leads]
  );
  const visibleLeads = useMemo(
    () => leads.filter(lead => lead.dnc_status !== 'blocked' && lead.lifecycle_status !== 'suppressed' && (lead.source !== 'apollo' || ['ready', 'selected_for_campaign', 'contacted'].includes(lead.lifecycle_status))),
    [leads]
  );
  const attentionLeadCount = useMemo(
    () => leads.filter(lead => lead.enrichment_status === 'failed' || lead.enrichment_status === 'cooldown' || lead.dnc_status === 'pending').length,
    [leads]
  );
  const filteredLeads = useMemo(() => {
    if (leadView === 'ready') return visibleLeads.filter(lead => leadViewStatus(lead) === 'Ready to contact');
    if (leadView === 'campaign') return visibleLeads.filter(lead => leadViewStatus(lead) === 'In campaign');
    if (leadView === 'attention') return visibleLeads.filter(lead => leadViewStatus(lead) === 'Needs attention');
    return visibleLeads;
  }, [leadView, visibleLeads]);
  const selectedLead = useMemo(
    () => filteredLeads.find(lead => lead.id === selectedLeadId) || null,
    [filteredLeads, selectedLeadId]
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
        setBilling(data.billing);
        setAgentConfig(data.agentConfig);
        if (!data.workspace.plan || !data.subscriptionActive) {
          router.push('/plan-select');
        } else if (!data.workspace.onboarding_completed) {
          router.push('/onboarding');
        }
      })
      .catch(() => redirectForAuthentication());
  }, [router]);

  async function manageBilling() {
    setBillingBusy(true);
    try {
      const { url } = await openBillingPortal();
      window.location.assign(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open billing management.');
      setBillingBusy(false);
    }
  }

  useEffect(() => {
    const handleAuthenticationRequired = () => redirectForAuthentication();
    window.addEventListener('barsha:authentication-required', handleAuthenticationRequired);
    return () => window.removeEventListener('barsha:authentication-required', handleAuthenticationRequired);
  }, [router]);

  useEffect(() => {
    refreshAll().catch(error => setMessage(error.message));
    getApolloFilters()
      .then(data => {
        setApolloFilters(data.filters);
        setApolloIndustryOptions(data.industryOptions);
      })
      .catch(() => undefined);
    if (!apolloRecoveryStartedRef.current) {
      apolloRecoveryStartedRef.current = true;
      getLatestApolloImport()
        .then(({ importRun }) => {
          if (!importRun) return;
          setActiveApolloRun(importRun);
          if (!terminalImportStatuses.has(importRun.status)) {
            monitorApolloImport(importRun.id).catch(error => setMessage(error.message));
          }
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!activeApolloRun?.created_at) return;
    const rawStartedAt = typeof activeApolloRun.raw_meta?.started_at === 'string' ? activeApolloRun.raw_meta.started_at : null;
    const startedAt = new Date(activeApolloRun.started_at || rawStartedAt || activeApolloRun.created_at).getTime();
    const isTerminal = terminalImportStatuses.has(activeApolloRun.status);
    const terminalAt = activeApolloRun.completed_at ? new Date(activeApolloRun.completed_at).getTime() : Date.now();
    const updateElapsed = () => setApolloElapsedSeconds(Math.max(0, Math.floor(((isTerminal ? terminalAt : Date.now()) - startedAt) / 1000)));
    updateElapsed();
    if (isTerminal) return;
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [activeApolloRun?.id, activeApolloRun?.status, activeApolloRun?.created_at]);

  useEffect(() => {
    if (!selectedCampaign?.id) {
      setPreview([]);
      setSelectedLeadIds([]);
      return;
    }
    Promise.all([getCampaignPreview(selectedCampaign.id), getCampaignLeads(selectedCampaign.id)])
      .then(([previewData, leadData]) => {
        setPreview(previewData.messages);
        setSelectedLeadIds(leadData.lead_ids);
      })
      .catch(() => {
        setPreview([]);
        setSelectedLeadIds([]);
      });
  }, [selectedCampaign?.id]);

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
      if (editingLeadId) await updateLead(editingLeadId, leadForm);
      else await createLead({ ...leadForm, source: 'manual' });
      setLeadForm(emptyLeadForm);
      setEditingLeadId('');
      const data = await getLeads();
      setLeads(data.leads);
      setMessage(editingLeadId ? 'Lead updated.' : 'Lead saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save lead');
    } finally {
      setBusy('');
    }
  }

  function beginEditLead(lead: Lead) {
    setEditingLeadId(lead.id);
    setLeadForm({
      full_name: lead.full_name || '',
      company_name: lead.company_name || '',
      title: lead.title || '',
      email: lead.email || '',
      phone: lead.phone || '',
      notes_summary: lead.notes_summary || '',
    });
    setMessage(`Editing ${lead.full_name}.`);
  }

  function cancelEditLead() {
    setEditingLeadId('');
    setLeadForm(emptyLeadForm);
  }

  async function handleDeleteLeads(ids: string[]) {
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected lead${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBusy('lead-delete');
    setMessage('');
    try {
      await Promise.all(ids.map(id => deleteLead(id)));
      setLeads(current => current.filter(lead => !ids.includes(lead.id)));
      setManagedLeadIds(current => current.filter(id => !ids.includes(id)));
      setSelectedLeadIds(current => current.filter(id => !ids.includes(id)));
      if (editingLeadId && ids.includes(editingLeadId)) cancelEditLead();
      setMessage(`${ids.length} lead${ids.length === 1 ? '' : 's'} deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete leads');
    } finally {
      setBusy('');
    }
  }

  async function waitForImport(runId: string, loader: (id: string) => Promise<{ importRun: LeadImportRun }>) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const { importRun } = await loader(runId);
      const meta = importRun.raw_meta || {};
      setMessage(`Import ${importRun.status}: ${String(meta.ready_count ?? importRun.created_count)} ready/created, ${importRun.skipped_count} skipped.`);
      if (terminalImportStatuses.has(importRun.status)) return importRun;
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    throw new Error('Import is still running. You can safely refresh and check it later.');
  }

  async function monitorApolloImport(runId: string) {
    apolloMonitorRef.current = runId;
    setBusy('apollo');
    for (let attempt = 0; attempt < 450; attempt += 1) {
      if (apolloMonitorRef.current !== runId) return null;
      const { importRun } = await getApolloImport(runId);
      setActiveApolloRun(importRun);
      if (terminalImportStatuses.has(importRun.status)) {
        const leadData = await getLeads();
        setLeads(leadData.leads);
        setBusy('');
        const meta = importRun.raw_meta || {};
        setMessage(importRun.status === 'failed'
          ? `Apollo import failed: ${importRun.error_message || 'Unknown provider error'}`
          : `Apollo ${importRun.status}: ${String(meta.ready_count ?? 0)} ready leads from ${importRun.created_count} candidates.`);
        return importRun;
      }
      const startedAt = new Date(importRun.started_at || (typeof importRun.raw_meta?.started_at === 'string' ? importRun.raw_meta.started_at : importRun.created_at)).getTime();
      if (Date.now() - startedAt >= 10 * 60 * 1000) {
        setBusy('');
        setMessage('Apollo did not finish in time. Start a fresh import.');
        return null;
      }
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    setBusy('');
    setMessage('Apollo is taking longer than expected. The import is still running in the background and this page will keep its latest progress.');
    return null;
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
      setActiveApolloRun(data.importRun);
      await monitorApolloImport(data.importRun.id);
    } catch (error) {
      console.error('[apollo:frontend:import_failed]', error);
      setMessage(error instanceof Error ? error.message : 'Could not import Apollo leads');
    } finally {
      if (!activeApolloRun || terminalImportStatuses.has(activeApolloRun.status)) setBusy('');
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

  function openCampaignBuilder(leadIds: string[] = []) {
    setCampaignBuilderLeadIds(leadIds);
    setShowCampaignForm(true);
  }

  async function handleCreateCampaign({ campaign, brief, leadIds, steps }: CampaignBuilderSubmission) {
    setBusy('campaign');
    setMessage('');
    try {
      const data = await createCampaign({
        ...campaign,
        brief,
      });
      await Promise.all([
        replaceCampaignLeads(data.campaign.id, leadIds),
        replaceCampaignSequence(data.campaign.id, steps),
      ]);
      setCampaigns(current => [data.campaign, ...current]);
      setSelectedCampaignId(data.campaign.id);
      setCampaignBuilderLeadIds([]);
      setShowCampaignForm(false);
      router.push(`/dashboard/campaigns/${data.campaign.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create campaign');
    } finally {
      setBusy('');
    }
  }

  async function saveCampaignLeadSelection(leadIds: string[]) {
    if (!selectedCampaign) return;
    setBusy('campaign-leads');
    setMessage('');
    try {
      const data = await replaceCampaignLeads(selectedCampaign.id, leadIds);
      setSelectedLeadIds(data.lead_ids);
      const leadData = await getLeads();
      setLeads(leadData.leads);
      setMessage(`${data.lead_ids.length} lead${data.lead_ids.length === 1 ? '' : 's'} selected for ${selectedCampaign.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update campaign leads');
    } finally {
      setBusy('');
    }
  }

  async function toggleLeadInSelectedCampaign(leadId: string) {
    if (!selectedCampaign) {
      setMessage('Choose a campaign first.');
      return;
    }
    const nextIds = selectedLeadIds.includes(leadId)
      ? selectedLeadIds.filter(id => id !== leadId)
      : [...selectedLeadIds, leadId];
    await saveCampaignLeadSelection(nextIds);
  }

  async function addManagedLeadsToCampaign() {
    if (!selectedCampaign) {
      setActivePage('campaigns');
      setMessage('Choose or create a campaign, then add the selected leads.');
      return;
    }
    if (!canEditSelectedCampaign) {
      setMessage('Pause the campaign before adding leads.');
      return;
    }
    const eligibleIds = managedLeadIds.filter(id => {
      const lead = leads.find(item => item.id === id);
      return isCampaignEligibleLead(lead);
    });
    if (!eligibleIds.length) {
      setMessage('Select at least one ready lead with an email address.');
      return;
    }
    await saveCampaignLeadSelection([...new Set([...selectedLeadIds, ...eligibleIds])]);
    setManagedLeadIds([]);
  }


  async function refreshCampaignsOnly(nextSelectedId?: string) {
    const data = await getCampaigns();
    setCampaigns(data.campaigns);
    if (nextSelectedId) setSelectedCampaignId(nextSelectedId);
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
    setMailboxProvider(provider);
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
    setMessage(`${provider === 'gmail' ? 'Gmail' : 'Outlook'} settings applied. Enter your email, username, and app password below.`);
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

  function openLeadResearch(lead: Lead) {
    setSelectedLeadId(lead.id);
    setLeadDrawerMode('profile');
    setLeadDrawerOpen(true);
    setSidebarCollapsed(true);
  }

  function openLeadSourcing() {
    setLeadDrawerMode('source');
    setLeadDrawerOpen(true);
  }

  function closeLeadDrawer() {
    setLeadDrawerOpen(false);
    setLeadDrawerMode('profile');
  }

  return (
    <>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        workspace={workspace}
        smtpAccount={smtpAccount}
        pendingReplies={pendingReplies.length}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(current => !current)}
        onError={setMessage}
      />


      <main className={`main-content${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
        {activePage !== 'overview' ? <div className="dash-topbar">
          <div>
            <h1 className="dash-greeting">Email command center</h1>
            <p className="dash-date">{today}</p>
          </div>
          <div className="page-actions">
            <button type="button" className="btn-outline" onClick={() => refreshAll().catch(error => setMessage(error.message))}>
              Refresh
            </button>
            <button type="button" className="btn-primary" onClick={() => {
              setActivePage('campaigns');
              openCampaignBuilder();
            }}>
              New campaign
            </button>
          </div>
        </div> : null}

        {message ? <div className="pdpa-banner">{message}</div> : null}

        {activePage === 'overview' ? (
          <HomeOverview
            workspace={workspace}
            campaigns={campaigns}
            emailLeads={emailLeads}
            inbox={inbox}
            meetings={meetings}
            smtpAccount={smtpAccount}
            onCreateCampaign={() => {
              setActivePage('campaigns');
              openCampaignBuilder();
            }}
            onOpenCampaigns={() => setActivePage('campaigns')}
            onOpenLeads={() => setActivePage('leads')}
            onOpenInbox={() => setActivePage('inbox')}
            onOpenSettings={() => setActivePage('settings')}
          />
        ) : null}

        {activePage === 'campaigns' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">Outbound workspace</div>
                <h2 className="page-title">Campaigns with a review gate</h2>
                <p className="page-sub">Build the audience and sequence together, review every generated email, then launch only what you approve.</p>
              </div>
              <div className="page-actions">
                <button className="btn-primary" type="button" onClick={() => openCampaignBuilder()}>New campaign</button>
              </div>
            </div>
            <div className="campaign-list-layout">
              <div className="card campaign-list-panel">
                <div className="card-head">
                  <div className="card-title">Campaign list</div>
                  <span className="card-action">{campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}</span>
                </div>
                {campaigns.length ? campaigns.map(campaign => (
                  <CampaignRow key={campaign.id} campaign={campaign} onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)} />
                )) : <EmptyState text="Create your first campaign." />}
              </div>
              <aside className="set-panel campaign-list-summary">
                <div className="sf-lbl">Campaign workflow</div>
                <div className="sf-hint" style={{ marginTop: 10 }}>
                  Create a campaign with verified leads and its email steps in one place. Every draft still needs your approval before it sends.
                </div>
                <div className="msl-list" style={{ marginTop: 18 }}>
                  <Metric label="Active" value={campaigns.filter(c => c.status === 'active').length.toString()} />
                  <Metric label="Draft" value={campaigns.filter(c => c.status === 'draft').length.toString()} />
                  <Metric label="Verified leads" value={emailLeads.length.toString()} />
                </div>
                <div className="set-save">
                  <button className="btn-primary" type="button" onClick={() => openCampaignBuilder()}>Open campaign builder</button>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {activePage === 'leads' ? (
          <section className="leads-page">
            <div className="leads-page-head">
              <div>
                <h2 className="leads-title">Leads</h2>
                <p className="leads-subtitle">Your verified audience</p>
              </div>
              <button className="btn-primary" type="button" onClick={openLeadSourcing}>Find leads</button>
            </div>

            <div className="lead-metrics" aria-label="Lead library summary">
              <div><strong>{visibleLeads.length}</strong><span>Verified work emails</span></div>
              <div><strong>{visibleLeads.filter(lead => leadViewStatus(lead) === 'Ready to contact').length}</strong><span>Ready for review</span></div>
              <div><strong>{attentionLeadCount}</strong><span>Need attention</span></div>
            </div>

            <div className="leads-workspace">
              <main className="leads-library">
                <div className="lead-tabs" role="tablist" aria-label="Lead status">
                  {([
                    ['all', 'All leads'],
                    ['ready', 'Ready'],
                    ['campaign', 'In campaign'],
                    ['attention', 'Needs attention'],
                  ] as Array<[LeadView, string]>).map(([view, label]) => (
                    <button key={view} type="button" role="tab" aria-selected={leadView === view} className={leadView === view ? 'active' : ''} onClick={() => setLeadView(view)}>{label}</button>
                  ))}
                </div>
                <p className="lead-verification-note"><span aria-hidden="true">◇</span> Only leads with a verified work email appear here.</p>
                <div className="lead-table-card">
                  <div className="lead-table-scroll"><table className="lead-table">
                    <thead>
                      <tr>
                        <th><input className="cb" aria-label="Select all visible leads" type="checkbox" checked={Boolean(filteredLeads.length) && filteredLeads.every(lead => managedLeadIds.includes(lead.id))} onChange={event => setManagedLeadIds(event.target.checked ? Array.from(new Set([...managedLeadIds, ...filteredLeads.map(lead => lead.id)])) : managedLeadIds.filter(id => !filteredLeads.some(lead => lead.id === id)))} /></th>
                        <th>Lead</th><th>Company</th><th>Status</th><th>Enrichment</th><th>Last updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className={selectedLead?.id === lead.id ? 'selected' : ''}>
                          <td onClick={event => event.stopPropagation()}><input className="cb" aria-label={`Select ${lead.full_name}`} type="checkbox" checked={managedLeadIds.includes(lead.id)} onChange={() => setManagedLeadIds(current => current.includes(lead.id) ? current.filter(id => id !== lead.id) : [...current, lead.id])} /></td>
                          <td><button className="lead-person-button" type="button" onClick={() => openLeadResearch(lead)}><span className="lead-avatar">{initials(lead.full_name)}</span><span><strong>{lead.full_name}</strong><small>{lead.title || 'Contact'}</small></span></button></td>
                          <td><div className="lead-company"><span>{initials(lead.company_name)}</span>{lead.company_name || 'Independent'}</div></td>
                          <td><span className={`lead-status ${leadViewClass(lead)}`}>{leadViewStatus(lead)}</span></td>
                          <td><span className="lead-enrichment">{leadEnrichment(lead)}</span></td>
                          <td className="lead-updated">{fmtDate(lead.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                  {!filteredLeads.length ? <EmptyState text="No leads match this view yet." /> : null}
                  <div className="lead-table-footer">
                    <span>Showing {filteredLeads.length ? `1–${filteredLeads.length}` : '0'} of {filteredLeads.length} leads</span>
                    {managedLeadIds.length ? <div><button className="btn-outline" type="button" disabled={busy === 'lead-delete'} onClick={() => handleDeleteLeads(managedLeadIds)}>Delete selected</button><button className="btn-primary" type="button" onClick={() => openCampaignBuilder(managedLeadIds.filter(id => isCampaignEligibleLead(leads.find(lead => lead.id === id))))}>Add to campaign</button></div> : null}
                  </div>
                </div>
              </main>

              {leadDrawerOpen ? <div className="lead-drawer-overlay" role="presentation" onMouseDown={closeLeadDrawer}>
              <aside className="lead-drawer" role="dialog" aria-modal="true" aria-label={leadDrawerMode === 'source' ? 'Lead sourcing' : 'Lead research'} onMouseDown={event => event.stopPropagation()}>
                <div className="lead-drawer-head"><h3>{leadDrawerMode === 'source' ? 'Lead sourcing' : 'Lead research'}</h3><button type="button" aria-label="Close lead panel" onClick={closeLeadDrawer}>×</button></div>
                {leadDrawerMode === 'source' ? (
                  <div className="lead-drawer-scroll lead-source-panel">
                    <p>Find candidates, enrich them, and retain returned work emails. These filters use your onboarding preferences.</p>
                    <label>Contact roles<input className="sf-inp" value={apolloFilters.titles.join(', ')} onChange={event => setApolloFilters({ ...apolloFilters, titles: event.target.value.split(',').map(item => item.trim()).filter(Boolean) })} placeholder="Founder, CEO, Head of Sales" /></label>
                    <div className="lead-source-grid"><label>Region<input className="sf-inp" value={apolloFilters.region} onChange={event => setApolloFilters({ ...apolloFilters, region: event.target.value })} placeholder="Singapore" /></label><label>Industry<input className="sf-inp" value={apolloFilters.industry} onChange={event => setApolloFilters({ ...apolloFilters, industry: event.target.value })} placeholder="Industry" list="apollo-industry-options" /></label></div>
                    <datalist id="apollo-industry-options">{apolloIndustryOptions.map(industry => <option key={industry} value={industry} />)}</datalist>
                    <div className="lead-source-grid"><label>Company size<input className="sf-inp" value={apolloFilters.companySize} onChange={event => setApolloFilters({ ...apolloFilters, companySize: event.target.value })} placeholder="11-50" /></label><label>Lead limit<input className="sf-inp" type="number" min={1} max={100} value={apolloFilters.limit} onChange={event => setApolloFilters({ ...apolloFilters, limit: Number(event.target.value) })} /></label></div>
                    <button className="btn-primary lead-full-button" type="button" disabled={busy === 'apollo'} onClick={handleApolloImport}>{busy === 'apollo' ? 'Importing...' : 'Import from Apollo'}</button>
                    <button className="btn-outline lead-full-button" type="button" disabled={busy === 'apollo-sync'} onClick={handleApolloSync}>{busy === 'apollo-sync' ? 'Syncing...' : 'Sync Apollo emails'}</button>
                    {activeApolloRun ? <ApolloImportProgress run={activeApolloRun} elapsedSeconds={apolloElapsedSeconds} /> : <p className="lead-source-note">Most 25-lead imports take roughly 2–5 minutes. Apollo response time can vary.</p>}
                    <details className="lead-source-details"><summary>{editingLeadId ? 'Editing lead' : 'Add a lead manually'}</summary><form onSubmit={handleCreateLead}>{Object.keys(emptyLeadForm).map(key => <input key={key} className="sf-inp" value={leadForm[key as keyof typeof leadForm]} onChange={event => setLeadForm({ ...leadForm, [key]: event.target.value })} placeholder={key.replaceAll('_', ' ')} required={key === 'full_name' || key === 'email'} />)}<button className="btn-outline" type="submit" disabled={busy === 'lead'}>{busy === 'lead' ? 'Saving...' : editingLeadId ? 'Update lead' : 'Save lead'}</button>{editingLeadId ? <button className="card-action" type="button" onClick={cancelEditLead}>Cancel edit</button> : null}</form></details>
                    <details className="lead-source-details"><summary>Import a CSV</summary><input className="sf-inp" type="file" accept=".csv,text/csv" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setCsvText(await file.text()); setCsvMappings([]); setCsvPreview([]); }} /><select className="sf-inp" value={csvMode} onChange={event => setCsvMode(event.target.value as 'import' | 'suppress')}><option value="import">Import leads</option><option value="suppress">Exclude from future searches</option></select><button className="btn-outline" type="button" disabled={!csvText || busy === 'csv-preview'} onClick={handleCsvPreview}>{busy === 'csv-preview' ? 'Mapping...' : 'Map columns with AI'}</button>{csvMappings.length ? <div className="lead-csv-mapping">{csvMappings.map((mapping, index) => <label key={`${mapping.source}-${index}`}>{mapping.source}<select className="sf-inp" value={mapping.target} onChange={event => setCsvMappings(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, target: event.target.value } : item))}>{csvTargets.map(target => <option key={target} value={target}>{target}</option>)}</select></label>)}<button className="btn-primary" type="button" disabled={busy === 'csv'} onClick={handleCsvImport}>{busy === 'csv' ? 'Importing...' : `Confirm and ${csvMode === 'suppress' ? 'exclude' : 'import'}`}</button>{lastCsvRun && lastCsvRun.skipped_count > 0 ? <button className="btn-outline" type="button" onClick={handleDownloadCsvErrors}>Download skipped-row report</button> : null}</div> : null}</details>
                  </div>
                ) : selectedLead ? (
                  <LeadResearchProfile
                    lead={selectedLead}
                    onAddToCampaign={() => { closeLeadDrawer(); openCampaignBuilder([selectedLead.id]); }}
                    onEdit={() => { beginEditLead(selectedLead); setLeadDrawerMode('source'); }}
                  />
                ) : <div className="lead-empty-profile"><p>Select a lead to review its context, or start a new Apollo search.</p><button className="btn-primary" type="button" onClick={openLeadSourcing}>Find leads</button></div>}
              </aside>
              </div> : null}
            </div>
          </section>
        ) : null}

        {activePage === 'inbox' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">Conversations</div>
                <h2 className="page-title">Reply with context</h2>
                <p className="page-sub">Every reply keeps the lead and company context alongside an AI draft for your approval.</p>
              </div>
            </div>
            <div className="inbox-workspace">
              <div className="card inbox-thread-panel">
                <div className="card-head">
                  <div>
                    <div className="card-title">Reply queue</div>
                    <div className="sf-hint">Approve a draft when it is ready to send.</div>
                  </div>
                  <span className="card-action">{inbox.length} conversation{inbox.length === 1 ? '' : 's'}</span>
                </div>
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
                          {busy === item.id ? 'Sending...' : 'Approve reply'}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : <EmptyState text="No inbound replies yet. Replies from launched campaigns appear here for review." />}
              </div>
              <aside className="set-panel inbox-summary-panel">
                <div className="sf-lbl">Conversation health</div>
                <div className="msl-list" style={{ marginTop: 18 }}>
                  <Metric label="Needs review" value={pendingReplies.length.toString()} />
                  <Metric label="Positive intent" value={inbox.filter(item => item.intent_classification === 'positive').length.toString()} />
                  <Metric label="Meetings booked" value={meetings.length.toString()} />
                </div>
                <div className="sf-hint" style={{ marginTop: 18 }}>Your reply is never sent just because it was drafted. Check the tone and approve it deliberately.</div>
              </aside>
            </div>
          </section>
        ) : null}

        {activePage === 'meetings' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">Pipeline</div>
                <h2 className="page-title">Meetings that move forward</h2>
                <p className="page-sub">Positive replies become a clear, quiet meeting queue.</p>
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
                <div className="page-kicker">Performance</div>
                <h2 className="page-title">See what earns a reply</h2>
                <p className="page-sub">Live campaign, delivery, and conversation signals in one place.</p>
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
                <div className="page-kicker">Workspace controls</div>
                <h2 className="page-title">Set the right sending foundation</h2>
                <p className="page-sub">Connect the sender mailbox used by campaigns and inbox polling, then keep targeting and safeguards current.</p>
              </div>
            </div>
            <div className="set-grid">
              <div className="set-nav">
                <button type="button" className={`sn-item${settingsSection === 'mailbox' ? ' active' : ''}`} onClick={() => setSettingsSection('mailbox')}>SMTP and IMAP</button>
                <button type="button" className={`sn-item${settingsSection === 'workspace' ? ' active' : ''}`} onClick={() => setSettingsSection('workspace')}>Workspace</button>
                <button type="button" className={`sn-item${settingsSection === 'compliance' ? ' active' : ''}`} onClick={() => setSettingsSection('compliance')}>Compliance</button>
              </div>
              {settingsSection === 'mailbox' ? <form className="set-panel" onSubmit={handleSmtpConnect}>
                <div className="sf">
                  <div className="sf-lbl">Connected account</div>
                  <div className="sf-hint">{smtpAccount ? `${smtpAccount.from_email} · ${smtpAccount.status}` : 'No mailbox connected.'}</div>
                  {smtpAccount ? <div className="sf-hint">SMTP {smtpAccount.smtp_verified_at ? 'verified' : 'not verified'} · IMAP {smtpAccount.imap_verified_at ? 'verified' : 'not verified'}</div> : null}
                </div>
                <div className="sf" style={{ display: 'flex', gap: 10 }}>
                  <button className={mailboxProvider === 'gmail' ? 'btn-primary' : 'btn-outline'} type="button" onClick={() => applyMailboxPreset('gmail')}>Gmail preset</button>
                  <button className={mailboxProvider === 'outlook' ? 'btn-primary' : 'btn-outline'} type="button" onClick={() => applyMailboxPreset('outlook')}>Outlook preset</button>
                  <button className={mailboxProvider === 'manual' ? 'btn-primary' : 'btn-outline'} type="button" onClick={() => {
                    setMailboxProvider('manual');
                    setSmtpForm(current => ({ ...current, smtp_host: '', imap_host: '' }));
                    setMessage('Manual setup selected. Enter the SMTP and IMAP values supplied by your email provider.');
                  }}>Manual</button>
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
                    {busy === 'smtp-test' ? 'Testing...' : 'Test connection'}
                  </button>
                  <button className="btn-primary" type="submit" disabled={busy === 'smtp'}>{busy === 'smtp' ? 'Connecting...' : 'Save mailbox'}</button>
                </div>
                <div className="sf" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--cream-dark)' }}>
                  <div className="sf-lbl">{mailboxProvider === 'gmail' ? 'Connect Gmail' : mailboxProvider === 'outlook' ? 'Connect Outlook' : 'Manual connection instructions'}</div>
                  {mailboxProvider === 'gmail' ? (
                    <ol className="sf-hint" style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Turn on two-step verification for your Google account.</li>
                      <li>Create an app password for Mail and paste it into SMTP password.</li>
                      <li>Use your complete Gmail address as the SMTP username.</li>
                      <li>Save the mailbox; Barsha will verify both sending and inbox access.</li>
                    </ol>
                  ) : mailboxProvider === 'outlook' ? (
                    <ol className="sf-hint" style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Use your complete Microsoft 365 email as the SMTP username.</li>
                      <li>Use an app password if your organization requires multi-factor authentication and permits app passwords.</li>
                      <li>Ask your Microsoft 365 administrator to enable authenticated SMTP and IMAP for this mailbox if verification fails.</li>
                      <li>Save the mailbox; Barsha will verify both protocols before marking it connected.</li>
                    </ol>
                  ) : (
                    <ol className="sf-hint" style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Copy the SMTP and IMAP hosts, ports, username, and app password from your provider.</li>
                      <li>SMTP port 587 normally uses TLS; IMAP commonly uses port 993.</li>
                      <li>Save first, then use Test connection to verify sending and inbox access.</li>
                    </ol>
                  )}
                </div>
              </form> : null}
              {settingsSection === 'workspace' ? (
                <div className="set-panel">
                  <div className="sf-lbl">Workspace</div>
                  <div className="msl-list" style={{ marginTop: 16 }}>
                    <Metric label="Name" value={workspace?.name || 'Workspace'} />
                    <Metric label="Plan" value={workspace?.plan || 'Not selected'} />
                    <Metric label="Onboarding" value={workspace?.onboarding_completed ? 'Complete' : 'Incomplete'} />
                    <Metric label="Visible leads" value={visibleLeads.length.toString()} />
                  </div>
                  <div className="sf-hint" style={{ marginTop: 18 }}>Lead targeting and email-writing preferences are managed through onboarding. Billing controls are kept separate.</div>
                  <div className="set-save">
                    <button className="btn-outline" type="button" onClick={() => router.push('/onboarding')}>Edit targeting</button>
                    <button className="btn-primary" type="button" onClick={() => setActivePage('billing')}>View billing</button>
                  </div>
                </div>
              ) : null}
              {settingsSection === 'compliance' ? (
                <div className="set-panel">
                  <div className="sf-lbl">Email compliance</div>
                  <div className="sf-hint" style={{ marginTop: 8 }}>These safeguards are applied to campaign sending and replies.</div>
                  <div className="msl-list" style={{ marginTop: 18 }}>
                    <Metric label="Verified sender required" value="Enabled" />
                    <Metric label="Unsubscribe footer" value="Added automatically" />
                    <Metric label="Reply opt-outs" value="Block future sends" />
                    <Metric label="Suppression CSV" value="Available in Leads" />
                    <Metric label="Generic emails" value="Rejected during enrichment" />
                  </div>
                  <div className="sf-hint" style={{ marginTop: 18 }}>Barsha stops future campaign selection after an unsubscribe or suppression match. Your organization remains responsible for its sending identity, lawful basis, audience, and regional requirements.</div>
                  <div className="set-save">
                    <button className="btn-outline" type="button" onClick={() => setActivePage('leads')}>Manage suppressions</button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activePage === 'billing' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">Plan and usage</div>
                <h2 className="page-title">Keep the sending plan in view</h2>
                <p className="page-sub">Current plan, mailbox connection, and daily sending allowance.</p>
              </div>
            </div>
            <div className="bill-grid">
              <div className="plan-card">
                <div className="plan-tag">{workspace?.plan || 'No plan'}</div>
                <div className="plan-name">Email automation</div>
                <div className="plan-price">{billing?.subscription_status === 'active' ? 'Active' : 'Payment required'} <small>{billing?.current_period_end ? `renews ${fmtDate(billing.current_period_end)}` : 'annual subscription'}</small></div>
                <div style={{ marginTop: 18 }}>
                  <Metric label="Daily cap across active campaign" value={selectedCampaign?.daily_send_cap?.toString() || '0'} />
                  <Metric label="Mailbox" value={smtpAccount?.from_email || 'missing'} />
                </div>
              </div>
              <div className="up-card">
                <div className="up-title">Stripe</div>
                <div className="up-sub">Manage your plan, payment method, invoices, upgrades, or cancellation securely through Stripe.</div>
                <div className="set-save"><button className="btn-primary" type="button" disabled={!billing?.stripe_customer_id || billingBusy} onClick={manageBilling}>{billingBusy ? 'Opening Stripe...' : 'Manage billing'}</button></div>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === 'support' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">System health</div>
                <h2 className="page-title">Keep the workflow reliable</h2>
                <p className="page-sub">A practical checklist for the services that make campaign sending work.</p>
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
      <CampaignBuilderModal
        open={showCampaignForm}
        leads={emailLeads}
        agentConfig={agentConfig}
        initialLeadIds={campaignBuilderLeadIds}
        isSubmitting={busy === 'campaign'}
        onClose={() => {
          setShowCampaignForm(false);
          setCampaignBuilderLeadIds([]);
        }}
        onSubmit={handleCreateCampaign}
      />
    </>
  );
}

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (!minutes) return `${remainder}s`;
  return `${minutes}m ${remainder.toString().padStart(2, '0')}s`;
}

function ApolloImportProgress({ run, elapsedSeconds }: { run: LeadImportRun; elapsedSeconds: number }) {
  const meta = run.raw_meta || {};
  const stage = String(meta.stage || run.status);
  const page = Number(meta.current_page || 0);
  const pageCap = Number(meta.page_cap || 10);
  const batch = Number(meta.current_enrichment_batch || 0);
  const totalBatches = Number(meta.total_enrichment_batches || 1);
  const ready = Number(meta.ready_count || 0);
  const target = Number(meta.target_ready_count || meta.requested_limit || run.total_rows || 0);
  const lastProgressAt = String(meta.last_progress_at || run.created_at || '');
  const lastProgressOffset = lastProgressAt && run.created_at
    ? Math.max(0, Math.floor((new Date(lastProgressAt).getTime() - new Date(run.created_at).getTime()) / 1000))
    : 0;
  const progressAgeSeconds = Math.max(0, elapsedSeconds - lastProgressOffset);
  const backendEta = Number(meta.eta_seconds || 0);
  const remainingSeconds = Math.max(0, backendEta - progressAgeSeconds);
  const stalled = !terminalImportStatuses.has(run.status) && progressAgeSeconds > 90;
  let percent = 5;
  if (stage === 'searching') percent = 10 + Math.round(Math.min(1, page / Math.max(1, pageCap)) * 25);
  if (stage === 'enriching') percent = 40 + Math.round(Math.min(1, batch / Math.max(1, totalBatches)) * 40);
  if (stage === 'waiting_for_enrichment') percent = 82 + Math.round(Math.min(1, ready / Math.max(1, target)) * 15);
  if (terminalImportStatuses.has(run.status)) percent = 100;

  return (
    <div className={`import-progress${run.status === 'failed' ? ' failed' : ''}`}>
      <div className="import-progress-head">
        <div>
          <div className="import-progress-stage">{String(meta.stage_label || 'Preparing import')}</div>
          <div className="sf-hint">Elapsed {formatDuration(elapsedSeconds)}</div>
        </div>
        <strong>{percent}%</strong>
      </div>
      <div className="import-progress-track"><span style={{ width: `${percent}%` }} /></div>
      <div className="import-progress-stats">
        <span>Searched <strong>{Number(meta.searched_count || 0)}</strong></span>
        <span>Candidates <strong>{Number(meta.candidate_count || run.created_count || 0)}</strong></span>
        <span>Enrichment requested <strong>{Number(meta.enrichment_requested_count || 0)}</strong></span>
        <span>Ready <strong>{ready}/{target}</strong></span>
      </div>
      {run.status === 'failed' ? <div className="import-progress-note">{run.error_message || 'The import failed. Check the backend log and retry.'}</div>
        : terminalImportStatuses.has(run.status) ? <div className="import-progress-note">Finished in {formatDuration(elapsedSeconds)}.</div>
          : stalled ? <div className="import-progress-note">This stage is taking longer than usual. Barsha is still checking; you can leave this page and return later.</div>
            : <div className="import-progress-note">{remainingSeconds > 5 ? `About ${formatDuration(remainingSeconds)} remaining` : 'Finishing this stage…'} · This is a live estimate.</div>}
    </div>
  );
}
