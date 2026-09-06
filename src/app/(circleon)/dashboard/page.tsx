'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  approveInboxMessage,
  draftManualConversationReply,
  connectSmtp,
  createCampaign,
  uploadCampaignSequenceAttachment,
  createLead,
  deleteLead,
  downloadCsvImportErrors,
  getCampaignLeads,
  getCampaignPreview,
  getCampaigns,
  getAutopilotRuns,
  getAutopilotSettings,
  getApolloFilters,
  getApolloImport,
  getLatestApolloImport,
  getLeadImport,
  getInbox,
  getConversation,
  getEmailConversations,
  getLeads,
  getMeetings,
  regenerateInboxMessage,
  sendManualConversationReply,
  getSentMail,
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
  runAutopilotNow,
  saveAutopilotSettings,
  updateLead,
  type ApolloFilters,
  type AgentConfig,
  type AutopilotReadiness,
  type AutopilotRun,
  type AutopilotSettings,
  type Campaign,
  type ConnectedAccount,
  type EmailConversation,
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
import { CampaignRow, EmptyState, KpiRow, Metric, fmtDate, initials, intentBadge, navItems, statusBadge, type Page } from './_lib/ui';
import { csvTargets, terminalImportStatuses } from './_lib/leadImport';
import { useTheme } from './_lib/theme';
import { useTour } from './_lib/tour/TourProvider';
import { isCampaignEligibleLead } from './_lib/tour/completion';

type SettingsSection = 'mailbox' | 'autopilot' | 'workspace' | 'compliance' | 'profile';
type LeadView = 'all' | 'ready' | 'campaign' | 'attention';
type LeadDrawerMode = 'profile' | 'source';

const pageIds = new Set<string>(navItems.map(item => item.id));
const settingsSectionIds = new Set<string>(['mailbox', 'autopilot', 'workspace', 'compliance', 'profile']);

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

function messagePreview(value?: string | null) {
  const replyOnly = String(value || '')
    .split(/\n(?:On .+ wrote:|From:|>)/i)[0]
    .split(/\n--\s*\n|\nTo stop receiving these emails,/i)[0]
    .replace(/\s+/g, ' ')
    .trim();
  return replyOnly || 'No message content';
}

function visibleMessageBody(value?: string | null) {
  return String(value || '')
    .split(/\n(?:On .+ wrote:|From:|>)/i)[0]
    .split(/\n--\s*\n|\nTo stop receiving these emails,/i)[0]
    .trim() || 'No message content';
}

