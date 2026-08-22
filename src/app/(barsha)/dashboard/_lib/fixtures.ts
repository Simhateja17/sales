/**
 * Fixture data for the dev-only preview route at /preview.
 *
 * These are typed against the real `@/lib/api` interfaces on purpose: if an API
 * shape changes, the preview stops compiling rather than silently drifting away
 * from what the dashboard actually receives.
 *
 * The names and companies mirror the design mockup (Aurora Capital, Meridian,
 * etc.) so preview screenshots can be diffed against it directly.
 */
import type {
  Campaign,
  ConnectedAccount,
  EmailMessage,
  Lead,
  Meeting,
  Workspace,
} from '@/lib/api';

const WORKSPACE_ID = 'ws_preview';

function iso(day: number, hour = 9, minute = 0) {
  return new Date(Date.UTC(2026, 7, day, hour, minute)).toISOString();
}

export const fixtureWorkspace: Workspace = {
  id: WORKSPACE_ID,
  owner_id: 'user_preview',
  name: 'Aurora Capital',
  plan: 'maison',
  onboarding_step: 5,
  onboarding_completed: true,
};

export const fixtureSmtpAccount: ConnectedAccount = {
  id: 'acct_preview',
  workspace_id: WORKSPACE_ID,
  provider: 'smtp',
  from_email: 'hello@auroracapital.sg',
  from_name: 'Aurora Capital',
  reply_to_email: 'hello@auroracapital.sg',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: 'hello@auroracapital.sg',
  imap_host: 'imap.gmail.com',
  imap_port: 993,
  imap_username: 'hello@auroracapital.sg',
  status: 'connected',
  smtp_verified_at: iso(17),
  imap_verified_at: iso(17),
  last_error: null,
  last_tested_at: iso(17),
  created_at: iso(1),
  updated_at: iso(17),
};

/** The disconnected variant, so the sidebar's grey-dot state is reviewable. */
export const fixtureSmtpDisconnected: ConnectedAccount = {
  ...fixtureSmtpAccount,
  status: 'disconnected',
  smtp_verified_at: null,
  imap_verified_at: null,
  last_error: 'Authentication failed (535). Check the app password.',
};

