const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAuthenticationError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

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
export type CampaignStatus = 'draft' | 'generating' | 'ready' | 'active' | 'paused' | 'completed' | 'archived';
export type MessageStatus = 'draft' | 'pending_approval' | 'approved' | 'queued' | 'sent' | 'failed' | 'received' | 'auto_sent' | 'rejected';
export type MessageDirection = 'outbound' | 'inbound';
export type IntentClassification = 'positive' | 'pricing' | 'not_interested' | 'dnc_request' | 'auto_reply' | null;

export interface Lead {
  id: string;
  workspace_id: string;
  source: 'manual' | 'csv' | 'apollo';
  external_id: string | null;
  import_run_id: string | null;
  full_name: string;
  company_name: string | null;
  title: string | null;
  phone: string | null;
  phone_e164: string | null;
  email: string | null;
  email_status: 'unknown' | 'user_provided' | 'verified' | 'likely' | 'unverified' | 'invalid' | 'not_found';
  email_source: string | null;
  linkedin_url: string | null;
  company_domain: string | null;
  lifecycle_status: 'candidate' | 'enriching' | 'ready' | 'selected_for_campaign' | 'contacted' | 'rejected_no_email' | 'suppressed';
  enrichment_status: 'not_started' | 'pending' | 'completed' | 'failed' | 'cooldown';
  fit_score: number;
  fit_reasons: Array<{ points: number; reason: string }>;
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

export interface ConnectedAccount {
  id: string;
  workspace_id: string;
  provider: 'smtp';
  from_email: string;
  from_name: string | null;
  reply_to_email: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  imap_host: string | null;
  imap_port: number | null;
  imap_username: string;
  status: 'connected' | 'error' | 'disconnected';
  smtp_verified_at: string | null;
  imap_verified_at: string | null;
  last_error: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  status: CampaignStatus;
  target_segment: Record<string, unknown>;
  brief?: CampaignBrief;
  daily_send_cap: number;
  timezone: string;
  sending_hours_start: string;
  sending_hours_end: string;
  active_days: number[];
  cadence_per_hour: number;
  lead_source: 'apollo' | 'csv' | 'manual';
  auto_send_replies: boolean;
  require_approval: boolean;
  launched_at: string | null;
  paused_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  email_sequences?: EmailSequence[];
}

export interface CampaignBrief {
  agent_config?: Pick<AgentConfig, 'agent_name' | 'company_name' | 'product' | 'value_proposition' | 'target_titles' | 'target_regions' | 'objections' | 'tone' | 'booking_link'>;
  campaign_angle?: string;
  cta?: string;
  tone?: string;
}

export interface CampaignGeneration {
  job_id: string | null;
  status: 'idle' | 'waiting' | 'active' | 'delayed' | 'prioritized' | 'completed' | 'failed' | 'unknown';
  generated_messages?: number;
  failed_reason?: string | null;
  progress: {
    total?: number;
    processed?: number;
    generated?: number;
    skipped?: number;
    failed?: number;
  } | null;
}

export interface EmailSequence {
  id: string;
  workspace_id: string;
  campaign_id: string;
  step_number: number;
  name?: string;
  subject_template: string;
  body_template: string;
  delay_days: number;
  ai_instruction?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmailMessage {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  lead_id: string | null;
  sequence_step: number | null;
  direction: MessageDirection;
  channel: 'email';
  subject: string | null;
  body: string | null;
  draft_body: string | null;
  status: MessageStatus;
  provider_message_id: string | null;
  message_id_header: string | null;
  in_reply_to: string | null;
  sent_at: string | null;
  received_at: string | null;
  opened_at: string | null;
  open_count: number;
  clicked_at: string | null;
  intent_classification: IntentClassification;
  ai_confidence: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, 'full_name' | 'company_name' | 'title' | 'email' | 'status'>;
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
  status: 'pending' | 'searching' | 'enriching' | 'pending_enrichment' | 'completed' | 'partial' | 'failed';
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  error_message?: string | null;
  raw_meta?: Record<string, unknown>;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  timeout_at?: string | null;
  progress?: Record<string, unknown>;
}

export interface CsvMapping {
  source: string;
  target: string;
  confidence: number;
  reason: string;
}

export interface ApolloFilters {
  titles: string[];
  region: string;
  industry: string;
  companySize: string;
  limit: number;
}

export interface ApolloFilterDefaults {
  filters: ApolloFilters;
  industryOptions: string[];
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
    const error = new ApiError(data.error || 'Request failed', res.status);
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('barsha:authentication-required'));
    }
    throw error;
  }

  return data as T;
}