function ConversationThreadModal({ conversation, onClose, onRefresh, onError }: { conversation: EmailConversation; onClose: () => void; onRefresh: () => Promise<void>; onError: (message: string) => void }) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [dirty, setDirty] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const replyTarget = useMemo(() => [...messages].reverse().find(message => message.direction === 'inbound' && !message.responded_at && ['received', 'pending_approval'].includes(message.status)) || null, [messages]);

  async function loadThread() {
    setLoading(true);
    try {
      const data = await getConversation(conversation.lead_id);
      setMessages(data.messages);
      const target = [...data.messages].reverse().find(message => message.direction === 'inbound' && !message.responded_at && ['received', 'pending_approval'].includes(message.status));
      setDraft(target?.draft_body || '');
      setDirty(false);
      setComposerOpen(Boolean(target));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not load this conversation');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadThread(); }, [conversation.lead_id]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') requestClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function requestClose() {
    if (dirty && !window.confirm('Discard your unsent reply draft?')) return;
    onClose();
  }

  async function handleGenerate() {
    setBusy('generate');
    try {
      let generated = '';
      if (replyTarget) {
        const data = await regenerateInboxMessage(replyTarget.id);
        generated = data.message?.draft_body || '';
      } else {
        const data = await draftManualConversationReply(conversation.lead_id);
        generated = data.body || '';
      }
      // Reload first, then apply the generated text. loadThread() resets the
      // composer from the server's copy of the thread, so setting the draft
      // before it ran meant the freshly generated reply was overwritten and
      // the box came back empty.
      await Promise.all([loadThread(), onRefresh()]);
      setDraft(generated);
      setComposerOpen(true);
      setDirty(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not generate a reply draft');
    } finally {
      setBusy('');
    }
  }

  async function handleApprove() {
    if (!draft.trim()) return;
    setBusy('approve');
    try {
      if (replyTarget) await approveInboxMessage(replyTarget.id, draft.trim());
      else await sendManualConversationReply(conversation.lead_id, draft.trim());
      setDraft('');
      setDirty(false);
      setComposerOpen(false);
      await Promise.all([loadThread(), onRefresh()]);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not approve this reply');
    } finally {
      setBusy('');
    }
  }

  return (
    // The design opens the thread in the same right-hand drawer used elsewhere,
    // not a centred modal.
    <div className="detail-drawer-overlay" role="presentation" onMouseDown={requestClose}>
      <aside className="detail-drawer conversation-drawer" role="dialog" aria-modal="true" aria-label={`Conversation with ${conversation.lead.full_name}`} onMouseDown={event => event.stopPropagation()}>
        <div className="detail-drawer-head">
          <div>
            <p className="detail-drawer-eyebrow">Thread</p>
            <h3>{conversation.latest_message.subject || `Conversation with ${conversation.lead.full_name || conversation.lead.email}`}</h3>
            <div className="sf-hint" style={{ marginTop: 6 }}>{conversation.lead.full_name || conversation.lead.email}{conversation.lead.company_name ? ` · ${conversation.lead.company_name}` : ''}</div>
          </div>
          <button type="button" className="detail-drawer-close" aria-label="Close conversation" onClick={requestClose}>×</button>
        </div>
        <div className="detail-drawer-body">
        <div className="conversation-thread">
          {loading ? <div className="sf-hint">Loading conversation…</div> : messages.map(message => <article key={message.id} className={`thread-message ${message.direction === 'outbound' ? 'is-outbound' : 'is-inbound'}`}>
            <div className="thread-message-meta"><strong>{message.direction === 'outbound' ? 'You' : conversation.lead.full_name}</strong><span>{fmtDate(message.sent_at || message.received_at || message.created_at)}</span></div>
            <div className="thread-message-subject">{message.subject || 'No subject'}</div>
            {/* A reply awaiting approval carries its text in draft_body; body
                is only populated once it has actually been sent. */}
            <div className="thread-message-body">{visibleMessageBody(message.body || message.draft_body)}</div>
          </article>)}
        </div>
        {replyTarget || composerOpen ? <div className="conversation-composer">
          <div className="email-detail-label">{replyTarget ? `Reply to ${conversation.lead.full_name || conversation.lead.email}` : `Write to ${conversation.lead.full_name || conversation.lead.email}`}</div>
          <textarea value={draft} onChange={event => { setDraft(event.target.value); setDirty(true); }} placeholder="Write your reply here…" />
          <div className="conversation-composer-actions"><button className="btn-outline" type="button" disabled={busy === 'generate'} onClick={handleGenerate}>{busy === 'generate' ? 'CircleOn is writing…' : 'Let CircleOn Generate'}</button><button className="btn-primary" type="button" disabled={busy === 'approve' || !draft.trim()} onClick={handleApprove}>{busy === 'approve' ? 'Sending…' : 'Approve & send'}</button></div>
        </div> : <div className="conversation-closed-note"><span>This conversation has no reply awaiting approval.</span><button className="btn-outline" type="button" onClick={() => setComposerOpen(true)}>Write a reply</button></div>}
        </div>
      </aside>
    </div>
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
  if (lead.enrichment_status === 'failed') return 'Enrichment failed';
  if (lead.enrichment_status === 'cooldown') return 'Enrichment cooldown';
  if (lead.enrichment_status === 'pending') return 'Enrichment running';
  if (lead.enrichment_status === 'completed') {
    return lead.company_name && lead.title ? 'Company and role verified' : 'Work email verified';
  }
  return lead.email ? 'Work email verified' : 'Not enriched yet';
}

function formatCompanyNumber(value?: number | null, prefix = '') {
  if (!value) return '—';
  return `${prefix}${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
}

function LeadResearchProfile({
  lead,
  onAddToCampaign,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onAddToCampaign: () => void;
  onEdit: () => void;
  // Deletion used to live only behind the removed table checkboxes; the design
  // puts per-row actions in the detail panel, so it lives here now.
  onDelete: () => void;
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
        <h5>What CircleOn can use in email</h5>
        <p>{researchFacts[0] || `The verified role, ${industry || 'company'} context, and available technology signals can anchor a specific first message.`}</p>
      </section>
      <div className="lead-profile-actions"><button className="btn-primary" type="button" disabled={!isCampaignEligibleLead(lead)} onClick={onAddToCampaign}>Add to campaign</button><button className="btn-outline" type="button" onClick={onDelete}>Delete lead</button><button className="btn-outline" type="button" onClick={onEdit}>Edit lead</button></div>
    </div>
  );
}

function calendarDateKey(date: Date, timeZone = 'Asia/Singapore') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function meetingDateKey(meeting: Meeting) {
  return meeting.starts_at ? calendarDateKey(new Date(meeting.starts_at), meeting.timezone || 'Asia/Singapore') : '';
}

function meetingTime(meeting: Meeting) {
  if (!meeting.starts_at) return 'Time to be confirmed';
  return new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: meeting.timezone || 'Asia/Singapore',
  }).format(new Date(meeting.starts_at));
}

function meetingStamp(meeting: Meeting) {
  if (!meeting.starts_at) return 'Not scheduled';
  // en-US for month-first ("Aug 24, 10:00"), matching the design. The
  // timezone stays Asia/Singapore like every other stamp in the dashboard.
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'Asia/Singapore',
  }).format(new Date(meeting.starts_at));
}

/** The design's meetings page: one flat list, stamp / title+invitee / status. */
function MeetingsList({ meetings }: { meetings: Meeting[] }) {
  const ordered = [...meetings].sort((a, b) => String(a.starts_at || '').localeCompare(String(b.starts_at || '')));
  if (!ordered.length) return <div className="mtg-list"><EmptyState text="No meetings booked yet." /></div>;
  return (
    <div className="mtg-list">
      {ordered.map(meeting => (
        <div className="mtg-item" key={meeting.id}>
          <div className="mi-time">{meetingStamp(meeting)}</div>
          <div className="mi-name">{meeting.title}</div>
          <div className="mi-detail">{meeting.invitee_name || meeting.leads?.full_name || meeting.invitee_email || 'Invitee pending'}</div>
          <span className={`mi-type ${meeting.status === 'canceled' ? 'is-canceled' : ''}`}>{meeting.status.replace('_', ' ')}</span>
        </div>
      ))}
    </div>
  );
}

function MeetingsCalendar({ meetings }: { meetings: Meeting[] }) {
  const todayKey = calendarDateKey(new Date());
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const meetingsByDate = useMemo(() => {
    const grouped = new Map<string, Meeting[]>();
    meetings.filter(meeting => meeting.starts_at).forEach(meeting => {
      const key = meetingDateKey(meeting);
      grouped.set(key, [...(grouped.get(key) || []), meeting]);
    });
    return grouped;
  }, [meetings]);

  const selectedMeetings = meetingsByDate.get(selectedDate) || [];
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(month);

  function moveMonth(offset: number) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="mtg-grid" data-tour="meetings">
      <div className="card calendar-card">
        <div className="cal-hdr">
          <div>
            <div className="cal-month">{monthLabel}</div>
            <div className="sf-hint">{meetings.length ? `${meetings.length} booking${meetings.length === 1 ? '' : 's'} across your pipeline` : 'Your booked meetings will appear here'}</div>
          </div>
          <div className="cal-nav">
            <button className="cal-nbtn" type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button>
            <button className="cal-nbtn cal-today-btn" type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(todayKey); }}>Today</button>
            <button className="cal-nbtn" type="button" aria-label="Next month" onClick={() => moveMonth(1)}>›</button>
          </div>
        </div>
        <div className="cal-grid-wrap">
          <div className="cal-daynames">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div className="cdn" key={day}>{day}</div>)}</div>
          <div className="cal-days calendar-booking-grid">
            {days.map(date => {
              const key = calendarDateKey(date);
              const dayMeetings = meetingsByDate.get(key) || [];
              const isCurrentMonth = date.getMonth() === month.getMonth();
              return (
                <button
                  type="button"
                  key={key}
                  className={`cal-day calendar-booking-day${isCurrentMonth ? '' : ' dim'}${key === todayKey ? ' today' : ''}${dayMeetings.length ? ' has-mtg' : ''}${key === selectedDate ? ' selected' : ''}`}
                  onClick={() => setSelectedDate(key)}
                  aria-label={`${date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}${dayMeetings.length ? `, ${dayMeetings.length} booking${dayMeetings.length === 1 ? '' : 's'}` : ''}`}
                >
                  <span className="cal-date-number">{date.getDate()}</span>
                  {dayMeetings.length ? <span className="cal-booking-stack">{dayMeetings.slice(0, 2).map(meeting => <span className={`cal-booking-pill ${meeting.status === 'canceled' ? 'is-canceled' : ''}`} key={meeting.id}>{meetingTime(meeting)} · {meeting.invitee_name || meeting.title}</span>)}{dayMeetings.length > 2 ? <span className="cal-booking-more">+{dayMeetings.length - 2} more</span> : null}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="mtg-list calendar-selected-list">
        <div className="card-head">
          <div>
            <div className="card-title">{selectedDate === todayKey ? 'Today' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${selectedDate}T12:00:00`))}</div>
            <div className="sf-hint">Bookings on this day</div>
          </div>
        </div>
        {selectedMeetings.length ? selectedMeetings.map(meeting => (
          <div key={meeting.id} className="mtg-item">
            <div className="mi-time">{meetingTime(meeting)}</div>
            <div className="mi-name">{meeting.title}</div>
            <div className="mi-detail">{meeting.invitee_name || meeting.invitee_email || meeting.leads?.full_name || 'Invitee pending'}</div>
            <span className={`mi-type ${meeting.status === 'canceled' ? 'is-canceled' : ''}`}>{meeting.status.replace('_', ' ')}</span>
          </div>
        )) : <EmptyState text="No bookings on this day." />}
      </aside>
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
  const activePage: Page = requestedPage === 'sent' ? 'inbox' : requestedPage && pageIds.has(requestedPage) ? requestedPage as Page : 'overview';
  const setActivePage = (page: Page) => router.push(page === 'overview' ? '/dashboard' : `/dashboard?page=${page}`);
  // Settings sub-sections read from the URL the same way pages do, so they can
  // be linked to directly — the guided tour needs to open one, and a support
  // reply pointing at "the mailbox settings" now has a URL to point at.
  const requestedSection = searchParams.get('section');
  const settingsSection: SettingsSection = requestedSection && settingsSectionIds.has(requestedSection)
    ? requestedSection as SettingsSection
    : 'mailbox';
  const setSettingsSection = (section: SettingsSection) => router.push(`/dashboard?page=settings&section=${section}`);
  const [today, setToday] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [billing, setBilling] = useState<WorkspaceBilling | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inbox, setInbox] = useState<EmailMessage[]>([]);
  const [sentMail, setSentMail] = useState<EmailMessage[]>([]);
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [openedConversation, setOpenedConversation] = useState<EmailConversation | null>(null);
  const [conversationFilter, setConversationFilter] = useState<'all' | 'needs_reply' | 'draft_ready' | 'sent' | 'positive' | 'unsubscribed'>('all');
  const [conversationSearch, setConversationSearch] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [smtpAccount, setSmtpAccount] = useState<ConnectedAccount | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [preview, setPreview] = useState<EmailMessage[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [manualCampaignId, setManualCampaignId] = useState('');
  const [smtpForm, setSmtpForm] = useState(emptySmtpForm);
  const [apolloFilters, setApolloFilters] = useState<ApolloFilters>(emptyApolloFilters);
  const [apolloIndustryOptions, setApolloIndustryOptions] = useState<string[]>([]);
  const [csvText, setCsvText] = useState('');
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [lastCsvRun, setLastCsvRun] = useState<LeadImportRun | null>(null);
  const [csvMode, setCsvMode] = useState<'import' | 'suppress'>('import');
  const [csvCampaignId, setCsvCampaignId] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [editingLeadId, setEditingLeadId] = useState('');
  const { theme, toggleTheme } = useTheme();
  const tour = useTour();
  const [autopilotSettings, setAutopilotSettings] = useState<AutopilotSettings | null>(null);
  const [autopilotReadiness, setAutopilotReadiness] = useState<AutopilotReadiness | null>(null);
  const [autopilotRuns, setAutopilotRuns] = useState<AutopilotRun[]>([]);
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
  const [meetingsView, setMeetingsView] = useState<'list' | 'calendar'>('list');
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
    () => leads.filter(lead => lead.dnc_status !== 'blocked'),
    [leads]
  );
  // Counted over the same set the table renders, so the metric and the
  // "Needs attention" tab can never disagree.
  const attentionLeadCount = useMemo(
    () => visibleLeads.filter(lead => leadViewStatus(lead) === 'Needs attention').length,
    [visibleLeads]
  );
  const verifiedEmailLeadCount = useMemo(
    () => visibleLeads.filter(lead => lead.email).length,
    [visibleLeads]
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
  const visibleConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    return conversations.filter(conversation => {
      const matchesFilter = conversationFilter === 'all'
        || (conversationFilter === 'positive' && conversation.positive_intent)
        || (conversationFilter === 'unsubscribed' && conversation.unsubscribed)
        || (conversationFilter === 'needs_reply' && conversation.needs_reply)
        || (conversationFilter === 'draft_ready' && conversation.draft_ready)
        || (conversationFilter === 'sent' && conversation.status === 'sent');
      if (!matchesFilter) return false;
      if (!query) return true;
      return [
        conversation.lead.full_name,
        conversation.lead.email,
        conversation.lead.company_name,
        conversation.latest_message.subject,
        conversation.latest_message.body,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [conversationFilter, conversationSearch, conversations]);
  const sentMessages = sentMail.length;
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

  // Background refresh replaces the old Refresh button, which the design has no
  // control for. It runs on an interval and whenever the tab regains focus, and
  // holds off while a modal or drawer is open so content never shifts under an
  // interaction. Failures stay silent: this is not something the user asked for,
  // so it must never raise a banner over their work.
  const backgroundRefreshBlocked = showCampaignForm || leadDrawerOpen || Boolean(openedConversation);
  const backgroundRefreshBlockedRef = useRef(backgroundRefreshBlocked);
  backgroundRefreshBlockedRef.current = backgroundRefreshBlocked;

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled || backgroundRefreshBlockedRef.current) return;
      if (document.visibilityState !== 'visible') return;
      refreshAll().catch(() => undefined);
    };
    const timer = window.setInterval(tick, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    window.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
    // refreshAll is stable for the component's lifetime; re-subscribing on every
    // render would reset the interval continuously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAuthenticationRequired = () => redirectForAuthentication();
    window.addEventListener('circleon:authentication-required', handleAuthenticationRequired);
    return () => window.removeEventListener('circleon:authentication-required', handleAuthenticationRequired);
  }, [router]);

  useEffect(() => {
    refreshAll().catch(error => setMessage(error.message));
    Promise.all([getAutopilotSettings(), getAutopilotRuns()])
      .then(([settingsData, runsData]) => {
        setAutopilotSettings(settingsData.settings);
        setAutopilotReadiness(settingsData.readiness);
        setAutopilotRuns(runsData.runs);
      })
      .catch(() => undefined);
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

  async function saveAutopilot(next: AutopilotSettings) {
    setBusy('autopilot');
    setMessage('');
    try {
      const result = await saveAutopilotSettings(next);
      setAutopilotSettings(result.settings);
      setAutopilotReadiness(result.readiness);
      setMessage(result.settings.enabled ? 'Autopilot is active for launched campaigns.' : 'Autopilot is paused.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save autopilot settings.');
    } finally {
      setBusy('');
    }
  }

  async function runAutopilot() {
    setBusy('autopilot-run');
    setMessage('');
    try {
      const result = await runAutopilotNow();
      const runs = await getAutopilotRuns();
      setAutopilotRuns(runs.runs);
      setMessage(result.queued ? `Queued ${result.queued} autopilot run${result.queued === 1 ? '' : 's'}.` : 'Today’s eligible campaigns are already queued.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start autopilot.');
    } finally {
      setBusy('');
    }
  }

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
    const [leadData, campaignData, inboxData, sentMailData, conversationData, meetingData, smtpData] = await Promise.all([
      getLeads(),
      getCampaigns(),
      getInbox(),
      getSentMail(),
      getEmailConversations(),
      getMeetings(),
      getSmtpStatus(),
    ]);
    console.log('[lead-search:frontend:refresh_all]', {
      leads: leadData.leads.length,
      leadsWithEmail: leadData.leads.filter(lead => Boolean(lead.email)).length,
      campaigns: campaignData.campaigns.length,
      inbox: inboxData.conversations?.length || 0,
    });
    setLeads(leadData.leads);
    setCampaigns(campaignData.campaigns);
    setInbox(inboxData.conversations || []);
    setSentMail(sentMailData.messages || []);
    setConversations(conversationData.conversations || []);
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
      else await createLead({ ...leadForm, source: 'manual', campaign_id: manualCampaignId || null });
      setLeadForm(emptyLeadForm);
      setManualCampaignId('');
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
    if (!ids.length || !window.confirm(`Delete ${ids.length} lead${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBusy('lead-delete');
    setMessage('');
    try {
      await Promise.all(ids.map(id => deleteLead(id)));
      setLeads(current => current.filter(lead => !ids.includes(lead.id)));
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
          ? `Lead search failed: ${importRun.error_message || 'Unknown search error'}`
          : `Lead search ${importRun.status}: ${String(meta.ready_count ?? 0)} ready leads from ${importRun.created_count} candidates.`);
        return importRun;
      }
      const startedAt = new Date(importRun.started_at || (typeof importRun.raw_meta?.started_at === 'string' ? importRun.raw_meta.started_at : importRun.created_at)).getTime();
      if (Date.now() - startedAt >= 10 * 60 * 1000) {
        setBusy('');
        setMessage('Lead search did not finish in time. Start a fresh search.');
        return null;
      }
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    setBusy('');
    setMessage('Lead search is taking longer than expected. It is still running in the background and this page will keep its latest progress.');
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
      const started = await startCsvImport(csvText, csvMappings, csvMode, csvMode === 'import' ? csvCampaignId : undefined);
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
      anchor.download = `circleon-import-${lastCsvRun.id}-errors.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not download import errors');
    }
  }

  async function handleApolloImport() {
    setBusy('apollo');
    setMessage('');
    console.log('[lead-search:frontend:import_start]', apolloFilters);
    try {
      const data = await importApolloLeads(apolloFilters);
      console.log('[lead-search:frontend:import_response]', {
        importRun: data.importRun,
        sync: data.sync,
      });
      setActiveApolloRun(data.importRun);
      await monitorApolloImport(data.importRun.id);
    } catch (error) {
      console.error('[lead-search:frontend:import_failed]', error);
      setMessage(error instanceof Error ? error.message : 'Could not search for leads');
    } finally {
      if (!activeApolloRun || terminalImportStatuses.has(activeApolloRun.status)) setBusy('');
    }
  }

  async function handleApolloSync() {
    setBusy('apollo-sync');
    setMessage('');
    console.log('[lead-search:frontend:sync_start]');
    try {
      const data = await syncApolloEmails();
      console.log('[lead-search:frontend:sync_response]', data);
      const leadData = await getLeads();
      console.log('[lead-search:frontend:leads_after_sync]', {
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
      setMessage(`Lead email sync checked ${data.requestIds.length} requests: ${data.sync.updated} updated, ${data.sync.pending} pending.`);
    } catch (error) {
      console.error('[lead-search:frontend:sync_failed]', error);
      setMessage(error instanceof Error ? error.message : 'Could not sync lead emails');
    } finally {
      setBusy('');
    }
  }

  function openCampaignBuilder(leadIds: string[] = []) {
    setCampaignBuilderLeadIds(leadIds);
    setShowCampaignForm(true);
  }

  async function handleCreateCampaign({ campaign, brief, leadIds, steps, attachments }: CampaignBuilderSubmission) {
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
      for (const item of attachments) {
        await uploadCampaignSequenceAttachment(data.campaign.id, item.stepNumber, item.file);
      }
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
    const eligibleIds = leads.filter(isCampaignEligibleLead).map(lead => lead.id);
    if (!eligibleIds.length) {
      setMessage('Select at least one ready lead with an email address.');
      return;
    }
    await saveCampaignLeadSelection([...new Set([...selectedLeadIds, ...eligibleIds])]);
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

  async function handleRegenerateReply(messageId: string) {
    setBusy(messageId);
    setMessage('');
    try {
      await regenerateInboxMessage(messageId);
      const data = await getInbox();
      setInbox(data.conversations || []);
      setMessage('Draft generated. Review it before sending.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not generate a reply draft');
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
    setSidebarCollapsed(false);
  }

  const autopilotBlockReasons = [
    autopilotReadiness && !autopilotReadiness.mailbox_ready ? 'Connect and verify both SMTP and IMAP first.' : null,
    autopilotReadiness && autopilotReadiness.launched_campaigns === 0 ? 'Launch at least one campaign first.' : null,
    autopilotReadiness && autopilotReadiness.launched_campaigns > 0 && autopilotReadiness.included_campaigns === 0 ? 'Select at least one launched campaign, or choose “Include all launched campaigns”.' : null,
  ].filter((reason): reason is string => Boolean(reason));

  return (
    <>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        workspace={workspace}
        smtpAccount={smtpAccount}
        pendingReplies={pendingReplies.length}
        collapsed={sidebarCollapsed}
        onError={setMessage}
      />


      <main className={`main-content${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
        {/* No global topbar: in the design each page owns its header. Refresh
            moved into the per-page header actions below. */}

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
                <button className="btn-primary" type="button" data-tour="create-campaign" onClick={() => openCampaignBuilder()}>New campaign</button>
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
            <div className="page-header">
              <div>
                <h2 className="page-title">Leads</h2>
                <p className="page-sub">Your verified audience</p>
              </div>
              <div className="page-actions">
                <button className="btn-primary" type="button" data-tour="find-leads" onClick={openLeadSourcing}>Find leads</button>
              </div>
            </div>

            <div className="lead-metrics" aria-label="Lead library summary">
              <div><strong>{verifiedEmailLeadCount}</strong><span>Verified work emails</span></div>
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
                <div className="lead-table-card" data-tour="leads-table">
                  <div className="lead-table-scroll"><table className="lead-table">
                    <thead>
                      <tr>

                        <th>Lead</th><th>Company</th><th>Status</th><th>Enrichment</th><th>Last updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className={selectedLead?.id === lead.id ? 'selected' : ''}>

                          <td><button className="lead-person-button" type="button" onClick={() => openLeadResearch(lead)}><span className="lead-avatar">{initials(lead.full_name)}</span><span><strong>{lead.full_name}</strong><small>{lead.title || 'Contact'}</small></span></button></td>
                          <td><div className="lead-company">{lead.company_name || 'Independent'}</div></td>
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
                    <div className="lead-source-grid"><label>Region<input className="sf-inp" value={apolloFilters.region} onChange={event => setApolloFilters({ ...apolloFilters, region: event.target.value })} placeholder="Singapore" /></label><label>Industry<input className="sf-inp" value={apolloFilters.industry} onChange={event => setApolloFilters({ ...apolloFilters, industry: event.target.value })} placeholder="Industry" list="lead-industry-options" /></label></div>
                    <datalist id="lead-industry-options">{apolloIndustryOptions.map(industry => <option key={industry} value={industry} />)}</datalist>
                    <div className="lead-source-grid"><label>Company size<input className="sf-inp" value={apolloFilters.companySize} onChange={event => setApolloFilters({ ...apolloFilters, companySize: event.target.value })} placeholder="11-50" /></label><label>Lead limit<input className="sf-inp" type="number" min={1} max={100} value={apolloFilters.limit} onChange={event => setApolloFilters({ ...apolloFilters, limit: Number(event.target.value) })} /></label></div>
                    <button className="btn-primary lead-full-button" type="button" disabled={busy === 'apollo'} onClick={handleApolloImport}>{busy === 'apollo' ? 'Searching...' : 'Find leads'}</button>
                    <button className="btn-outline lead-full-button" type="button" disabled={busy === 'apollo-sync'} onClick={handleApolloSync}>{busy === 'apollo-sync' ? 'Syncing...' : 'Sync email results'}</button>
                    {activeApolloRun ? <ApolloImportProgress run={activeApolloRun} elapsedSeconds={apolloElapsedSeconds} /> : <p className="lead-source-note">Most 25-lead searches take roughly 2–5 minutes. Response time can vary.</p>}
                    <details className="lead-source-details"><summary>{editingLeadId ? 'Editing lead' : 'Add a lead manually'}</summary><form onSubmit={handleCreateLead}>{Object.keys(emptyLeadForm).map(key => <input key={key} className="sf-inp" value={leadForm[key as keyof typeof leadForm]} onChange={event => setLeadForm({ ...leadForm, [key]: event.target.value })} placeholder={key.replaceAll('_', ' ')} required={key === 'full_name' || key === 'email'} />)}{!editingLeadId ? <select className="sf-inp" value={manualCampaignId} onChange={event => setManualCampaignId(event.target.value)}><option value="">Keep in lead pool (no campaign)</option>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select> : null}<button className="btn-outline" type="submit" disabled={busy === 'lead'}>{busy === 'lead' ? 'Saving...' : editingLeadId ? 'Update lead' : 'Save lead'}</button>{editingLeadId ? <button className="card-action" type="button" onClick={cancelEditLead}>Cancel edit</button> : null}</form></details>
                    <details className="lead-source-details"><summary>Import a CSV</summary><input className="sf-inp" type="file" accept=".csv,text/csv" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setCsvText(await file.text()); setCsvMappings([]); setCsvPreview([]); }} /><select className="sf-inp" value={csvMode} onChange={event => setCsvMode(event.target.value as 'import' | 'suppress')}><option value="import">Import leads</option><option value="suppress">Exclude from future searches</option></select>{csvMode === 'import' ? <select className="sf-inp" value={csvCampaignId} onChange={event => setCsvCampaignId(event.target.value)}><option value="">Keep imported leads in the lead pool</option>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select> : null}<button className="btn-outline" type="button" disabled={!csvText || busy === 'csv-preview'} onClick={handleCsvPreview}>{busy === 'csv-preview' ? 'Mapping...' : 'Map columns with AI'}</button>{csvMappings.length ? <div className="lead-csv-mapping">{csvMappings.map((mapping, index) => <label key={`${mapping.source}-${index}`}>{mapping.source}<select className="sf-inp" value={mapping.target} onChange={event => setCsvMappings(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, target: event.target.value } : item))}>{csvTargets.map(target => <option key={target} value={target}>{target}</option>)}</select></label>)}<button className="btn-primary" type="button" disabled={busy === 'csv'} onClick={handleCsvImport}>{busy === 'csv' ? 'Importing...' : `Confirm and ${csvMode === 'suppress' ? 'exclude' : 'import'}`}</button>{lastCsvRun && lastCsvRun.skipped_count > 0 ? <button className="btn-outline" type="button" onClick={handleDownloadCsvErrors}>Download skipped-row report</button> : null}</div> : null}</details>
                  </div>
                ) : selectedLead ? (
                  <LeadResearchProfile
                    lead={selectedLead}
                    onAddToCampaign={() => { closeLeadDrawer(); openCampaignBuilder([selectedLead.id]); }}
                    onEdit={() => { beginEditLead(selectedLead); setLeadDrawerMode('source'); }}
                    onDelete={() => { closeLeadDrawer(); handleDeleteLeads([selectedLead.id]); }}
                  />
                ) : <div className="lead-empty-profile"><p>Select a lead to review its context, or start a new lead search.</p><button className="btn-primary" type="button" onClick={openLeadSourcing}>Find leads</button></div>}
              </aside>
              </div> : null}
            </div>
          </section>
        ) : null}

        {activePage === 'inbox' ? (
          <section>
            <div className="page-header">
              <div>
                <div className="page-kicker">Communications</div>
                <h2 className="page-title">Reply with context</h2>
                <p className="page-sub">Every reply keeps the lead and company context alongside an AI draft for your approval.</p>
              </div>
            </div>
            <div className="inbox-workspace" data-tour="inbox-workspace">
              <div className="card inbox-thread-panel">
                <div className="card-head">
                  <div>
                    <div className="card-title">Reply queue</div>
                    <div className="sf-hint">Approve a draft when it is ready to send.</div>
                  </div>
                  <span className="card-action">{visibleConversations.length} conversation{visibleConversations.length === 1 ? '' : 's'}</span>
                </div>
                <div className="conversation-controls">
                  <div className="conversation-search">
                    <svg className="conversation-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                    <input aria-label="Search conversations" value={conversationSearch} onChange={event => setConversationSearch(event.target.value)} placeholder="Search conversations" />
                    {conversationSearch ? (
                      <button type="button" className="conversation-search-clear" aria-label="Clear search" onClick={() => setConversationSearch('')}>×</button>
                    ) : null}
                  </div>
                  <div className="conversation-filter-list">{(['all', 'needs_reply', 'draft_ready', 'sent', 'positive', 'unsubscribed'] as const).map(filter => <button key={filter} type="button" className={conversationFilter === filter ? 'is-active' : ''} onClick={() => setConversationFilter(filter)}>{filter === 'all' ? 'All' : filter.replace(/_/g, ' ')}</button>)}</div>
                </div>
                {visibleConversations.length ? visibleConversations.map(conversation => (
                  <div key={conversation.lead_id} className="call-card message-row" role="button" tabIndex={0} aria-label={`Open conversation with ${conversation.lead.full_name || conversation.lead.email}`} onClick={() => setOpenedConversation(conversation)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpenedConversation(conversation); } }}>
                    <div className="call-av">{initials(conversation.lead.full_name)}</div>
                    <div className="call-meta">
                      <div className="call-name">{conversation.lead.full_name || conversation.lead.email || 'Conversation'}</div>
                      <div className="call-detail">{conversation.lead.company_name || conversation.lead.email} · {fmtDate(conversation.last_message_at)}</div>
                      <div className="message-row-preview">{messagePreview(conversation.latest_message.body)}</div>
                    </div>
                    <div className="call-right">
                      {conversation.latest_message.intent_classification ? (
                        <span className={`badge ${intentBadge(conversation.latest_message.intent_classification)}`}>
                          {conversation.latest_message.intent_classification.replace(/_/g, ' ')}
                        </span>
                      ) : null}
                      {/* Opens the thread rather than sending straight away.
                          The design does the same, and this panel's own copy
                          says the reply is never sent just because it was
                          drafted — approving unread would contradict that.
                          The actual approve lives in the thread drawer. */}
                      <button
                        type="button"
                        className="btn-outline reply-approve"
                        title={conversation.draft_ready ? 'Review the drafted reply' : 'No draft ready yet — open the thread'}
                        onClick={event => {
                          event.stopPropagation();
                          setOpenedConversation(conversation);
                        }}
                      >
                        Approve reply
                      </button>
                    </div>
                  </div>
                )) : <EmptyState text="No conversations match this filter yet." />}
              </div>
              <aside className="set-panel inbox-summary-panel">
                <div className="sf-lbl">Conversation health</div>
                <div className="msl-list" style={{ marginTop: 18 }}>
                  {/* Three rows, matching the design. "Needs review" is the
                      queue this page exists to clear: replies with a draft
                      waiting on you. */}
                  <Metric label="Needs review" value={conversations.filter(item => item.draft_ready).length.toString()} />
                  <Metric label="Positive intent" value={conversations.filter(item => item.positive_intent).length.toString()} />
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
              <div className="page-actions">
                {/* The design shows the list only. The month calendar is an
                    existing feature, so it stays available here rather than
                    being dropped. */}
                <div className="view-switch" role="tablist" aria-label="Meetings view">
                  {(['list', 'calendar'] as const).map(view => (
                    <button
                      key={view}
                      type="button"
                      role="tab"
                      aria-selected={meetingsView === view}
                      className={`rs-pill${meetingsView === view ? ' is-active' : ''}`}
                      onClick={() => setMeetingsView(view)}
                    >
                      {view === 'list' ? 'List' : 'Calendar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {meetingsView === 'list' ? <MeetingsList meetings={meetings} /> : <MeetingsCalendar meetings={meetings} />}
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
              dataTour="analytics-kpis"
              items={[
                ['Generated', preview.length, 'Ge'],
                ['Sent', sentMessages, 'Se'],
                ['Opened', openedMessages, 'Op'],
                ['Replies', inbox.length, 'Re'],
              ]}
            />
            <div className="an-grid metric-grid">
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
                <button type="button" className={`sn-item${settingsSection === 'autopilot' ? ' active' : ''}`} onClick={() => setSettingsSection('autopilot')}>Autopilot</button>
                <button type="button" className={`sn-item${settingsSection === 'workspace' ? ' active' : ''}`} onClick={() => setSettingsSection('workspace')}>Workspace</button>
                <button type="button" className={`sn-item${settingsSection === 'compliance' ? ' active' : ''}`} onClick={() => setSettingsSection('compliance')}>Compliance</button>
                <button type="button" className={`sn-item${settingsSection === 'profile' ? ' active' : ''}`} onClick={() => setSettingsSection('profile')}>Profile</button>
              </div>
              {settingsSection === 'mailbox' ? <form className="set-panel" data-tour="smtp-form" onSubmit={handleSmtpConnect}>
                <div className="sf">
                  <div className="sf-lbl">Connected account</div>
                  <div className="sf-hint">{smtpAccount ? `${smtpAccount.from_email} · ${smtpAccount.status}` : 'No mailbox connected.'}</div>
                  {smtpAccount ? <div className="sf-hint">SMTP {smtpAccount.smtp_verified_at ? 'verified' : 'not verified'} · IMAP {smtpAccount.imap_verified_at ? 'verified' : 'not verified'}</div> : null}
                </div>
                <div className="sf mailbox-presets">
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
                      <li>Save the mailbox; CircleOn will verify both sending and inbox access.</li>
                    </ol>
                  ) : mailboxProvider === 'outlook' ? (
                    <ol className="sf-hint" style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Use your complete Microsoft 365 email as the SMTP username.</li>
                      <li>Use an app password if your organization requires multi-factor authentication and permits app passwords.</li>
                      <li>Ask your Microsoft 365 administrator to enable authenticated SMTP and IMAP for this mailbox if verification fails.</li>
                      <li>Save the mailbox; CircleOn will verify both protocols before marking it connected.</li>
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
              {settingsSection === 'autopilot' ? <div className="set-panel" data-tour="autopilot-panel">
                <div className="sf-lbl">Daily campaign autopilot</div>
                <p className="sf-hint" style={{ marginTop: 8 }}>Autopilot finds new leads, assigns each one to a launched campaign, generates the sequence, and schedules sending. Campaigns marked Requires your attention never run here.</p>
                <div className="msl-list" style={{ marginTop: 18 }}>
                  <Metric label="Mailbox" value={autopilotReadiness?.mailbox_ready ? 'Verified' : 'Needs attention'} />
                  <Metric label="Launched campaigns" value={String(autopilotReadiness?.launched_campaigns || 0)} />
                  <Metric label="Included campaigns" value={String(autopilotReadiness?.included_campaigns || 0)} />
                  <Metric label="Run time" value={`${(autopilotSettings?.daily_run_time || '08:00').slice(0, 5)} ${autopilotSettings?.timezone || 'Asia/Singapore'}`} />
                </div>
                {autopilotSettings ? <>
                  <div className="sf" style={{ marginTop: 18 }}>
                    <label className="sf-lbl" htmlFor="autopilot-time">Daily lead discovery time</label>
                    <input id="autopilot-time" className="sf-inp" type="time" value={autopilotSettings.daily_run_time.slice(0, 5)} onChange={event => setAutopilotSettings(current => current ? { ...current, daily_run_time: event.target.value } : current)} />
                  </div>
                  <div className="sf" style={{ marginTop: 14 }}>
                    <label className="sf-lbl" htmlFor="autopilot-cap">Workspace daily email safety cap</label>
                    <input id="autopilot-cap" className="sf-inp" type="number" min="1" max="2000" value={autopilotSettings.workspace_daily_send_cap} onChange={event => setAutopilotSettings(current => current ? { ...current, workspace_daily_send_cap: Number(event.target.value) } : current)} />
                  </div>
                  <label className="sf-hint" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                    <input type="checkbox" checked={autopilotSettings.include_all_launched_campaigns} onChange={event => setAutopilotSettings(current => current ? { ...current, include_all_launched_campaigns: event.target.checked, campaign_ids: event.target.checked ? [] : current.campaign_ids } : current)} />
                    Include all launched campaigns
                  </label>
                  {!autopilotSettings.include_all_launched_campaigns ? <div className="sf" style={{ marginTop: 14 }}>
                    <div className="sf-lbl">Selected launched campaigns</div>
                    <div className="sf-hint" style={{ marginTop: 6 }}>Only launched campaigns can be included. Review and launch suggested campaigns first.</div>
                    <div className="msl-list" style={{ marginTop: 10 }}>
                      {campaigns.filter(campaign => campaign.status === 'active').map(campaign => <label key={campaign.id} className="sf-hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={autopilotSettings.campaign_ids.includes(campaign.id)} onChange={event => setAutopilotSettings(current => current ? { ...current, campaign_ids: event.target.checked ? [...current.campaign_ids, campaign.id] : current.campaign_ids.filter(id => id !== campaign.id) } : current)} />{campaign.name}</label>)}
                      {!campaigns.some(campaign => campaign.status === 'active') ? <span className="sf-hint">No launched campaigns yet.</span> : null}
                    </div>
                  </div> : null}
                  <label className="sf-hint" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                    <input type="checkbox" checked={autopilotSettings.enabled} disabled={!autopilotReadiness?.can_enable && !autopilotSettings.enabled} onChange={event => setAutopilotSettings(current => current ? { ...current, enabled: event.target.checked } : current)} />
                    Enable autopilot for launched campaigns
                  </label>
                  {!autopilotSettings.enabled && autopilotBlockReasons.length ? <div role="status" className="sf-hint" style={{ marginTop: 8, marginLeft: 26, color: 'var(--purple)' }}>
                    <strong>Why is this unavailable?</strong>
                    <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>{autopilotBlockReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
                  </div> : null}
                  <div className="set-save">
                    <button className="btn-outline" type="button" disabled={busy === 'autopilot-run' || !autopilotSettings.enabled} onClick={runAutopilot}>{busy === 'autopilot-run' ? 'Queuing...' : 'Run now'}</button>
                    <button className="btn-primary" type="button" disabled={busy === 'autopilot'} onClick={() => saveAutopilot(autopilotSettings)}>{busy === 'autopilot' ? 'Saving...' : 'Save autopilot'}</button>
                  </div>
                </> : <p className="sf-hint" style={{ marginTop: 18 }}>Autopilot becomes available after the campaign-autopilot database migration is applied.</p>}
                {autopilotRuns.length ? <div className="sf" style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--cream-dark)' }}>
                  <div className="sf-lbl">Recent runs</div>
                  <div className="msl-list" style={{ marginTop: 10 }}>{autopilotRuns.slice(0, 5).map(run => <Metric key={run.id} label={`${run.campaigns?.name || 'Campaign'} · ${run.local_run_date}`} value={`${run.status} · ${run.assigned_leads} leads · ${run.scheduled_messages} scheduled`} />)}</div>
                </div> : null}
              </div> : null}
              {settingsSection === 'workspace' ? (
                <div className="set-panel">
                  <div className="sf-lbl">Workspace</div>
                  <div className="msl-list" style={{ marginTop: 14 }}>
                    <Metric label="Name" value={workspace?.name || 'Workspace'} />
                    <Metric label="Plan" value={workspace?.plan || 'Not selected'} />
                    <Metric label="Onboarding" value={workspace?.onboarding_completed ? 'Complete' : 'Incomplete'} />
                    <Metric label="Visible leads" value={visibleLeads.length.toString()} />
                  </div>
                  <div className="sf-hint" style={{ marginTop: 16 }}>Lead targeting and email-writing preferences are managed through onboarding. Billing controls are kept separate.</div>
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
                  <div className="msl-list" style={{ marginTop: 14 }}>
                    <Metric label="Verified sender required" value="Enabled" />
                    <Metric label="Unsubscribe footer" value="Added automatically" />
                    <Metric label="Reply opt-outs" value="Block future sends" />
                    <Metric label="Suppression CSV" value="Available in Leads" />
                    <Metric label="Generic emails" value="Rejected during enrichment" />
                  </div>
                  <div className="sf-hint" style={{ marginTop: 18 }}>CircleOn stops future campaign selection after an unsubscribe or suppression match. Your organization remains responsible for its sending identity, lawful basis, audience, and regional requirements.</div>
                  <div className="set-save">
                    <button className="btn-outline" type="button" onClick={() => setActivePage('leads')}>Manage suppressions</button>
                  </div>
                </div>
              ) : null}
              {settingsSection === 'profile' ? (
                <div className="set-panel">
                  <div className="sf-lbl">Profile</div>
                  <div className="msl-list" style={{ marginTop: 14 }}>
                    <Metric label="Signed-in mailbox" value={smtpAccount?.from_email || 'Not connected'} />
                    <Metric label="Workspace" value={workspace?.name || 'Workspace'} />
                    <Metric label="Plan" value={workspace?.plan || 'Not selected'} />
                  </div>
                  <div className="sf-lbl" style={{ marginTop: 22 }}>Appearance</div>
                  <div className="pref-row" style={{ marginTop: 6 }}>
                    <span className="pref-copy"><strong>Dark mode</strong>{theme === 'dark' ? 'Currently using the dark palette.' : 'Currently using the light palette.'}</span>
                    <button
                      type="button"
                      role="switch"
                      className="theme-switch"
                      aria-checked={theme === 'dark'}
                      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                      onClick={toggleTheme}
                    ><span aria-hidden="true" /></button>
                  </div>
                  <div className="sf-hint" style={{ marginTop: 16 }}>The theme is stored on this device, so each browser you sign in from keeps its own choice.</div>
                  <div className="sf-lbl" style={{ marginTop: 22 }}>Guided tour</div>
                  <div className="pref-row" style={{ marginTop: 6 }}>
                    <span className="pref-copy"><strong>Product tour</strong>Replay the walkthrough of Barsha, from mailbox to first campaign.</span>
                    <button className="btn-outline" type="button" onClick={() => tour?.startTour({ restart: true })}>Restart tour</button>
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
            <div className="an-grid metric-grid">
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
        mailboxAccount={smtpAccount}
        initialLeadIds={campaignBuilderLeadIds}
        isSubmitting={busy === 'campaign'}
        onClose={() => {
          setShowCampaignForm(false);
          setCampaignBuilderLeadIds([]);
        }}
        onSubmit={handleCreateCampaign}
      />
      {openedConversation ? <ConversationThreadModal conversation={openedConversation} onClose={() => setOpenedConversation(null)} onRefresh={refreshAll} onError={setMessage} /> : null}
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
          : stalled ? <div className="import-progress-note">This stage is taking longer than usual. CircleOn is still checking; you can leave this page and return later.</div>
            : <div className="import-progress-note">{remainingSeconds > 5 ? `About ${formatDuration(remainingSeconds)} remaining` : 'Finishing this stage…'} · This is a live estimate.</div>}
    </div>
  );
}
