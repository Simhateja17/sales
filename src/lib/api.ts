const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export type Answers = Record<string, string | string[] | number>;

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  plan: 'atelier' | 'maison' | 'sovereign' | null;
  onboarding_step: number;
  onboarding_completed: boolean;
}

export interface AgentConfig {
  id: string;
  workspace_id: string;
  agent_name: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  business_model: string | null;
  target_titles: string[];
  target_regions: string | null;
  company_size: string | null;
  min_mrr_k_sgd: number;
  product: string | null;
  pricing_model: string | null;
  value_proposition: string | null;
  objections: string | null;
  monthly_capacity: number;
  booking_link: string | null;
  tone: string | null;
  raw_answers: Answers;
  system_prompt: string;
  status: 'draft' | 'ready' | 'launched' | 'paused';
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'follow_up' | 'booked' | 'do_not_call';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Lead {
  id: string;
  workspace_id: string;
  source: 'manual' | 'csv' | 'apollo';
  external_id: string | null;
  full_name: string;
  company_name: string | null;
  title: string | null;
  phone: string | null;
  phone_e164: string | null;
  email: string | null;
  location: string | null;
  status: LeadStatus;
  priority: Priority;
  voice_consent_status: 'unknown' | 'consented' | 'not_consented';
  dnc_status: 'unknown' | 'pending' | 'clear' | 'blocked' | 'error';
  dnc_checked_at: string | null;
  callable_block_reason: string | null;
  last_contacted_at: string | null;
  notes_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  workspace_id: string;
  lead_id: string;
  title: string;
  context_note: string | null;
  owner_type: 'agent' | 'human';
  action_type: 'call' | 'send_info' | 'book_meeting' | 'manual_task';
  status: 'suggested' | 'scheduled' | 'calling' | 'completed' | 'dismissed' | 'missed';
  priority: Priority;
  due_at: string | null;
  completed_at: string | null;
  approved_at: string | null;
  blocked_reason: string | null;
  leads?: Pick<Lead, 'full_name' | 'company_name' | 'phone' | 'email'>;
}

export interface WorkspaceTelephony {
  id: string;
  workspace_id: string;
  from_number: string | null;
  retell_phone_number: string | null;
  phone_number_status: 'missing' | 'attached' | 'verified' | 'error';
  calling_enabled: boolean;
  daily_call_cap: number;
  timezone: string;
  business_hours_start: string;
  business_hours_end: string;
  last_error: string | null;
}

export interface VoiceAgent {
  id: string;
  workspace_id: string;
  retell_llm_id: string | null;
  retell_agent_id: string | null;
  voice_id: string | null;
  status: 'draft' | 'provisioning' | 'ready' | 'error';
  last_synced_at: string | null;
  last_error: string | null;
}

export interface AIJob {
  id: string;
  workspace_id: string;
  created_by: string | null;
  job_type: 'agent_launch';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  current_step: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallRecord {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  follow_up_id: string | null;
  retell_call_id: string | null;
  from_number: string | null;
  to_number: string | null;
  status: 'queued' | 'calling' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'canceled';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  recording_url: string | null;
  summary: string | null;
  sentiment: string | null;
  disconnection_reason: string | null;
  success: boolean | null;
  error_message: string | null;
  outcome_type: OutcomeType | null;
  outcome_confidence: 'low' | 'medium' | 'high' | null;
  outcome_summary: string | null;
  next_action: string | null;
  meeting_id: string | null;
  created_at: string;
  leads?: Pick<Lead, 'full_name' | 'company_name' | 'phone'>;
  follow_ups?: Pick<FollowUp, 'title'>;
  call_outcomes?: Pick<CallOutcome, 'outcome_type' | 'confidence' | 'next_action' | 'meeting_requested'>[];
  meetings?: Pick<Meeting, 'id' | 'status' | 'starts_at' | 'booking_url'>[];
}

export type OutcomeType = 'booked' | 'booking_link_sent' | 'interested' | 'follow_up_needed' | 'no_answer' | 'not_interested' | 'do_not_call' | 'unknown';

export interface CallOutcome {
  id: string;
  workspace_id: string;
  call_id: string | null;
  lead_id: string | null;
  follow_up_id: string | null;
  outcome_type: OutcomeType;
  confidence: 'low' | 'medium' | 'high';
  summary: string | null;
  next_action: string | null;
  meeting_requested: boolean;
  created_at: string;
  leads?: Pick<Lead, 'full_name' | 'company_name' | 'email' | 'phone'>;
}

export interface Meeting {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  call_id: string | null;
  call_outcome_id: string | null;
  provider: 'manual' | 'calendly' | 'google_calendar' | 'outlook';
  external_id: string | null;
  status: 'requested' | 'scheduled' | 'completed' | 'canceled' | 'no_show';
  title: string;
  invitee_name: string | null;
  invitee_email: string | null;
  invitee_phone: string | null;
  booking_url: string | null;
  meeting_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  notes: string | null;
  created_at: string;
  leads?: Pick<Lead, 'full_name' | 'company_name' | 'email' | 'phone'>;
}

export interface CallingStatus {
  workspaceTelephony: WorkspaceTelephony | null;
  voiceAgent: VoiceAgent | null;
  latestLaunchJob: AIJob | null;
  readiness: {
    ready: boolean;
    callingEnabled: boolean;
    checks: Array<{ key: string; label: string; ready: boolean; reason: string | null }>;
  };
  queue: {
    callableLeads: number;
    blockedLeads: number;
    activeCalls: number;
  };
  calls: CallRecord[];
}

export interface LeadImportRun {
  id: string;
  source: 'manual' | 'csv' | 'apollo';
  status: 'pending' | 'completed' | 'failed';
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  error_message?: string | null;
  raw_meta?: Record<string, unknown>;
}

export interface ApolloFilters {
  titles: string[];
  region: string;
  industry: string;
  companySize: string;
  limit: number;
}

export interface WorkspaceResponse {
  user: {
    id: string;
    email?: string;
  };
  workspace: Workspace;
  agentConfig: AgentConfig | null;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export function getWorkspace() {
  return apiFetch<WorkspaceResponse>('/api/workspace/me');
}

export function savePlan(plan: Workspace['plan']) {
  return apiFetch<{ workspace: Workspace }>('/api/workspace/plan', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

export function saveOnboarding(answers: Answers) {
  return apiFetch<{ workspace: Workspace; agentConfig: AgentConfig }>('/api/workspace/onboarding', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export function saveOnboardingDraft(answers: Answers, step: number) {
  return apiFetch<{ workspace: Workspace; agentConfig: AgentConfig }>('/api/workspace/onboarding-draft', {
    method: 'POST',
    body: JSON.stringify({ answers, step }),
  });
}

export function getLeads() {
  return apiFetch<{ leads: Lead[]; followUps: FollowUp[] }>('/api/leads');
}

export function createLead(lead: Record<string, unknown>) {
  return apiFetch<{ lead: Lead; updated: boolean }>('/api/leads', {
    method: 'POST',
    body: JSON.stringify({ lead }),
  });
}

export function importCsvLeads(rows: Record<string, string>[]) {
  return apiFetch<{ importRun: LeadImportRun }>('/api/leads/import-csv', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
}

export function getApolloFilters() {
  return apiFetch<{ filters: ApolloFilters }>('/api/apollo/filters');
}

export function importApolloLeads(filters: ApolloFilters) {
  return apiFetch<{ importRun: LeadImportRun }>('/api/apollo/import', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

export function updateFollowUp(followUpId: string, patch: Partial<FollowUp>) {
  return apiFetch<{ followUp: FollowUp }>(`/api/leads/follow-ups/${followUpId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function getCallingStatus() {
  return apiFetch<CallingStatus>('/api/calling/status');
}

export function attachTelephony(fromNumber: string) {
  return apiFetch<{ workspaceTelephony: WorkspaceTelephony }>('/api/calling/telephony', {
    method: 'POST',
    body: JSON.stringify({ from_number: fromNumber }),
  });
}

export function provisionVoiceAgent(voiceId?: string) {
  return apiFetch<{ job: AIJob }>('/api/ai/agent-launch', {
    method: 'POST',
    body: JSON.stringify({ source: 'dashboard', voice_id: voiceId }),
  });
}

export function getAgentLaunchJob(jobId: string) {
  return apiFetch<{ job: AIJob }>(`/api/ai/jobs/${jobId}`);
}

export function setCallingLaunch(enabled: boolean) {
  return apiFetch<{ workspaceTelephony: WorkspaceTelephony; readiness: CallingStatus['readiness'] }>('/api/calling/launch', {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}

export function setLeadVoiceConsent(leadId: string, voiceConsentStatus: Lead['voice_consent_status']) {
  return apiFetch<{ lead: Lead }>(`/api/calling/leads/${leadId}/voice-consent`, {
    method: 'POST',
    body: JSON.stringify({ voice_consent_status: voiceConsentStatus }),
  });
}

export function setLeadDncStatus(lead: Lead, status: Lead['dnc_status']) {
  return apiFetch<{ lead: Lead }>('/api/calling/dnc/check', {
    method: 'POST',
    body: JSON.stringify({
      lead_id: lead.id,
      phone: lead.phone_e164 || lead.phone,
      status,
    }),
  });
}

export function approveFollowUp(followUpId: string, dueAt?: string | null) {
  return apiFetch<{ followUp: FollowUp }>(`/api/calling/follow-ups/${followUpId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ due_at: dueAt || null }),
  });
}

export function getOutcomes() {
  return apiFetch<{ outcomes: CallOutcome[] }>('/api/outcomes');
}

export function getMeetings() {
  return apiFetch<{ meetings: Meeting[] }>('/api/outcomes/meetings');
}
