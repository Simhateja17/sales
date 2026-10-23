import type { Campaign, ConnectedAccount, EmailMessage, Lead, Meeting, Workspace } from '@/lib/api';
import { TOUR_GATE_CAMPAIGN, TOUR_GATE_LEADS, TOUR_GATE_MAILBOX, deriveCompletion, primaryCampaign } from '../_lib/tour/completion';

type HomeOverviewProps = {
  workspace: Workspace | null;
  campaigns: Campaign[];
  emailLeads: Lead[];
  inbox: EmailMessage[];
  meetings: Meeting[];
  sentMail?: EmailMessage[];
  smtpAccount: ConnectedAccount | null;
  onCreateCampaign: () => void;
  onOpenCampaigns: () => void;
  onOpenLeads: () => void;
  onOpenInbox: () => void;
  onOpenMeetings?: () => void;
  onOpenSettings: () => void;
};

function countDrafts(messages: EmailMessage[]) {
  return messages.filter(message => message.direction === 'outbound' && ['draft', 'pending_approval'].includes(message.status)).length;
}

export default function HomeOverview({
  workspace,
  campaigns,
  emailLeads,
  inbox,
  meetings,
  sentMail = [],
  smtpAccount,
  onCreateCampaign,
  onOpenCampaigns,
  onOpenLeads,
  onOpenInbox,
  onOpenMeetings = onOpenInbox,
  onOpenSettings,
}: HomeOverviewProps) {
  const activeCampaign = primaryCampaign(campaigns);
  const draftCount = countDrafts(inbox);
  const pendingReplies = inbox.filter(item => item.direction === 'inbound' && !item.intent_classification).length;
  // Shared with the guided tour's gates, so the tour can never unlock a step
  // this checklist still shows as outstanding, or hold one it has ticked.
  const completion = deriveCompletion({ smtpAccount, leads: emailLeads, campaigns });
  const mailboxReady = completion[TOUR_GATE_MAILBOX];
  const leadReady = completion[TOUR_GATE_LEADS];
  const campaignReady = completion[TOUR_GATE_CAMPAIGN];

  const sentCount = sentMail.length;
  const replyCount = inbox.filter(item => item.direction === 'inbound').length;
  const now = Date.now();
  const meetingsThisWeek = meetings.filter(meeting => {
    const at = new Date(meeting.starts_at || meeting.created_at || 0).getTime();
    return at >= now && at <= now + 7 * 86400000;
  }).length;
  const stepsDone = [mailboxReady, leadReady, campaignReady].filter(Boolean).length;
  const activity = recentActivity(inbox, sentMail, meetings);
  const today = new Intl.DateTimeFormat('en-SG', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());

  return (
    <section className="home-overview" aria-labelledby="home-title">
      <div className="home-intro">
        <div>
          <p className="home-eyeline">{today} · {workspace?.name || 'Your workspace'}</p>
          <h1 id="home-title">{greeting()}.</h1>
          <p>Your agents are working. Here is what needs you today.</p>
        </div>
        <button className="home-primary-action" type="button" onClick={onCreateCampaign}>
          Create campaign <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="home-hero-grid">
        <article className="home-feature-card">
          <svg className="home-orbit" viewBox="0 0 300 300" fill="none" aria-hidden="true"><circle cx="150" cy="150" r="70" stroke="#9B7BE0" strokeOpacity=".6" /><circle cx="150" cy="150" r="110" stroke="#9B7BE0" strokeOpacity=".4" /><circle cx="150" cy="150" r="145" stroke="#9B7BE0" strokeOpacity=".2" /><circle cx="220" cy="150" r="6" fill="#DBB557" /></svg>
          <div className="home-feature-topline">
            <span>{activeCampaign ? 'Active campaign' : 'Get started'}</span>
            {activeCampaign ? <span className={`home-live home-live-${activeCampaign.status}`}>{activeCampaign.status === 'active' ? 'Sending' : activeCampaign.status}</span> : null}
          </div>
          <div className="home-feature-copy">
            <h2>{activeCampaign ? activeCampaign.name : 'Your next campaign begins with verified leads.'}</h2>
            <p>{activeCampaign
              ? `${activeCampaign.daily_send_cap} emails a day, sent only after your approval.`
              : 'Build a short, reviewable sequence. CircleOn keeps every send under your control.'}
            </p>
          </div>
          <dl className="home-kpis">
            <div><dd>{emailLeads.length}</dd><dt>Leads</dt></div>
            <div><dd>{sentCount}</dd><dt>Sent</dt></div>
            <div><dd>{replyCount}</dd><dt>Replies</dt></div>
            <div><dd>{meetings.length}</dd><dt>Meetings</dt></div>
          </dl>
          <div className="home-feature-footer">
            <button className="home-white-link" type="button" onClick={activeCampaign ? onOpenCampaigns : onOpenLeads}>
              {activeCampaign ? 'Review sequence' : 'View leads'}
            </button>
            {activeCampaign ? <button className="home-text-link" type="button" onClick={onOpenCampaigns}>View all campaigns <span aria-hidden="true">→</span></button> : null}
          </div>
        </article>

        <div className="home-snapshot-stack">
          <button className="home-snapshot" type="button" onClick={onOpenInbox}>
            <span className="home-snapshot-icon home-icon-purple"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 9h8M8 13h5" /></svg></span>
            <span><strong>{draftCount}</strong><span>Email draft{draftCount === 1 ? '' : 's'} to approve</span></span>
            <span className="home-snapshot-go" aria-hidden="true">→</span>
          </button>
          <button className="home-snapshot" type="button" onClick={onOpenInbox}>
            <span className="home-snapshot-icon home-icon-gold"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5" /></svg></span>
            <span><strong>{pendingReplies}</strong><span>Repl{pendingReplies === 1 ? 'y' : 'ies'} to assess</span></span>
            <span className="home-snapshot-go" aria-hidden="true">→</span>
          </button>
          <button className="home-snapshot" type="button" onClick={onOpenMeetings}>
            <span className="home-snapshot-icon home-icon-green"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg></span>
            <span><strong>{meetingsThisWeek}</strong><span>Meeting{meetingsThisWeek === 1 ? '' : 's'} this week</span></span>
            <span className="home-snapshot-go" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="home-section-heading">
        <div>
          <h2>Get set up</h2>
          <p>Finish these once, then focus on the conversations.</p>
        </div>
        <div className="home-progress"><span>{stepsDone} of 3 done</span><span className="home-progress-bar"><i style={{ width: `${(stepsDone / 3) * 100}%` }} /></span></div>
      </div>
      <div className="home-checklist">
        <button className={`home-check-item ${mailboxReady ? 'done' : ''}`} type="button" onClick={onOpenSettings}>
          <span className="home-check-icon">{mailboxReady ? '✓' : '1'}</span>
          <strong>{mailboxReady ? 'Mailbox connected' : 'Connect your mailbox'}</strong>
          <small>{mailboxReady ? smtpAccount?.from_email : 'Set the sender your prospects will see.'}</small>
          <span className="home-check-action">{mailboxReady ? 'Manage' : 'Connect'} →</span>
        </button>
        <button className={`home-check-item ${leadReady ? 'done' : ''}`} type="button" onClick={onOpenLeads}>
          <span className="home-check-icon">{leadReady ? '✓' : '2'}</span>
          <strong>{leadReady ? 'Leads verified' : 'Find verified leads'}</strong>
          <small>{leadReady ? `${emailLeads.length} leads with a verified work email.` : 'Search our lead database or add leads you already know.'}</small>
          <span className="home-check-action">{leadReady ? 'View leads' : 'Find leads'} →</span>
        </button>
        <button className={`home-check-item ${campaignReady ? 'done' : stepsDone === 2 ? 'now' : ''}`} type="button" onClick={campaignReady ? onOpenCampaigns : onCreateCampaign}>
          <span className="home-check-icon">{campaignReady ? '✓' : '3'}</span>
          <strong>{campaignReady ? 'Approve your sequence' : 'Create your first campaign'}</strong>
          <small>{campaignReady ? 'Open the sequence, edit each message, then approve what should send.' : 'Choose leads, set the cadence, and draft your first sequence.'}</small>
          <span className="home-check-action">{campaignReady ? 'Open' : 'Create'} →</span>
        </button>
      </div>

      {activity.length ? (
        <>
          <div className="home-section-heading"><div><h2>Recent activity</h2></div></div>
          <ul className="home-activity">
            {activity.map(item => (
              <li key={item.key}>
                <span className={`home-activity-dot home-dot-${item.tone}`} />
                <span>{item.text}</span>
                <time dateTime={item.at}>{formatWhen(item.at)}</time>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

type ActivityItem = { key: string; text: string; at: string; tone: 'purple' | 'gold' | 'green' };

/** The last few things that happened, drawn from messages and meetings the page already loaded. */
function recentActivity(inbox: EmailMessage[], sentMail: EmailMessage[], meetings: Meeting[]): ActivityItem[] {
  const who = (message: EmailMessage) => message.leads?.full_name || message.leads?.company_name || 'a lead';
  const items: ActivityItem[] = [
    ...inbox.filter(m => m.direction === 'inbound').map(m => ({ key: `in-${m.id}`, text: `Reply received from ${who(m)}`, at: m.received_at || m.created_at, tone: 'purple' as const })),
    ...sentMail.map(m => ({ key: `out-${m.id}`, text: `Email sent to ${who(m)}`, at: m.sent_at || m.created_at, tone: 'gold' as const })),
    ...meetings.map(m => ({ key: `mt-${m.id}`, text: `Meeting booked: ${m.title}`, at: m.created_at || m.starts_at || '', tone: 'green' as const })),
  ].filter(item => item.at);
  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 4);
}

function formatWhen(value: string) {
  const date = new Date(value);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat('en-SG', sameDay ? { hour: 'numeric', minute: '2-digit' } : { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
