import type { Campaign, ConnectedAccount, EmailMessage, Lead, Meeting, Workspace } from '@/lib/api';

type HomeOverviewProps = {
  workspace: Workspace | null;
  campaigns: Campaign[];
  emailLeads: Lead[];
  inbox: EmailMessage[];
  meetings: Meeting[];
  smtpAccount: ConnectedAccount | null;
  onCreateCampaign: () => void;
  onOpenCampaigns: () => void;
  onOpenLeads: () => void;
  onOpenInbox: () => void;
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
  smtpAccount,
  onCreateCampaign,
  onOpenCampaigns,
  onOpenLeads,
  onOpenInbox,
  onOpenSettings,
}: HomeOverviewProps) {
  const activeCampaign = campaigns.find(campaign => campaign.status === 'active') || campaigns.find(campaign => campaign.status === 'ready') || campaigns[0] || null;
  const draftCount = countDrafts(inbox);
  const pendingReplies = inbox.filter(item => item.direction === 'inbound' && !item.intent_classification).length;
  const mailboxReady = smtpAccount?.status === 'connected';
  const leadReady = emailLeads.length > 0;
  const campaignReady = Boolean(activeCampaign);

  return (
    <section className="home-overview" aria-labelledby="home-title">
      <div className="home-intro">
        <div>
          <p className="home-eyeline">{workspace?.name || 'Your workspace'}</p>
          <h1 id="home-title">Good morning.</h1>
          <p>Everything you need to take the next thoughtful step is right here.</p>
        </div>
        <button className="home-primary-action" type="button" onClick={onCreateCampaign}>
          Create campaign <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="home-hero-grid">
        <article className="home-feature-card">
          <div className="home-feature-topline">
            <span>OUTREACH</span>
            <button type="button" onClick={onOpenCampaigns}>View campaigns</button>
          </div>
          <div className="home-feature-copy">
            <p className="home-feature-kicker">{activeCampaign ? activeCampaign.status : 'Start here'}</p>
            <h2>{activeCampaign ? activeCampaign.name : 'Your next campaign begins with verified leads.'}</h2>
            <p>{activeCampaign
              ? `${activeCampaign.daily_send_cap} emails per day, sent only after your approval.`
              : 'Build a short, reviewable sequence. Barsha keeps every send under your control.'}
            </p>
          </div>
          <div className="home-feature-footer">
            <span>{activeCampaign ? `${emailLeads.length} verified email leads available` : `${emailLeads.length} verified leads ready`}</span>
            <button className="home-text-link" type="button" onClick={activeCampaign ? onOpenCampaigns : onOpenLeads}>
              {activeCampaign ? 'Review sequence' : 'View leads'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>

        <div className="home-snapshot-stack">
          <button className="home-snapshot home-snapshot-purple" type="button" onClick={onOpenInbox}>
            <span className="home-snapshot-label">READY TO REVIEW</span>
            <strong>{draftCount}</strong>
            <span>email draft{draftCount === 1 ? '' : 's'}</span>
          </button>
          <button className="home-snapshot home-snapshot-gold" type="button" onClick={onOpenInbox}>
            <span className="home-snapshot-label">INBOX</span>
            <strong>{pendingReplies}</strong>
            <span>reply{pendingReplies === 1 ? '' : 'ies'} to assess</span>
          </button>
          <div className="home-meeting-note">
            <span className="home-meeting-dot" />
            <span>{meetings.length ? `${meetings.length} meeting${meetings.length === 1 ? '' : 's'} on your calendar` : 'No meetings scheduled yet'}</span>
          </div>
        </div>
      </div>

      <div className="home-section-heading">
        <div>
          <h2>Keep the momentum</h2>
          <p>Finish these once, then focus on the conversations.</p>
        </div>
      </div>
      <div className="home-checklist">
        <button className={`home-check-item ${mailboxReady ? 'done' : ''}`} type="button" onClick={onOpenSettings}>
          <span className="home-check-icon">{mailboxReady ? '✓' : '1'}</span>
          <span>
            <strong>{mailboxReady ? 'Mailbox connected' : 'Connect your mailbox'}</strong>
            <small>{mailboxReady ? smtpAccount?.from_email : 'Set the sender your prospects will see.'}</small>
          </span>
          <span className="home-check-action">{mailboxReady ? 'Manage' : 'Connect'} →</span>
        </button>
        <button className={`home-check-item ${leadReady ? 'done' : ''}`} type="button" onClick={onOpenLeads}>
          <span className="home-check-icon">{leadReady ? '✓' : '2'}</span>
          <span>
            <strong>{leadReady ? 'Verified leads are ready' : 'Find verified leads'}</strong>
            <small>{leadReady ? `${emailLeads.length} leads with a verified work email.` : 'Search Apollo or add leads you already know.'}</small>
          </span>
          <span className="home-check-action">{leadReady ? 'View leads' : 'Find leads'} →</span>
        </button>
        <button className={`home-check-item ${campaignReady ? 'done' : ''}`} type="button" onClick={campaignReady ? onOpenCampaigns : onCreateCampaign}>
          <span className="home-check-icon">{campaignReady ? '✓' : '3'}</span>
          <span>
            <strong>{campaignReady ? 'Campaign is ready for review' : 'Create your first campaign'}</strong>
            <small>{campaignReady ? 'Open the sequence, edit each message, then approve what should send.' : 'Choose leads, set the cadence, and draft your first sequence.'}</small>
          </span>
          <span className="home-check-action">{campaignReady ? 'Open' : 'Create'} →</span>
        </button>
      </div>
    </section>
  );
}