export function logout() {
  return apiFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
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

export function getTargetSuggestions(input: { product: string; buyer?: string; industry?: string }) {
  return apiFetch<{ suggestions: { titles: string[]; consumer_warning: boolean; explanation: string } }>('/api/workspace/target-suggestions', {
    method: 'POST',
    body: JSON.stringify(input),
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

export function updateLead(leadId: string, patch: Record<string, unknown>) {
  return apiFetch<{ lead: Lead }>(`/api/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function deleteLead(leadId: string) {
  return apiFetch<{ deleted: boolean; leadId: string }>(`/api/leads/${leadId}`, { method: 'DELETE' });
}

export function previewCsvMapping(csvText: string) {
  return apiFetch<{ headers: string[]; row_count: number; mappings: CsvMapping[]; preview: Record<string, unknown>[] }>('/api/leads/csv/preview', {
    method: 'POST',
    body: JSON.stringify({ csv_text: csvText }),
  });
}

export function startCsvImport(csvText: string, mappings: CsvMapping[], mode: 'import' | 'suppress') {
  return apiFetch<{ importRun: LeadImportRun }>('/api/leads/csv/import', {
    method: 'POST',
    body: JSON.stringify({ csv_text: csvText, mappings, mode }),
  });
}

export async function downloadCsvImportErrors(runId: string) {
  const response = await fetch(`${API_URL}/api/leads/imports/${runId}/errors.csv`, { credentials: 'include' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to download import errors');
  }
  return response.blob();
}

export function getLeadImport(runId: string) {
  return apiFetch<{ importRun: LeadImportRun }>(`/api/leads/imports/${runId}`);
}

export function getApolloFilters() {
  return apiFetch<ApolloFilterDefaults>('/api/apollo/filters');
}

export function importApolloLeads(filters: ApolloFilters) {
  return apiFetch<{ importRun: LeadImportRun; sync?: { updated: number; skipped: number; pending: number } }>('/api/apollo/import', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

export function getApolloImport(runId: string) {
  return apiFetch<{ importRun: LeadImportRun }>(`/api/apollo/imports/${runId}`);
}

export function getLatestApolloImport() {
  return apiFetch<{ importRun: LeadImportRun | null }>('/api/apollo/imports/latest');
}

export function syncApolloEmails() {
  return apiFetch<{ sync: { updated: number; skipped: number; pending: number }; requestIds: string[] }>('/api/apollo/sync-pending', {
    method: 'POST',
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

export interface ConnectSmtpPayload {
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
}

export function getSmtpStatus() {
  return apiFetch<{ account: ConnectedAccount | null }>('/api/emails/smtp/status');
}

export function connectSmtp(account: ConnectSmtpPayload) {
  return apiFetch<{ account: ConnectedAccount }>('/api/emails/smtp/connect', {
    method: 'POST',
    body: JSON.stringify({ account }),
  });
}

export function testSmtp() {
  return apiFetch<{ ok: boolean; account: ConnectedAccount }>('/api/emails/smtp/test', {
    method: 'POST',
  });
}

export function getCampaigns() {
  return apiFetch<{ campaigns: Campaign[] }>('/api/campaigns');
}

export function createCampaign(campaign: Partial<Campaign> & { name: string }) {
  return apiFetch<{ campaign: Campaign }>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({ campaign }),
  });
}

export function getCampaign(campaignId: string) {
  return apiFetch<{ campaign: Campaign }>(`/api/campaigns/${campaignId}`);
}

export function generateCampaignEmails(campaignId: string) {
  return apiFetch<{ campaign: Campaign; generation: CampaignGeneration }>(`/api/campaigns/${campaignId}/generate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getCampaignGeneration(campaignId: string) {
  return apiFetch<{ generation: CampaignGeneration }>(`/api/campaigns/${campaignId}/generation`);
}

export function approveCampaignEmails(campaignId: string, messageIds: string[]) {
  return apiFetch<{ approved: number; messages: EmailMessage[] }>(`/api/campaigns/${campaignId}/messages/approve-batch`, {
    method: 'POST',
    body: JSON.stringify({ message_ids: messageIds }),
  });
}

export function regenerateCampaignEmail(campaignId: string, messageId: string) {
  return apiFetch<{ message: EmailMessage }>(`/api/campaigns/${campaignId}/messages/${messageId}/regenerate`, {
    method: 'POST',
  });
}

export function getCampaignLeads(campaignId: string) {
  return apiFetch<{ lead_ids: string[] }>(`/api/campaigns/${campaignId}/leads`);
}

export function replaceCampaignLeads(campaignId: string, leadIds: string[]) {
  return apiFetch<{ lead_ids: string[] }>(`/api/campaigns/${campaignId}/leads`, {
    method: 'PUT',
    body: JSON.stringify({ lead_ids: leadIds }),
  });
}

export type CampaignSequenceStep = {
  step_number: number;
  name: string;
  delay_days: number;
  ai_instruction: string;
};

export function replaceCampaignSequence(campaignId: string, steps: CampaignSequenceStep[]) {
  return apiFetch<{ campaign: Campaign; removed_steps: number[] }>(`/api/campaigns/${campaignId}/sequences`, {
    method: 'PUT',
    body: JSON.stringify({ steps }),
  });
}

export function getCampaignPreview(campaignId: string) {
  return apiFetch<{ messages: EmailMessage[] }>(`/api/campaigns/${campaignId}/preview`);
}

export function launchCampaign(campaignId: string) {
  return apiFetch<{ campaign: Campaign; queued: number }>(`/api/campaigns/${campaignId}/launch`, {
    method: 'POST',
  });
}

export function pauseCampaign(campaignId: string) {
  return apiFetch<{ campaign: Campaign }>(`/api/campaigns/${campaignId}/pause`, {
    method: 'POST',
  });
}

export function resumeCampaign(campaignId: string) {
  return apiFetch<{ campaign: Campaign }>(`/api/campaigns/${campaignId}/resume`, {
    method: 'POST',
  });
}

export function getCampaignMessages(campaignId: string) {
  return apiFetch<{ messages: EmailMessage[] }>(`/api/campaigns/${campaignId}/messages`);
}

export function updateCampaignEmail(campaignId: string, messageId: string, updates: { subject: string; body: string }) {
  return apiFetch<{ message: EmailMessage }>(`/api/campaigns/${campaignId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function sendCampaignEmailNow(campaignId: string, messageId: string) {
  return apiFetch<{ queued: boolean; message_id: string }>(`/api/campaigns/${campaignId}/messages/${messageId}/send-now`, {
    method: 'POST',
  });
}

export function sendCampaignEmailsNow(campaignId: string, messageIds: string[]) {
  return apiFetch<{ queued: number; message_ids: string[] }>(`/api/campaigns/${campaignId}/messages/send-now`, {
    method: 'POST',
    body: JSON.stringify({ message_ids: messageIds }),
  });
}

export function getInbox() {
  return apiFetch<{ conversations: EmailMessage[] }>('/api/inbox');
}

export function getConversation(leadId: string) {
  return apiFetch<{ lead: Lead; messages: EmailMessage[] }>(`/api/inbox/${leadId}`);
}

export function approveInboxMessage(messageId: string, body?: string) {
  return apiFetch<{ message: EmailMessage }>(`/api/inbox/messages/${messageId}/approve`, {
    method: 'POST',
    body: JSON.stringify(body ? { body } : {}),
  });
}

export function regenerateInboxMessage(messageId: string) {
  return apiFetch<{ message: EmailMessage }>(`/api/inbox/messages/${messageId}/regenerate`, {
    method: 'POST',
  });
}

export function rejectInboxMessage(messageId: string) {
  return apiFetch<{ message: EmailMessage }>(`/api/inbox/messages/${messageId}/reject`, {
    method: 'POST',
  });
}