function lead(
  id: string,
  full_name: string,
  title: string,
  company_name: string,
  overrides: Partial<Lead> = {},
): Lead {
  return {
    id,
    workspace_id: WORKSPACE_ID,
    source: 'apollo',
    external_id: null,
    import_run_id: null,
    full_name,
    company_name,
    title,
    phone: null,
    phone_e164: null,
    email: `${full_name.toLowerCase().replace(/[^a-z]+/g, '.')}@${company_name.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
    email_status: 'verified',
    email_source: 'apollo',
    linkedin_url: null,
    company_domain: `${company_name.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
    lifecycle_status: 'ready',
    enrichment_status: 'completed',
    fit_score: 78,
    fit_reasons: [{ points: 30, reason: 'Title matches target persona' }],
    location: 'Singapore',
    status: 'new',
    priority: 'normal',
    voice_consent_status: 'unknown',
    dnc_status: 'clear',
    dnc_checked_at: iso(17),
    callable_block_reason: null,
    last_contacted_at: null,
    notes_summary: null,
    created_at: iso(10),
    updated_at: iso(21, 9, 12),
    ...overrides,
  };
}

export const fixtureLeads: Lead[] = [
  lead('lead_1', 'Jonathan Chua', 'Managing Director', 'Meridian Capital', {
    phone: '+65 8114 2907',
    phone_e164: '+6581142907',
    notes_summary:
      'Verified via LinkedIn and company site. Meridian raised a $180M growth fund in March — likely allocating now.',
    fit_score: 92,
  }),
  lead('lead_2', 'Sarah Lim', 'Head of Sales', 'Northpoint Partners', {
    phone: '+65 9023 4418',
    lifecycle_status: 'selected_for_campaign',
    status: 'contacted',
    last_contacted_at: iso(20, 16, 40),
    updated_at: iso(20, 16, 40),
    notes_summary:
      'In Family Office Touchpoint since Aug 14. Opened the intro twice, no reply yet — follow-up sends Aug 25.',
  }),
  lead('lead_3', 'Rajesh Kumar', 'CEO', 'Aster Holdings', {
    phone: '+65 8877 1260',
    enrichment_status: 'cooldown',
    status: 'not_interested',
    lifecycle_status: 'suppressed',
    updated_at: iso(19, 11, 5),
    notes_summary:
      'Replied "not now, try Q1" on a previous campaign. Excluded from Q3 sends until January.',
  }),
  lead('lead_4', 'Amanda Wong', 'Founder', 'Harbourfront Ventures', {
    email: null,
    email_status: 'invalid',
    enrichment_status: 'failed',
    lifecycle_status: 'rejected_no_email',
    updated_at: iso(18, 14, 22),
    notes_summary:
      'Work email bounced (mailbox full). No alternate address found — needs a manual check before she can be sent to.',
  }),
  lead('lead_5', 'David Tan', 'Managing Director', 'Straits Family Office', {
    phone: '+65 9145 6602',
    lifecycle_status: 'selected_for_campaign',
    status: 'contacted',
    updated_at: iso(18, 8, 55),
    notes_summary: 'Auto-reply: out of office until Monday. Sequence paused for this lead, resumes Aug 24.',
  }),
  lead('lead_6', 'Mei Ping Ho', 'CFO', 'Golden Gate Holdings', {
    phone: '+65 8330 7715',
    lifecycle_status: 'selected_for_campaign',
    status: 'booked',
    updated_at: iso(17, 17, 30),
    notes_summary:
      'Asked for a call in her reply to the Family Office thread. Aug 26, 2:30 PM is confirmed — bring the track record deck.',
  }),
];

function campaign(
  id: string,
  name: string,
  status: Campaign['status'],
  overrides: Partial<Campaign> = {},
): Campaign {
  return {
    id,
    workspace_id: WORKSPACE_ID,
    name,
    status,
    target_segment: {},
    daily_send_cap: 40,
    daily_lead_target: 40,
    autopilot_filters: {},
    attention_required: false,
    attention_reason: null,
    autopilot_confirmed_at: iso(15),
    timezone: 'Asia/Singapore',
    sending_hours_start: '09:00',
    sending_hours_end: '18:00',
    active_days: [1, 2, 3, 4, 5],
    cadence_per_hour: 6,
    lead_source: 'apollo',
    auto_send_replies: false,
    require_approval: true,
    launched_at: status === 'draft' ? null : iso(14),
    paused_at: status === 'paused' ? iso(19) : null,
    completed_at: null,
    created_at: iso(12),
    updated_at: iso(21),
    ...overrides,
  };
}

export const fixtureCampaigns: Campaign[] = [
  campaign('camp_1', 'Q3 Investor Outreach', 'active'),
  campaign('camp_2', 'Family Office Touchpoint', 'active', {
    daily_send_cap: 25,
    sending_hours_start: '08:30',
    sending_hours_end: '17:00',
  }),
  campaign('camp_3', 'Real Estate Fund Intro', 'draft', {
    daily_send_cap: 20,
    attention_required: true,
    attention_reason: 'Sequence has two unreviewed steps.',
  }),
  campaign('camp_4', 'LP Renewal Sequence', 'paused', { daily_send_cap: 15 }),
];

function message(
  id: string,
  leadIndex: number,
  campaignIndex: number,
  overrides: Partial<EmailMessage> = {},
): EmailMessage {
  const source = fixtureLeads[leadIndex];
  return {
    id,
    workspace_id: WORKSPACE_ID,
    campaign_id: fixtureCampaigns[campaignIndex].id,
    lead_id: source.id,
    sequence_step: 1,
    direction: 'inbound',
    channel: 'email',
    subject: `Re: ${fixtureCampaigns[campaignIndex].name}`,
    body: null,
    draft_body: null,
    status: 'received',
    provider_message_id: null,
    message_id_header: null,
    in_reply_to: null,
    sent_at: null,
    received_at: iso(22, 9, 14),
    opened_at: iso(22, 9, 10),
    open_count: 2,
    clicked_at: null,
    intent_classification: 'positive',
    ai_confidence: 0.88,
    error_message: null,
    created_at: iso(22, 9, 14),
    updated_at: iso(22, 9, 14),
    leads: {
      full_name: source.full_name,
      company_name: source.company_name,
      title: source.title,
      email: source.email,
      status: source.status,
    },
    campaigns: { name: fixtureCampaigns[campaignIndex].name },
    ...overrides,
  };
}

export const fixtureInbox: EmailMessage[] = [
  message('msg_1', 0, 0, { body: 'Thanks for reaching out — happy to find time next week.' }),
  message('msg_2', 3, 1, {
    body: 'Can you send more detail on the fund structure?',
    intent_classification: 'pricing',
    received_at: iso(21, 18, 2),
  }),
  message('msg_3', 2, 0, {
    body: 'Not the right time for us, please follow up in Q1.',
    intent_classification: 'not_interested',
    received_at: iso(21, 10, 47),
  }),
  message('msg_4', 5, 1, {
    body: 'Interesting — let’s set up a call.',
    received_at: iso(20, 15, 20),
  }),
  message('msg_5', 4, 1, {
    subject: 'Out of office',
    body: 'I am currently out of office, back on Monday.',
    intent_classification: 'auto_reply',
    received_at: iso(19, 8, 33),
  }),
];

/** Outbound counterparts, so per-campaign sent/opened counts are derivable. */
export const fixtureSentMail: EmailMessage[] = fixtureLeads.slice(0, 5).map((source, index) =>
  message(`sent_${index}`, index, index % 2, {
    direction: 'outbound',
    status: 'sent',
    subject: fixtureCampaigns[index % 2].name,
    body: 'Hi — sharing how we structure allocations for founder-led funds.',
    intent_classification: null,
    open_count: index < 3 ? 1 : 0,
    opened_at: index < 3 ? iso(19, 12) : null,
    sent_at: iso(18, 10),
    received_at: null,
  }),
);

function meeting(
  id: string,
  title: string,
  leadIndex: number,
  startsAt: string,
  status: Meeting['status'],
  notes: string,
): Meeting {
  const source = fixtureLeads[leadIndex];
  return {
    id,
    workspace_id: WORKSPACE_ID,
    lead_id: source.id,
    call_id: null,
    call_outcome_id: null,
    provider: 'google_calendar',
    external_id: null,
    status,
    title,
    invitee_name: source.full_name,
    invitee_email: source.email,
    invitee_phone: source.phone,
    booking_url: null,
    meeting_url: 'https://meet.google.com/preview',
    starts_at: startsAt,
    ends_at: null,
    timezone: 'Asia/Singapore',
    notes,
    created_at: iso(18),
    leads: {
      full_name: source.full_name,
      company_name: source.company_name,
      email: source.email,
      phone: source.phone,
    },
  };
}

export const fixtureMeetings: Meeting[] = [
  meeting('mtg_1', 'Intro call — Meridian Capital', 0, iso(24, 2, 0), 'scheduled',
    'Booked from the Q3 Investor Outreach thread. Wants the fund one-pager beforehand — not sent yet.'),
  meeting('mtg_2', 'Track record review', 5, iso(26, 6, 30), 'scheduled',
    'She asked for the call. Bring the track record deck; she flagged fee structure as her main question.'),
  meeting('mtg_3', 'Discovery — Northpoint', 1, iso(28, 3, 0), 'requested',
    'Time proposed, not yet accepted. Reminder goes out Aug 26 if there is no answer.'),
  meeting('mtg_4', 'Mandate follow-up', 4, iso(31, 1, 0), 'scheduled',
    'Rescheduled from Aug 21 at his request. Second meeting — first covered the mandate.'),
];

/**
 * The states the mockup never depicts. Each preview section renders against
 * these as well as the populated set above.
 */
export const emptyState = {
  workspace: fixtureWorkspace,
  smtpAccount: null,
  campaigns: [] as Campaign[],
  leads: [] as Lead[],
  inbox: [] as EmailMessage[],
  meetings: [] as Meeting[],
};
