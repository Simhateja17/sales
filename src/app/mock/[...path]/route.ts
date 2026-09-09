/**
 * Dev-only mock backend for the reskin preview.
 *
 * Run the dev server with NEXT_PUBLIC_API_URL pointed here and the real
 * dashboard renders end to end against the fixtures in
 * (circleon)/dashboard/_lib/fixtures.ts — no login, no production backend:
 *
 *   NEXT_PUBLIC_API_URL=http://localhost:3007/mock npm run dev -- -p 3007
 *
 * Reusing fixtures.ts rather than a second copy means the mock cannot drift
 * from what /preview renders. Returns 404 in production.
 */
import {
  fixtureCampaigns,
  fixtureInbox,
  fixtureLeads,
  fixtureMeetings,
  fixtureSentMail,
  fixtureSmtpAccount,
  fixtureWorkspace,
} from '../../(circleon)/dashboard/_lib/fixtures';

const WS = fixtureWorkspace.id;

const responses: Record<string, unknown> = {
  // subscriptionActive and billing are both required here: without them the
  // dashboard bounces to /plan-select before it renders anything.
  'api/workspace/me': {
    workspace: fixtureWorkspace,
    agentConfig: null,
    subscriptionActive: true,
    billing: {
      workspace_id: WS,
      stripe_customer_id: 'cus_preview',
      stripe_subscription_id: 'sub_preview',
      plan: 'maison',
      subscription_status: 'active',
      current_period_end: null,
      cancel_at_period_end: false,
    },
  },
  'api/leads': { leads: fixtureLeads, followUps: [] },
  'api/campaigns': { campaigns: fixtureCampaigns },
  'api/inbox': { conversations: fixtureInbox },
  'api/inbox/conversations': {
    conversations: fixtureInbox
      .filter(m => m.direction === 'inbound')
      .map(m => {
        const lead = fixtureLeads.find(l => l.id === m.lead_id)!;
        return {
          lead_id: lead.id,
          lead: {
            id: lead.id,
            full_name: lead.full_name,
            company_name: lead.company_name,
            title: lead.title,
            email: lead.email,
            dnc_status: lead.dnc_status,
          },
          latest_message: m,
          latest_inbound_message_id: m.id,
          campaign_name: m.campaigns?.name ?? null,
          message_count: 2,
          last_message_at: m.received_at,
          status: m.intent_classification === 'not_interested' ? 'closed' : 'needs_reply',
          needs_reply: m.intent_classification === null,
          draft_ready: m.intent_classification === 'positive',
          positive_intent: m.intent_classification === 'positive',
          unsubscribed: false,
        };
      }),
  },
  'api/inbox/sent': { messages: fixtureSentMail },
  'api/outcomes/meetings': { meetings: fixtureMeetings },
  'api/emails/smtp/status': { account: fixtureSmtpAccount },
  'api/apollo/imports/latest': { importRun: null },
  'api/apollo/filters': { filters: null },
  'api/billing/status': {
    billing: {
      workspace_id: WS,
      stripe_customer_id: 'cus_preview',
      stripe_subscription_id: 'sub_preview',
      plan: 'maison',
      subscription_status: 'active',
      current_period_end: null,
      cancel_at_period_end: false,
    },
  },
  'api/autopilot/settings': {
    settings: {
      workspace_id: WS,
      enabled: true,
      include_all_launched_campaigns: true,
      campaign_ids: [],
      timezone: 'Asia/Singapore',
      daily_run_time: '09:00',
      workspace_daily_send_cap: 40,
      paused_at: null,
    },
    readiness: {
      mailbox_ready: true,
      launched_campaigns: 2,
      included_campaigns: 2,
      can_enable: true,
    },
  },
  'api/autopilot/runs': { runs: [] },
};

/**
 * Guided tour progress, held in module memory for the life of the dev server.
 * The tour is the one feature here that writes as well as reads, so a static
 * response would make it restart on every step.
 */
let mockTourState = {
  status: 'not_started',
  lastStepId: null as string | null,
  lastStepIndex: 0,
  seenStepIds: [] as string[],
  updatedAt: null as string | null,
};

function resolve(segments: string[]) {
  const key = segments.join('/');
  if (key in responses) return responses[key];
  // Per-campaign preview: /api/campaigns/:id/preview
  if (segments[1] === 'campaigns' && segments[3] === 'preview') {
    const messages = fixtureInbox.filter(
      m => m.campaign_id === segments[2] && m.direction === 'outbound',
    );
    return { messages };
  }
  if (segments[1] === 'campaigns' && segments[3] === 'leads') {
    return { leads: fixtureLeads };
  }
  // /api/inbox/messages/:id/regenerate  and  /approve — both answer with the
  // message, which is what the thread drawer reads.
  if (segments[1] === 'inbox' && segments[2] === 'messages' && segments[4]) {
    const message = fixtureInbox.find(m => m.id === segments[3]) ?? fixtureInbox[0];
    if (segments[4] === 'regenerate') {
      return {
        message: {
          ...message,
          draft_body:
            'Thanks Jonathan — Tuesday or Wednesday afternoon both work on my side. ' +
            'I will send the fund one-pager ahead of the call so you have the numbers in front of you.',
        },
      };
    }
    return { message: { ...message, status: 'approved' } };
  }
  // /api/inbox/conversations/:leadId/draft | /reply
  if (segments[1] === 'inbox' && segments[2] === 'conversations' && segments[4]) {
    const body =
      'Thanks for coming back to me — happy to find a time next week. ' +
      'Would Tuesday or Wednesday afternoon suit?';
    if (segments[4] === 'draft') return { body };
    const source = fixtureInbox.find(m => m.lead_id === segments[3]) ?? fixtureInbox[0];
    return { message: { ...source, direction: 'outbound', status: 'sent', body } };
  }
  // Thread for one lead: /api/inbox/:leadId
  if (segments[1] === 'inbox' && segments.length === 3) {
    const lead = fixtureLeads.find(l => l.id === segments[2]);
    if (lead) {
      const messages = [...fixtureSentMail, ...fixtureInbox]
        .filter(m => m.lead_id === lead.id)
        .sort((a, b) =>
          String(a.sent_at || a.received_at || '').localeCompare(String(b.sent_at || b.received_at || '')),
        );
      return { lead, messages };
    }
  }
  return null;
}

async function handle(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 });
  }
  const { path } = await ctx.params;

  if (path.join('/') === 'api/workspace/tour') {
    if (request.method === 'PATCH') {
      const patch = await request.json().catch(() => ({}));
      const seen = patch.restart
        ? (patch.seenStepIds ?? [])
        : [...new Set([...mockTourState.seenStepIds, ...(patch.seenStepIds ?? [])])];
      mockTourState = { ...mockTourState, ...patch, seenStepIds: seen, updatedAt: new Date().toISOString() };
      delete (mockTourState as Record<string, unknown>).restart;
    }
    return Response.json({ tour: mockTourState });
  }

  const body = resolve(path);
  if (body === null) {
    // Unmapped endpoints answer with an empty success rather than a 401, so an
    // endpoint we forgot never bounces the dashboard to /login mid-screenshot.
    // Logged loudly, because an empty body surfaces later as a confusing
    // "cannot read properties of undefined" rather than an obvious 404.
    console.warn(`[mock] unmapped endpoint: /${path.join('/')} — returning {}`);
    return Response.json({});
  }
  return Response.json(body);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
