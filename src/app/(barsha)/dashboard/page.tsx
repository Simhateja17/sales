'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveFollowUp,
  attachTelephony,
  createLead,
  getAgentLaunchJob,
  getApolloFilters,
  getCallingStatus,
  getLeads,
  getMeetings,
  getOutcomes,
  getWorkspace,
  importApolloLeads,
  importCsvLeads,
  provisionVoiceAgent,
  setCallingLaunch,
  setLeadDncStatus,
  setLeadVoiceConsent,
  updateFollowUp,
  type ApolloFilters,
  type AgentConfig,
  type CallOutcome,
  type AIJob,
  type CallingStatus,
  type FollowUp,
  type Lead,
  type Meeting,
  type Workspace,
} from '@/lib/api';

type Page = 'dashboard' | 'leads' | 'calls' | 'meetings' | 'analytics' | 'settings' | 'billing' | 'team';
type SettingsPanel = 'identity' | 'voice' | 'script' | 'schedule' | 'compliance';

export default function DashboardPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('identity');
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [today, setToday] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [callingStatus, setCallingStatus] = useState<CallingStatus | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [outcomes, setOutcomes] = useState<CallOutcome[]>([]);
  const [leadMessage, setLeadMessage] = useState('');
  const [callingMessage, setCallingMessage] = useState('');
  const [savingLead, setSavingLead] = useState(false);
  const [callingBusy, setCallingBusy] = useState(false);
  const [launchJobId, setLaunchJobId] = useState('');
  const [launchJob, setLaunchJob] = useState<AIJob | null>(null);
  const [csvText, setCsvText] = useState('');
  const [telephonyNumber, setTelephonyNumber] = useState('');
  const [apolloBusy, setApolloBusy] = useState(false);
  const [apolloFilters, setApolloFilters] = useState<ApolloFilters>({
    titles: ['Founder', 'CEO', 'Managing Director', 'Head of Sales'],
    region: 'Singapore',
    industry: '',
    companySize: '',
    limit: 25,
  });
  const [leadForm, setLeadForm] = useState({
    full_name: '',
    company_name: '',
    title: '',
    phone: '',
    email: '',
    note: '',
    next_action: '',
    due_at: '',
    priority: 'normal',
    owner_type: 'agent',
  });

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
        setAgentConfig(data.agentConfig);

        if (!data.workspace.plan) {
          router.push('/plan-select');
        } else if (!data.workspace.onboarding_completed) {
          router.push('/onboarding');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    const queryJobId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('launchJobId')
      : '';
    const savedJobId = typeof window !== 'undefined' ? sessionStorage.getItem('barsha_launch_job_id') : '';
    const initialJobId = queryJobId || savedJobId;

    if (initialJobId) {
      setLaunchJobId(initialJobId);
      if (queryJobId) {
        sessionStorage.setItem('barsha_launch_job_id', queryJobId);
      }
    }

    refreshLeads().catch(() => {
      // Auth routing is handled by workspace loading; keep this page resilient.
    });
    refreshCalling().catch(() => {
      // Calling readiness is optional until backend/env is configured.
    });
    refreshOutcomes().catch(() => {
      // Outcome pages stay empty until calls or calendar events exist.
    });
    getApolloFilters()
      .then(data => setApolloFilters(data.filters))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!launchJobId) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const data = await getAgentLaunchJob(launchJobId);
        if (cancelled) return;
        setLaunchJob(data.job);

        if (data.job.status === 'completed' || data.job.status === 'failed') {
          sessionStorage.removeItem('barsha_launch_job_id');
          return;
        }
      } catch {
        if (cancelled) return;
      }

      timer = setTimeout(poll, 2500);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [launchJobId]);

  async function refreshLeads() {
    const data = await getLeads();
    setLeads(data.leads);
    setFollowUps(data.followUps);
  }

  async function refreshCalling() {
    const data = await getCallingStatus();
    setCallingStatus(data);
    setTelephonyNumber(data.workspaceTelephony?.from_number || '');

    if (data.latestLaunchJob) {
      setLaunchJob(data.latestLaunchJob);
      const queryLaunchJobId = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('launchJobId')
        : '';

      if (!launchJobId && !queryLaunchJobId) {
        setLaunchJobId(data.latestLaunchJob.id);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('barsha_launch_job_id', data.latestLaunchJob.id);
        }
      }
    }
  }

  async function refreshOutcomes() {
    const [meetingData, outcomeData] = await Promise.all([getMeetings(), getOutcomes()]);
    setMeetings(meetingData.meetings);
    setOutcomes(outcomeData.outcomes);
  }

  function updateLeadForm(key: string, value: string) {
    setLeadForm(prev => ({ ...prev, [key]: value }));
  }

  function parseCsvRows(value: string) {
    const lines = value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => header.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map(line => {
      const cells = line.split(',').map(cell => cell.trim());
      return headers.reduce<Record<string, string>>((row, header, index) => {
        row[header] = cells[index] || '';
        return row;
      }, {});
    });
  }

  async function handleCreateLead() {
    setLeadMessage('');
    setSavingLead(true);
    try {
      await createLead({
        ...leadForm,
        follow_up: leadForm.next_action || leadForm.due_at ? {
          title: leadForm.next_action || 'Follow up with lead',
          due_at: leadForm.due_at || null,
          priority: leadForm.priority,
          owner_type: leadForm.owner_type,
          action_type: leadForm.owner_type === 'agent' ? 'call' : 'manual_task',
        } : undefined,
      });
      setLeadForm({
        full_name: '',
        company_name: '',
        title: '',
        phone: '',
        email: '',
        note: '',
        next_action: '',
        due_at: '',
        priority: 'normal',
        owner_type: 'agent',
      });
      setLeadMessage('Lead saved.');
      await refreshLeads();
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : 'Failed to save lead.');
    } finally {
      setSavingLead(false);
    }
  }

  async function handleImportCsv() {
    setLeadMessage('');
    const rows = parseCsvRows(csvText);
    if (!rows.length) {
      setLeadMessage('CSV needs a header row and at least one lead row.');
      return;
    }

    setSavingLead(true);
    try {
      const result = await importCsvLeads(rows);
      setLeadMessage(`CSV imported: ${result.importRun.created_count} created, ${result.importRun.updated_count} updated, ${result.importRun.skipped_count} skipped.`);
      setCsvText('');
      await refreshLeads();
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : 'Failed to import CSV.');
    } finally {
      setSavingLead(false);
    }
  }

  function updateApolloFilter(key: keyof ApolloFilters, value: string) {
    setApolloFilters(prev => ({
      ...prev,
      [key]: key === 'titles'
        ? value.split(',').map(item => item.trim()).filter(Boolean)
        : key === 'limit'
          ? Math.max(1, Number.parseInt(value, 10) || 25)
          : value,
    }));
  }

  async function handleImportApollo() {
    setLeadMessage('');
    setApolloBusy(true);
    try {
      const result = await importApolloLeads(apolloFilters);
      setLeadMessage(`Apollo imported: ${result.importRun.created_count} created, ${result.importRun.updated_count} updated, ${result.importRun.skipped_count} skipped. Phone enrichment is pending by webhook.`);
      await refreshLeads();
      await refreshCalling().catch(() => undefined);
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : 'Failed to import Apollo leads.');
    } finally {
      setApolloBusy(false);
    }
  }

  async function completeFollowUp(followUpId: string) {
    await updateFollowUp(followUpId, { status: 'completed' });
    await refreshLeads();
    await refreshCalling().catch(() => undefined);
  }

  async function handleAttachTelephony() {
    setCallingMessage('');
    setCallingBusy(true);
    try {
      await attachTelephony(telephonyNumber);
      setCallingMessage('Dedicated calling number attached.');
      await refreshCalling();
    } catch (error) {
      setCallingMessage(error instanceof Error ? error.message : 'Failed to attach calling number.');
    } finally {
      setCallingBusy(false);
    }
  }

  async function handleProvisionAgent() {
    setCallingMessage('');
    setCallingBusy(true);
    try {
      const result = await provisionVoiceAgent();
      setLaunchJobId(result.job.id);
      setLaunchJob(result.job);
      sessionStorage.setItem('barsha_launch_job_id', result.job.id);
      setCallingMessage('Agent launch job started.');
      await refreshCalling();
    } catch (error) {
      setCallingMessage(error instanceof Error ? error.message : 'Failed to launch AI agent.');
    } finally {
      setCallingBusy(false);
    }
  }

  async function handleLaunchToggle(enabled: boolean) {
    setCallingMessage('');
    setCallingBusy(true);
    try {
      await setCallingLaunch(enabled);
      setCallingMessage(enabled ? 'Automatic calling enabled.' : 'Automatic calling disabled.');
      await refreshCalling();
    } catch (error) {
      setCallingMessage(error instanceof Error ? error.message : 'Failed to update calling launch state.');
      await refreshCalling().catch(() => undefined);
    } finally {
      setCallingBusy(false);
    }
  }

  async function markLeadCallable(lead: Lead) {
    setLeadMessage('');
    setSavingLead(true);
    try {
      await setLeadDncStatus(lead, 'clear');
      setLeadMessage(`${lead.full_name} marked DNC-cleared for voice calls.`);
      await refreshLeads();
      await refreshCalling();
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : 'Failed to mark lead callable.');
    } finally {
      setSavingLead(false);
    }
  }

  async function markLeadDoNotCall(lead: Lead) {
    setLeadMessage('');
    setSavingLead(true);
    try {
      await setLeadDncStatus(lead, 'blocked');
      await setLeadVoiceConsent(lead.id, 'not_consented');
      setLeadMessage(`${lead.full_name} blocked from voice calls.`);
      await refreshLeads();
      await refreshCalling();
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : 'Failed to block lead.');
    } finally {
      setSavingLead(false);
    }
  }

  async function approveSuggestedFollowUp(followUp: FollowUp) {
    const dueAt = followUp.due_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await approveFollowUp(followUp.id, dueAt);
    await refreshLeads();
    await refreshCalling().catch(() => undefined);
  }

  function getLaunchView(job: AIJob | null) {
    if (!job) {
      return { label: 'Not started', detail: 'Launch my agent to generate a new playbook', badge: 'b-pending' };
    }

    if (job.status === 'completed') {
      return { label: 'Ready', detail: 'Gemini playbook and Retell agent are live', badge: 'b-active' };
    }

    if (job.status === 'failed') {
      return { label: 'Failed', detail: job.error_message || 'Launch job failed', badge: 'b-called' };
    }

    const provisioning = ['provisioning_retell_llm', 'provisioning_retell_agent'].includes(job.current_step || '');
    return provisioning
      ? { label: 'Provisioning', detail: job.current_step || 'Provisioning Retell', badge: 'b-interested' }
      : { label: 'Generating', detail: job.current_step || 'Generating playbook', badge: 'b-pending' };
  }

  const launchView = getLaunchView(launchJob || callingStatus?.latestLaunchJob || null);

  const workspaceName = workspace?.name || 'your business';
  const agentName = agentConfig?.agent_name || 'Aria';
  const companyName = agentConfig?.company_name || workspaceName;
  const valueProposition = agentConfig?.value_proposition
    || 'We help Singapore SMEs automate their sales outreach - our clients typically see 3x more qualified meetings within the first 30 days.';
  const bookingLink = agentConfig?.booking_link || 'https://calendly.com/yourname/discovery';
  const planLabel = workspace?.plan
    ? workspace.plan.charAt(0).toUpperCase() + workspace.plan.slice(1)
    : 'Not selected';
  const launchChecklist = [
    { label: 'Plan selected', done: Boolean(workspace?.plan), action: 'Saved' },
    { label: 'Business onboarding', done: Boolean(workspace?.onboarding_completed), action: 'Complete' },
    { label: 'Agent prompt generated', done: Boolean(agentConfig?.system_prompt), action: 'Draft ready' },
    { label: 'AI launch job', done: launchView.label === 'Ready', action: launchView.label },
    { label: 'Lead memory', done: leads.length > 0, action: leads.length > 0 ? `${leads.length} lead${leads.length === 1 ? '' : 's'}` : 'No leads' },
    { label: 'Callable leads', done: Boolean(callingStatus?.queue.callableLeads), action: callingStatus?.queue.callableLeads ? `${callingStatus.queue.callableLeads} callable` : 'Blocked' },
    { label: 'Retell voice agent', done: callingStatus?.voiceAgent?.status === 'ready', action: callingStatus?.voiceAgent?.status || 'Not created' },
    { label: 'Twilio/Retell number', done: ['attached', 'verified'].includes(callingStatus?.workspaceTelephony?.phone_number_status || ''), action: callingStatus?.workspaceTelephony?.phone_number_status || 'Missing' },
  ];
  const completedSteps = launchChecklist.filter(item => item.done).length;
  const setupPct = Math.round((completedSteps / launchChecklist.length) * 100);
  const integrations = [
    { name: 'Apollo', purpose: 'Lead sourcing', status: 'Next' },
    { name: 'Launch', purpose: 'Gemini + Retell provisioning', status: launchView.label },
    { name: 'Retell', purpose: 'Voice agent runtime', status: callingStatus?.voiceAgent?.status === 'ready' ? 'Ready' : 'Not connected' },
    { name: 'Twilio', purpose: 'Outbound calling number', status: ['attached', 'verified'].includes(callingStatus?.workspaceTelephony?.phone_number_status || '') ? 'Ready' : 'Not connected' },
    { name: 'Calendly', purpose: bookingLink === 'https://calendly.com/yourname/discovery' ? 'Booking link missing' : 'Booking link saved', status: bookingLink === 'https://calendly.com/yourname/discovery' ? 'Needs setup' : 'Ready' },
  ];
  const calls = callingStatus?.calls || [];
  const bookedCount = outcomes.filter(outcome => outcome.outcome_type === 'booked').length
    + meetings.filter(meeting => meeting.status === 'scheduled').length;
  const interestedCount = outcomes.filter(outcome => ['booking_link_sent', 'interested', 'follow_up_needed'].includes(outcome.outcome_type)).length;
  const conversionRate = calls.length ? Math.round((bookedCount / calls.length) * 100) : 0;
  const readinessChecks = callingStatus?.readiness.checks || [];
  const callingEnabled = Boolean(callingStatus?.workspaceTelephony?.calling_enabled);

  return (
    <div className="screen active" id="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <div className="sb-mark">B</div>
            <div>
              <div className="sb-name">Barsha AI</div>
              <div className="sb-sub">Singapore</div>
            </div>
          </div>
        </div>
        <div className="sb-nav">
          {([
            ['dashboard', 'Overview', <svg key="d" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, null],
            ['leads', 'Leads', <svg key="l" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, null],
            ['calls', 'Calls', <svg key="c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, null],
            ['meetings', 'Meetings', <svg key="m" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, null],
            ['analytics', 'Analytics', <svg key="an" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, null],
            ['settings', 'Agent Settings', <svg key="s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, null],
            ['billing', 'Billing', <svg key="b" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, null],
            ['team', 'Team', <svg key="t" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, null],
          ] as [Page, string, React.ReactNode, string | null][]).map(([id, label, icon, badge]) => (
            <div
              key={id}
              className={`nav-item${activePage === id ? ' active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              {icon}{label}
              {badge && <span className="nav-badge">{badge}</span>}
            </div>
          ))}
        </div>
        <div className="agent-pill">
          <div className="ap-lbl">Agent Status</div>
          <div className="ap-row"><span className="ap-dot" /><span className="ap-name-txt">{agentName} · {launchView.label === 'Ready' ? 'Live' : 'Draft'}</span></div>
          <div className="ap-num">{launchView.label === 'Not started' ? 'Launch not started' : `AI launch: ${launchView.label}`}</div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className={`main-content page${activePage === 'dashboard' ? ' active' : ''}`}>
        <div className="dash-topbar">
          <div>
            <div className="dash-greeting">Good morning, <em>{workspaceName}</em></div>
            <div className="dash-date">{today}</div>
          </div>
          <div className="page-actions">
            <button className="btn-outline" onClick={() => setActivePage('settings')}>Review Agent</button>
            <button className="btn-primary" onClick={() => setActivePage('leads')}>Connect Leads</button>
          </div>
        </div>
        <div className="pdpa-banner">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span><strong>PDPA Compliance Active</strong> — Your agent respects Singapore&apos;s Personal Data Protection Act and identifies as AI when asked.</span>
        </div>
        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-icon ki-p">A</div><div className="kpi-val">{setupPct}%</div><div className="kpi-lbl">Launch Setup</div><div className="kpi-delta kd-neutral">{completedSteps} of {launchChecklist.length} complete</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-g">P</div><div className="kpi-val">{planLabel}</div><div className="kpi-lbl">Selected Plan</div><div className="kpi-delta kd-neutral">Payment before launch</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-gr">L</div><div className="kpi-val">{leads.length}</div><div className="kpi-lbl">Saved Leads</div><div className="kpi-delta kd-neutral">Manual and CSV</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-b">C</div><div className="kpi-val">{calls.length}</div><div className="kpi-lbl">Calls Placed</div><div className="kpi-delta kd-neutral">{callingEnabled ? 'Queue enabled' : 'Queue disabled'}</div></div>
        </div>
        <div className="dash-grid">
          <div className="card">
            <div className="card-head">
              <div className="card-title"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Launch Checklist</div>
              <span className="card-action">{setupPct}% ready</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ height: 7, background: 'var(--cream-dark)', borderRadius: 999, overflow: 'hidden', marginBottom: 18 }}>
                <div style={{ width: `${setupPct}%`, height: '100%', background: 'linear-gradient(90deg,var(--purple),var(--gold))', borderRadius: 999 }} />
              </div>
              {launchChecklist.map(item => (
                <div key={item.label} className="msl-row">
                  <span className="msl-lbl" style={{ color: item.done ? 'var(--text)' : 'var(--text-muted)' }}>{item.label}</span>
                  <span className={`badge ${item.done ? 'b-active' : 'b-pending'}`}><span className="bdot" />{item.action}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div className="card">
              <div className="card-head"><div className="card-title"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Integration Status</div></div>
              <div>
                {integrations.map(item => (
                  <div key={item.name} className="mtr">
                    <div className="mtr-av">{item.name.slice(0, 2).toUpperCase()}</div>
                    <div className="mtr-info"><div className="mtr-name">{item.name}</div><div className="mtr-detail">{item.purpose}</div></div>
                    <span className={`badge ${item.status === 'Ready' ? 'b-active' : item.status === 'Next' ? 'b-interested' : item.status === 'Failed' ? 'b-called' : item.status === 'Provisioning' ? 'b-interested' : 'b-pending'}`}><span className="bdot" />{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Agent Draft</div></div>
              <div className="msl-list">
                <div className="msl-row"><span className="msl-lbl">Agent</span><span className="msl-val">{agentName}</span></div>
                <div className="msl-row"><span className="msl-lbl">Company</span><span className="msl-val">{companyName}</span></div>
                <div className="msl-row"><span className="msl-lbl">Target Region</span><span className="msl-val">{agentConfig?.target_regions || 'Not set'}</span></div>
                <div className="msl-row"><span className="msl-lbl">Tone</span><span className="msl-val" style={{color:'var(--purple)'}}>{agentConfig?.tone || 'Not set'}</span></div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Calling Control</div><span className={`badge ${callingEnabled ? 'b-active' : 'b-pending'}`}><span className="bdot" />{callingEnabled ? 'Enabled' : 'Off'}</span></div>
              <div className="msl-list">
                <div className="pdpa-banner" style={{ marginBottom: 10 }}>
                  <span><strong>Launch status</strong> — {launchView.label}{launchView.detail ? ` · ${launchView.detail}` : ''}</span>
                </div>
                {callingMessage && <div className="pdpa-banner" style={{ marginBottom: 10 }}><span>{callingMessage}</span></div>}
                {readinessChecks.map(check => (
                  <div key={check.key} className="msl-row">
                    <span className="msl-lbl">{check.label}</span>
                    <span className={`badge ${check.ready ? 'b-active' : 'b-pending'}`}><span className="bdot" />{check.ready ? 'Ready' : check.reason}</span>
                  </div>
                ))}
                <input className="sf-inp" placeholder="+65 dedicated number" value={telephonyNumber} onChange={e => setTelephonyNumber(e.target.value)} style={{ marginTop: 10 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button className="btn-outline" onClick={handleAttachTelephony} disabled={callingBusy || !telephonyNumber.trim()}>Attach Number</button>
                  <button
                    className={launchView.label === 'Failed' ? 'btn-primary' : 'btn-outline'}
                    onClick={handleProvisionAgent}
                    disabled={callingBusy || !agentConfig?.system_prompt || ['Generating', 'Provisioning'].includes(launchView.label)}
                  >
                    {launchView.label === 'Failed' ? 'Retry Agent Launch' : 'Create Retell Agent'}
                  </button>
                  <button className="btn-primary" onClick={() => handleLaunchToggle(!callingEnabled)} disabled={callingBusy}>
                    {callingEnabled ? 'Disable Queue' : 'Launch Queue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEADS */}
      <div className={`main-content page${activePage === 'leads' ? ' active' : ''}`}>
        <div className="page-header">
          <div>
            <div className="page-title">Leads</div>
            <div className="page-sub">{leads.length} saved lead{leads.length === 1 ? '' : 's'} · {followUps.length} active follow-up{followUps.length === 1 ? '' : 's'}</div>
          </div>
          <div className="page-actions"><button className="btn-outline" onClick={() => getApolloFilters().then(data => setApolloFilters(data.filters)).catch(() => undefined)}>Reset Apollo Filters</button></div>
        </div>

        {leadMessage && (
          <div className="pdpa-banner" style={{ marginBottom: 18 }}>
            <span>{leadMessage}</span>
          </div>
        )}

        <div className="dash-grid" style={{ marginBottom: 18 }}>
          <div className="card">
            <div className="card-head"><div className="card-title">Apollo Import</div><span className="badge b-pending"><span className="bdot" />Phone gated</span></div>
            <div style={{ padding: 20, display: 'grid', gap: 10 }}>
              <div className="ss-grid">
                <input
                  className="sf-inp"
                  placeholder="Titles"
                  value={apolloFilters.titles.join(', ')}
                  onChange={e => updateApolloFilter('titles', e.target.value)}
                />
                <input
                  className="sf-inp"
                  placeholder="Region"
                  value={apolloFilters.region}
                  onChange={e => updateApolloFilter('region', e.target.value)}
                />
                <input
                  className="sf-inp"
                  placeholder="Industry"
                  value={apolloFilters.industry}
                  onChange={e => updateApolloFilter('industry', e.target.value)}
                />
                <input
                  className="sf-inp"
                  placeholder="Company size"
                  value={apolloFilters.companySize}
                  onChange={e => updateApolloFilter('companySize', e.target.value)}
                />
                <input
                  className="sf-inp"
                  type="number"
                  min={1}
                  max={100}
                  value={apolloFilters.limit}
                  onChange={e => updateApolloFilter('limit', e.target.value)}
                />
              </div>
              <p className="page-sub" style={{ margin: 0, lineHeight: 1.5 }}>
                Imports create blocked Apollo leads first. Phone and email fields update after Apollo sends enrichment results to the webhook.
              </p>
              <button className="btn-gold" onClick={handleImportApollo} disabled={apolloBusy || !apolloFilters.titles.length}>
                {apolloBusy ? 'Importing Apollo...' : `Import ${apolloFilters.limit || 25} Apollo Leads`}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Add Old Lead</div></div>
            <div style={{ padding: 20, display: 'grid', gap: 10 }}>
              <div className="ss-grid">
                <input className="sf-inp" placeholder="Lead name" value={leadForm.full_name} onChange={e => updateLeadForm('full_name', e.target.value)} />
                <input className="sf-inp" placeholder="Company" value={leadForm.company_name} onChange={e => updateLeadForm('company_name', e.target.value)} />
                <input className="sf-inp" placeholder="Title" value={leadForm.title} onChange={e => updateLeadForm('title', e.target.value)} />
                <input className="sf-inp" placeholder="Phone" value={leadForm.phone} onChange={e => updateLeadForm('phone', e.target.value)} />
                <input className="sf-inp" placeholder="Email" value={leadForm.email} onChange={e => updateLeadForm('email', e.target.value)} />
                <input className="sf-inp" type="datetime-local" value={leadForm.due_at} onChange={e => updateLeadForm('due_at', e.target.value)} />
              </div>
              <textarea className="sf-ta" placeholder="What happened last time?" value={leadForm.note} onChange={e => updateLeadForm('note', e.target.value)} />
              <input className="sf-inp" placeholder="Next action, e.g. Call again next Tuesday" value={leadForm.next_action} onChange={e => updateLeadForm('next_action', e.target.value)} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select className="sf-sel" value={leadForm.owner_type} onChange={e => updateLeadForm('owner_type', e.target.value)} style={{ flex: 1 }}>
                  <option value="agent">Agent follow-up</option>
                  <option value="human">Human follow-up</option>
                </select>
                <select className="sf-sel" value={leadForm.priority} onChange={e => updateLeadForm('priority', e.target.value)} style={{ flex: 1 }}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
                <button className="btn-primary" onClick={handleCreateLead} disabled={savingLead}>{savingLead ? 'Saving...' : 'Save Lead'}</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">CSV Import</div></div>
            <div style={{ padding: 20 }}>
              <p className="page-sub" style={{ margin: '0 0 12px', lineHeight: 1.5 }}>
                Paste CSV with headers like: name, company, title, phone, email, note, next_action, due_at, owner_type, priority.
              </p>
              <textarea
                className="sf-ta"
                placeholder={'name,company,phone,note,next_action,due_at\\nRahul,ABC Logistics,+65 1234 5678,Asked to call next week,Call next Tuesday,2026-06-09T15:00'}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                style={{ minHeight: 170 }}
              />
              <button className="btn-gold" onClick={handleImportCsv} disabled={savingLead || !csvText.trim()} style={{ marginTop: 12 }}>
                {savingLead ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="card">
            <div className="card-head"><div className="card-title">Saved Leads</div><span className="card-action">{leads.length}</span></div>
            {leads.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <div className="page-title" style={{ fontSize: 24 }}>No saved leads yet</div>
                <p className="page-sub" style={{ marginTop: 8 }}>Add old client leads manually or import a CSV.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>Status</th><th>Compliance</th><th>Action</th></tr></thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td><div style={{ fontWeight: 500 }}>{lead.full_name}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.title || lead.source}</div></div></td>
                      <td>{lead.company_name || '-'}</td>
                      <td><div style={{ fontSize: 12 }}>{lead.phone || lead.email || (lead.source === 'apollo' ? 'Phone pending' : '-')}</div></td>
                      <td><span className="badge b-new"><span className="bdot" />{lead.status.replaceAll('_', ' ')}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${lead.dnc_status === 'clear' || lead.voice_consent_status === 'consented' ? 'b-active' : lead.dnc_status === 'blocked' ? 'b-called' : 'b-pending'}`}>
                            <span className="bdot" />{lead.voice_consent_status === 'consented' ? 'consented' : `DNC ${lead.dnc_status}`}
                          </span>
                          <span className="badge b-interested">{lead.priority}</span>
                        </div>
                        {lead.callable_block_reason && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{lead.callable_block_reason}</div>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn-outline" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => markLeadCallable(lead)} disabled={savingLead || !lead.phone}>DNC Clear</button>
                          <button className="btn-outline" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => markLeadDoNotCall(lead)} disabled={savingLead}>Block</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Follow-up Queue</div><span className="card-action">{followUps.length}</span></div>
            {followUps.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <div className="page-title" style={{ fontSize: 24 }}>No active follow-ups</div>
                <p className="page-sub" style={{ marginTop: 8 }}>Follow-ups appear here from manual leads, CSV imports, and later call outcomes.</p>
              </div>
            ) : (
              <div>
                {followUps.map(item => (
                  <div key={item.id} className="mtr">
                    <div className="mtr-av">{item.owner_type === 'agent' ? 'AI' : 'HU'}</div>
                    <div className="mtr-info">
                      <div className="mtr-name">{item.title}</div>
                      <div className="mtr-detail">{item.leads?.full_name || 'Lead'} · {item.status} · {item.due_at ? new Date(item.due_at).toLocaleString() : 'No due date'}</div>
                      {item.context_note && <span className="ot ot-f">{item.context_note}</span>}
                      {item.blocked_reason && <span className="ot ot-n">{item.blocked_reason}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={`badge ${item.priority === 'urgent' || item.priority === 'high' ? 'b-called' : 'b-pending'}`}><span className="bdot" />{item.priority}</span>
                      {item.status === 'suggested' ? (
                        <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => approveSuggestedFollowUp(item)}>Approve</button>
                      ) : (
                        <button className="btn-outline" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => completeFollowUp(item.id)}>Done</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CALLS */}
      <div className={`main-content page${activePage === 'calls' ? ' active' : ''}`}>
        <div className="page-header">
          <div><div className="page-title">Call History</div><div className="page-sub">{calls.length} real call record{calls.length === 1 ? '' : 's'} · {callingEnabled ? 'automatic queue enabled' : 'automatic queue disabled'}</div></div>
          <div className="page-actions"><button className="btn-outline" onClick={() => refreshCalling()}>Refresh</button><button className="btn-primary" disabled>{callingEnabled ? 'Queue live' : 'Calling disabled'}</button></div>
        </div>
        {calls.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div className="sum-icon" style={{ margin: '0 auto 14px' }}>C</div>
            <div className="page-title" style={{ fontSize: 26 }}>No calls have run yet</div>
            <p className="page-sub" style={{ maxWidth: 620, margin: '8px auto 0', lineHeight: 1.6 }}>
              Calls will appear here after a workspace has a Retell agent, a dedicated number, DNC-cleared leads, approved due follow-ups, and the launch toggle is enabled.
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="card-head"><div className="card-title">Recent Calls</div><span className="card-action">{calls.length}</span></div>
            {calls.map(call => (
              <div key={call.id} className="call-card">
                <div className="call-av">{(call.leads?.full_name || 'Lead').slice(0, 2).toUpperCase()}</div>
                <div className="call-meta">
                  <div className="call-name">{call.leads?.full_name || call.to_number || 'Unknown lead'}</div>
                  <div className="call-detail">{call.follow_ups?.title || 'Outbound call'} · {call.created_at ? new Date(call.created_at).toLocaleString() : ''}</div>
                  {call.summary && <div className="page-sub" style={{ marginTop: 6, lineHeight: 1.5 }}>{call.summary}</div>}
                  {call.error_message && <span className="ot ot-n">{call.error_message}</span>}
                  {call.recording_url && <a className="card-action" href={call.recording_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 6 }}>Recording</a>}
                </div>
                <div className="call-right">
                  <span className={`badge ${call.status === 'completed' ? 'b-active' : call.status === 'failed' || call.status === 'no_answer' ? 'b-called' : 'b-pending'}`}><span className="bdot" />{call.status.replaceAll('_', ' ')}</span>
                  <div className="call-dur">{call.duration_seconds ? `${call.duration_seconds}s` : '-'}</div>
                  <div className="call-time-txt">{call.sentiment || call.disconnection_reason || ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MEETINGS */}
      <div className={`main-content page${activePage === 'meetings' ? ' active' : ''}`}>
        <div className="page-header">
          <div><div className="page-title">Meetings</div><div className="page-sub">{meetings.length} meeting record{meetings.length === 1 ? '' : 's'} · {outcomes.filter(o => o.meeting_requested).length} meeting request outcome{outcomes.filter(o => o.meeting_requested).length === 1 ? '' : 's'}</div></div>
          <div className="page-actions"><button className="btn-outline" onClick={() => refreshOutcomes()}>Refresh</button><button className="btn-outline" disabled>Calendar sync pending</button></div>
        </div>
        {meetings.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div className="sum-icon" style={{ margin: '0 auto 14px' }}>M</div>
            <div className="page-title" style={{ fontSize: 26 }}>No scheduled meetings yet</div>
            <p className="page-sub" style={{ maxWidth: 620, margin: '8px auto 0', lineHeight: 1.6 }}>
              Booking-link and call outcomes can now be stored. Calendly or calendar webhooks can be connected next to turn requested meetings into scheduled meetings.
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="card-head"><div className="card-title">Meeting Records</div><span className="card-action">{meetings.length}</span></div>
            {meetings.map(meeting => (
              <div key={meeting.id} className="mtr">
                <div className="mtr-av">MT</div>
                <div className="mtr-info">
                  <div className="mtr-name">{meeting.title}</div>
                  <div className="mtr-detail">{meeting.leads?.full_name || meeting.invitee_name || 'Invitee'} · {meeting.starts_at ? new Date(meeting.starts_at).toLocaleString() : 'Time pending'}</div>
                  {meeting.notes && <span className="ot ot-f">{meeting.notes}</span>}
                </div>
                <span className={`badge ${meeting.status === 'scheduled' ? 'b-active' : 'b-pending'}`}><span className="bdot" />{meeting.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ANALYTICS */}
      <div className={`main-content page${activePage === 'analytics' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Analytics</div><div className="page-sub">Performance reporting starts after the first real call.</div></div></div>
        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-icon ki-p">C</div><div className="kpi-val">{calls.length}</div><div className="kpi-lbl">Total Calls</div><div className="kpi-delta kd-neutral">{outcomes.length} analyzed</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-g">M</div><div className="kpi-val">{bookedCount}</div><div className="kpi-lbl">Meetings Booked</div><div className="kpi-delta kd-neutral">{interestedCount} interested</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-gr">D</div><div className="kpi-val">-</div><div className="kpi-lbl">Avg Duration</div><div className="kpi-delta kd-neutral">Twilio pending</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-b">R</div><div className="kpi-val">{calls.length ? `${conversionRate}%` : '-'}</div><div className="kpi-lbl">Conversion Rate</div><div className="kpi-delta kd-neutral">Booked / calls</div></div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Recent Outcomes</div><span className="card-action">{outcomes.length}</span></div>
          {outcomes.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="sum-icon" style={{ margin: '0 auto 14px' }}>A</div>
              <div className="page-title" style={{ fontSize: 26 }}>No analyzed outcomes yet</div>
              <p className="page-sub" style={{ maxWidth: 560, margin: '8px auto 0', lineHeight: 1.6 }}>
                Retell call analysis will write normalized outcomes here: booked, interested, follow-up needed, not interested, no answer, or do not call.
              </p>
            </div>
          ) : outcomes.slice(0, 12).map(outcome => (
            <div key={outcome.id} className="mtr">
              <div className="mtr-av">OC</div>
              <div className="mtr-info">
                <div className="mtr-name">{outcome.leads?.full_name || 'Lead'} · {outcome.outcome_type.replaceAll('_', ' ')}</div>
                <div className="mtr-detail">{outcome.summary || outcome.next_action || 'No summary yet'}</div>
              </div>
              <span className={`badge ${outcome.outcome_type === 'booked' ? 'b-active' : outcome.outcome_type === 'not_interested' || outcome.outcome_type === 'do_not_call' ? 'b-called' : 'b-interested'}`}><span className="bdot" />{outcome.confidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AGENT SETTINGS */}
      <div className={`main-content page${activePage === 'settings' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Agent Settings</div><div className="page-sub">Configure · {agentName} · {agentConfig?.city || 'Singapore'}</div></div></div>
        <div className="set-grid">
          <div className="set-nav">
            {([
              ['identity', 'Identity', <svg key="i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>],
              ['voice', 'Voice & Tone', <svg key="v" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>],
              ['script', 'Call Script', <svg key="s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>],
              ['schedule', 'Schedule', <svg key="sc" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ['compliance', 'Compliance', <svg key="c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>],
            ] as [SettingsPanel, string, React.ReactNode][]).map(([id, label, icon]) => (
              <div key={id} className={`sn-item${settingsPanel === id ? ' active' : ''}`} onClick={() => setSettingsPanel(id)}>
                {icon}{label}
              </div>
            ))}
          </div>
          <div>
            {settingsPanel === 'identity' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Agent Name</div><div className="sf-hint">How your agent introduces itself on every call.</div><input className="sf-inp" type="text" value={agentName} readOnly /></div>
                <div className="sf"><div className="sf-lbl">Company Name</div><input className="sf-inp" type="text" value={companyName} readOnly /></div>
                <div className="sf"><div className="sf-lbl">Value Proposition</div><div className="sf-hint">The single most powerful statement your agent leads with on calls.</div><textarea className="sf-ta" value={valueProposition} readOnly /></div>
                <div className="sf"><div className="sf-lbl">Booking Link (Calendly)</div><input className="sf-inp" type="text" value={bookingLink} readOnly /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'voice' && (
              <div className="set-panel">
                <div className="sf">
                  <div className="sf-lbl">Voice Profile</div>
                  <div className="sf-hint">Choose a Retell AI voice for your agent. Click Preview to hear a sample.</div>
                  <div className="voice-grid">
                    {[{n:'Aria (SG English)',d:'Warm, professional'},{n:'Sophie (AU English)',d:'Friendly, clear'},{n:'James (UK English)',d:'Polished, formal'},{n:'Maya (US English)',d:'Confident, direct'}].map((v,i) => (
                      <div key={i} className={`voice-card${selectedVoice===i?' selected':''}`} onClick={() => setSelectedVoice(i)}>
                        <div className="vc-name">{v.n}</div><div className="vc-desc">{v.d}</div>
                        <div className="vc-play"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Preview</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sf"><div className="sf-lbl">Communication Tone</div><select className="sf-sel"><option>Professional &amp; Warm</option><option>Consultative</option><option>Direct &amp; Bold</option><option>Conversational</option></select></div>
                <div className="sf"><div className="sf-lbl">Speech Speed</div><input type="range" style={{marginTop:8}} min={0.8} max={1.3} step={0.1} defaultValue={1.0} /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'script' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Opening Line</div><textarea className="sf-ta" style={{minHeight:70}} defaultValue="Hi, this is Aria calling from [Your Company] — I'll keep this to under 2 minutes. Is now a good time?" /></div>
                <div className="sf"><div className="sf-lbl">Objection Handling</div><textarea className="sf-ta" defaultValue={"1. Too busy: \"I completely understand — when would be a better 2 minutes for a quick chat?\"\n2. Already have a solution: \"That's great — what would you change about what you're using now?\"\n3. Not in budget: \"Totally fair — most of our clients find this pays for itself within 60 days. Could I send you a quick overview?\""} /></div>
                <div className="sf"><div className="sf-lbl">Closing Statement</div><textarea className="sf-ta" style={{minHeight:70}} defaultValue="I'd love to show you how this could work for your business — can I send you a Calendly link for a quick 20-minute chat?" /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'schedule' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Calling Hours (SGT)</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:8}}><input className="sf-inp" type="time" defaultValue="09:00" /><input className="sf-inp" type="time" defaultValue="18:00" /></div></div>
                <div className="sf"><div className="sf-lbl">Active Days</div><div style={{display:'flex',gap:8,flexWrap:'wrap' as const,marginTop:8}}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => <div key={d} className={`chip${i<5?' active':''}`}>{d}</div>)}</div></div>
                <div className="sf"><div className="sf-lbl">Maximum Calls Per Day</div><input className="sf-inp" type="number" defaultValue={150} /></div>
                <div className="sf"><div className="sf-lbl">Retry Attempts for No Answer</div><input className="sf-inp" type="number" defaultValue={2} /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'compliance' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">PDPA Compliance Settings</div>
                  <div>
                    {[
                      {n:'DND Registry Check',d:"Check Singapore's Do Not Call Registry before every call."},
                      {n:'AI Identity Disclosure',d:'Agent identifies itself as AI if the prospect directly asks.'},
                      {n:'Immediate Opt-Out Logging',d:'If prospect says "remove me" or "don\'t call again", log immediately as DND.'},
                      {n:'Call Recording Consent Notice',d:'Agent informs prospect that the call may be recorded for quality purposes.'},
                    ].map(item => (
                      <div key={item.n} className="tog-switch">
                        <div><div className="ts-name">{item.n}</div><div className="ts-desc">{item.d}</div></div>
                        <label className="ts-ctrl"><input type="checkbox" defaultChecked /><span className="ts-sldr" /></label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="set-save"><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BILLING */}
      <div className={`main-content page${activePage === 'billing' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Billing</div><div className="page-sub">Payment is required before launching the agent.</div></div></div>
        <div className="bill-grid">
          <div className="plan-card">
            <div className="plan-tag">Selected Plan</div>
            <div className="plan-name">{planLabel}</div>
            <div style={{marginTop:16}}>
              <div className="plan-feat">Plan selection is saved to your workspace.</div>
              <div className="plan-feat">Stripe checkout is not connected yet.</div>
              <div className="plan-feat">Usage counters will stay at zero until real calls run.</div>
            </div>
            <div style={{marginTop:20,display:'flex',gap:10}}><button className="btn-primary" disabled style={{flex:1}}>Connect payment next</button></div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title">Usage</div>
            <div className="usage-wrap"><div className="usage-lbl"><span>Calls Used</span><span>0</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'0%'}} /></div></div>
            <div className="usage-wrap"><div className="usage-lbl"><span>Leads Imported</span><span>0</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'0%'}} /></div></div>
            <div className="usage-wrap"><div className="usage-lbl"><span>Meetings Booked</span><span>0</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'0%'}} /></div></div>
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div className={`main-content page${activePage === 'team' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Team</div><div className="page-sub">Team management is not enabled in the MVP yet.</div></div></div>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div className="sum-icon" style={{ margin: '0 auto 14px' }}>T</div>
          <div className="page-title" style={{ fontSize: 26 }}>Single-owner workspace</div>
          <p className="page-sub" style={{ maxWidth: 560, margin: '8px auto 0', lineHeight: 1.6 }}>
            This workspace is currently scoped to the signed-in owner. Invitations and roles should come after core lead and calling flows.
          </p>
        </div>
      </div>
    </div>
  );
}
