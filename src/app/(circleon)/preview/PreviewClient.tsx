'use client';

import { useEffect, useState } from 'react';
import HomeOverview from '../dashboard/_components/HomeOverview';
import { useTheme } from '../dashboard/_lib/theme';
import { initials } from '../dashboard/_lib/ui';
import {
  fixtureCampaigns,
  fixtureInbox,
  fixtureLeads,
  fixtureMeetings,
  fixtureSentMail,
  fixtureSmtpAccount,
  fixtureSmtpDisconnected,
  fixtureWorkspace,
} from '../dashboard/_lib/fixtures';

type DetailKind = 'campaign' | 'lead' | 'message' | 'meeting';
type Detail = { kind: DetailKind; index: number };

/** Preview has no navigation; every callback is inert. */
const noop = () => {};

/* Every token in circleon.css, so a theme change can be eyeballed in one place. */
const TOKEN_GROUPS: Array<[string, string[]]> = [
  ['Surfaces', ['--page-bg', '--surface', '--surface-sunken']],
  ['Lines', ['--border', '--border-soft', '--border-strong']],
  ['Type', ['--text', '--text-muted', '--text-light']],
  ['Purple', ['--purple', '--purple-l', '--purple-pale', '--purple-solid']],
  ['Gold', ['--gold', '--gold-l', '--gold-pale', '--gold-text', '--gold-border']],
  ['Status', ['--green', '--green-pale', '--green-text', '--red', '--red-pale', '--blue', '--blue-pale']],
];

function Swatch({ token }: { token: string }) {
  return (
    <div className="pv-swatch">
      <span className="pv-swatch-chip" style={{ background: `var(${token})` }} />
      <code>{token}</code>
    </div>
  );
}

function Section({ id, title, note, children }: {
  id: string; title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <section className="pv-section" id={id}>
      <div className="pv-section-head">
        <h2>{title}</h2>
        {note ? <p>{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function PreviewClient() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [pill, setPill] = useState('All leads');

  // `?theme=dark` lets a screenshot run pick the theme without driving the
  // toggle first. Preview-only convenience; the dashboard has no such param.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('theme');
    if (requested === 'dark' || requested === 'light') setTheme(requested);
  }, [setTheme]);

  // fixtureInbox now carries outbound drafts too (the overview counts them);
  // the conversation list shows only what actually arrived.
  const conversations = fixtureInbox.filter(m => m.direction === 'inbound');

  const campaign = detail?.kind === 'campaign' ? fixtureCampaigns[detail.index] : null;
  const lead = detail?.kind === 'lead' ? fixtureLeads[detail.index] : null;
  const message = detail?.kind === 'message' ? conversations[detail.index] : null;
  const meeting = detail?.kind === 'meeting' ? fixtureMeetings[detail.index] : null;

  // Derived exactly the way the real campaign drawer will: group messages by
  // campaign_id rather than expecting counters from the API.
  function campaignStats(campaignId: string) {
    const sent = fixtureSentMail.filter(m => m.campaign_id === campaignId);
    const replies = fixtureInbox.filter(m => m.campaign_id === campaignId && m.direction === 'inbound');
    const leadsInCampaign = fixtureLeads.filter(l => l.lifecycle_status === 'selected_for_campaign');
    return {
      sent: sent.length,
      opened: sent.filter(m => m.open_count > 0).length,
      replied: replies.length,
      leads: leadsInCampaign.length,
    };
  }

  return (
    <div className="pv-root">
      <header className="pv-bar">
        <div>
          <strong>Dashboard reskin preview</strong>
          <span>Fixtures only — no backend. This route 404s in production.</span>
        </div>
        <button type="button" className="rs-pill is-active" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <Section id="tokens" title="Tokens" note="Toggle the theme above; every swatch below should stay legible.">
        <div className="pv-token-grid">
          {TOKEN_GROUPS.map(([group, tokens]) => (
            <div key={group}>
              <div className="dd-label">{group}</div>
              {tokens.map(token => <Swatch key={token} token={token} />)}
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="overview"
        title="Overview page"
        note="The real HomeOverview component, rendered against fixtures — populated, then with nothing set up yet."
      >
        <div className="pv-frame">
          <HomeOverview
            workspace={fixtureWorkspace}
            campaigns={fixtureCampaigns}
            emailLeads={fixtureLeads.filter(l => l.email)}
            inbox={fixtureInbox}
            meetings={fixtureMeetings}
            smtpAccount={fixtureSmtpAccount}
            onCreateCampaign={noop}
            onOpenCampaigns={noop}
            onOpenLeads={noop}
            onOpenInbox={noop}
            onOpenSettings={noop}
          />
        </div>
        <div className="pv-frame" style={{ marginTop: 16 }}>
          <HomeOverview
            workspace={fixtureWorkspace}
            campaigns={[]}
            emailLeads={[]}
            inbox={[]}
            meetings={[]}
            smtpAccount={null}
            onCreateCampaign={noop}
            onOpenCampaigns={noop}
            onOpenLeads={noop}
            onOpenInbox={noop}
            onOpenSettings={noop}
          />
        </div>
      </Section>

      <Section id="header" title="Page header" note="page-kicker previously had no rule at all and rendered as body text.">
        <div className="page-header">
          <div>
            <div className="page-kicker">Outbound workspace</div>
            <h2 className="page-title">Campaigns with a review gate</h2>
            <p className="page-sub">
              Build the audience and sequence together, review every generated email, then launch only what you approve.
            </p>
          </div>
          <button type="button" className="btn-primary">New campaign</button>
        </div>
      </Section>

      <Section id="metrics" title="Metrics">
        <div className="rs-metrics">
          <div className="rs-metric"><strong>{fixtureLeads.length}</strong><span>Verified work emails</span></div>
          <div className="rs-metric"><strong>2</strong><span>Ready for review</span></div>
          <div className="rs-metric"><strong>2</strong><span>Need attention</span></div>
        </div>
      </Section>

      <Section id="pills" title="Filter pills">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All leads', 'Ready', 'In campaign', 'Needs attention'].map(label => (
            <button
              key={label}
              type="button"
              className={`rs-pill${pill === label ? ' is-active' : ''}`}
              onClick={() => setPill(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section id="rows" title="Rows and detail drawer" note="Click any row to open the shared drawer.">
        <div className="rs-card">
          <div className="rs-card-head">
            <div className="rs-card-title">Campaign list</div>
            <span className="rs-card-meta">{fixtureCampaigns.length} campaigns</span>
          </div>
          {fixtureCampaigns.map((c, index) => (
            <button key={c.id} type="button" className="rs-row" onClick={() => setDetail({ kind: 'campaign', index })}>
              <span className="rs-avatar">{initials(c.name)}</span>
              <span className="rs-row-main">
                <span className="rs-row-name">{c.name}</span>
                <span className="rs-row-detail">
                  {c.daily_send_cap}/day · {c.sending_hours_start}–{c.sending_hours_end}
                </span>
              </span>
              <span className={`badge ${c.status === 'active' ? 'b-booked' : c.status === 'draft' ? 'b-pending' : 'b-noanswer'}`}>
                <span className="bdot" />{c.status}
              </span>
              <span className="rs-open">Open <i>→</i></span>
            </button>
          ))}
        </div>

        <div className="rs-card" style={{ marginTop: 16 }}>
          <div className="rs-card-head">
            <div className="rs-card-title">Leads</div>
            <span className="rs-card-meta">{fixtureLeads.length} leads</span>
          </div>
          {fixtureLeads.map((l, index) => (
            <button key={l.id} type="button" className="rs-row" onClick={() => setDetail({ kind: 'lead', index })}>
              <span className="rs-avatar">{initials(l.full_name)}</span>
              <span className="rs-row-main">
                <span className="rs-row-name">{l.full_name}</span>
                <span className="rs-row-detail">{l.title} · {l.company_name}</span>
              </span>
              <span className="rs-open">Open <i>→</i></span>
            </button>
          ))}
        </div>

        <div className="rs-card" style={{ marginTop: 16 }}>
          <div className="rs-card-head">
            <div className="rs-card-title">Conversations</div>
            <span className="rs-card-meta">{conversations.length} conversations</span>
          </div>
          {conversations.map((m, index) => (
            <button key={m.id} type="button" className="rs-row" onClick={() => setDetail({ kind: 'message', index })}>
              <span className="rs-avatar">{initials(m.leads?.full_name)}</span>
              <span className="rs-row-main">
                <span className="rs-row-name">{m.leads?.full_name}</span>
                <span className="rs-row-detail">{m.subject}</span>
              </span>
              <span className="rs-open">Open <i>→</i></span>
            </button>
          ))}
        </div>

        <div className="rs-card" style={{ marginTop: 16 }}>
          <div className="rs-card-head">
            <div className="rs-card-title">Meetings</div>
            <span className="rs-card-meta">{fixtureMeetings.length} meetings</span>
          </div>
          {fixtureMeetings.map((m, index) => (
            <button key={m.id} type="button" className="rs-row" onClick={() => setDetail({ kind: 'meeting', index })}>
              <span className="rs-avatar">{initials(m.invitee_name)}</span>
              <span className="rs-row-main">
                <span className="rs-row-name">{m.title}</span>
                <span className="rs-row-detail">{m.invitee_name} · {m.status}</span>
              </span>
              <span className="rs-open">Open <i>→</i></span>
            </button>
          ))}
        </div>
      </Section>

      <Section id="states" title="States the mockup never showed" note="Empty, loading and error, in both themes.">
        <div className="pv-state-grid">
          <div className="rs-card">
            <div className="rs-card-head"><div className="rs-card-title">Empty</div></div>
            <div className="rs-card-body sf-hint">No campaigns yet. Create one to start sending.</div>
          </div>
          <div className="rs-card">
            <div className="rs-card-head"><div className="rs-card-title">Loading</div></div>
            <div className="rs-card-body">
              {[0, 1, 2].map(i => <div key={i} className="pv-skeleton" />)}
            </div>
          </div>
          <div className="rs-card">
            <div className="rs-card-head"><div className="rs-card-title">Error</div></div>
            <div className="rs-card-body">
              <div className="import-progress failed" style={{ padding: 14, borderRadius: 10, border: '1px solid var(--red-border)', background: 'var(--red-pale)', color: 'var(--red-text)', fontSize: 12 }}>
                Could not reach the mailbox. Authentication failed (535).
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="mailbox" title="Sidebar mailbox pill" note="Connected and disconnected — the mockup hardcoded the green dot.">
        <div className="pv-state-grid">
          {[fixtureSmtpAccount, fixtureSmtpDisconnected].map(account => (
            <div className="agent-pill" key={account.status} style={{ margin: 0 }}>
              <div className="ap-lbl">Mailbox</div>
              <div className="ap-row">
                <span className="ap-dot" style={{ background: account.status === 'connected' ? undefined : 'var(--text-light)' }} />
                <div>
                  <div className="ap-name-txt">{account.from_email}</div>
                  <div className="ap-num">{fixtureWorkspace.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {detail ? (
        <div className="detail-drawer-overlay" role="presentation" onMouseDown={() => setDetail(null)}>
          <aside
            className="detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${detail.kind} detail`}
            onMouseDown={event => event.stopPropagation()}
          >
            <div className="detail-drawer-head">
              <div>
                <p className="detail-drawer-eyebrow">{detail.kind}</p>
                <h3>
                  {campaign?.name ?? lead?.full_name ?? message?.leads?.full_name ?? meeting?.title}
                </h3>
              </div>
              <button type="button" className="detail-drawer-close" aria-label="Close" onClick={() => setDetail(null)}>×</button>
            </div>

            <div className="detail-drawer-body">
              {campaign ? (() => {
                const stats = campaignStats(campaign.id);
                return (
                  <>
                    <div className="dd-section">
                      <div className="dd-label">Performance</div>
                      <div className="dd-stats">
                        <div className="dd-stat"><strong>{stats.sent}</strong><span>Sent</span></div>
                        <div className="dd-stat"><strong>{stats.opened}</strong><span>Opened</span></div>
                        <div className="dd-stat"><strong>{stats.replied}</strong><span>Replied</span></div>
                        <div className="dd-stat"><strong>{stats.leads}</strong><span>Leads</span></div>
                      </div>
                    </div>
                    <div className="dd-section">
                      <div className="dd-label">Sending</div>
                      <div className="dd-rows">
                        <div className="dd-row"><span className="dd-row-label">Daily cap</span><span className="dd-row-value">{campaign.daily_send_cap}</span></div>
                        <div className="dd-row"><span className="dd-row-label">Hours</span><span className="dd-row-value">{campaign.sending_hours_start}–{campaign.sending_hours_end}</span></div>
                        <div className="dd-row"><span className="dd-row-label">Timezone</span><span className="dd-row-value">{campaign.timezone}</span></div>
                        <div className="dd-row"><span className="dd-row-label">Approval</span><span className="dd-row-value">{campaign.require_approval ? 'Required' : 'Automatic'}</span></div>
                      </div>
                    </div>
                    {campaign.attention_required ? (
                      <div className="dd-section">
                        <div className="dd-label">Needs attention</div>
                        <p className="dd-note">{campaign.attention_reason}</p>
                      </div>
                    ) : null}
                  </>
                );
              })() : null}

              {lead ? (
                <>
                  <div className="dd-section">
                    <div className="dd-label">Contact</div>
                    <div className="dd-rows">
                      <div className="dd-row"><span className="dd-row-label">Title</span><span className="dd-row-value">{lead.title}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Company</span><span className="dd-row-value">{lead.company_name}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Email</span><span className="dd-row-value">{lead.email ?? '—'}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Phone</span><span className="dd-row-value">{lead.phone ?? '—'}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Fit score</span><span className="dd-row-value">{lead.fit_score}</span></div>
                    </div>
                  </div>
                  {lead.notes_summary ? (
                    <div className="dd-section">
                      <div className="dd-label">Notes</div>
                      <p className="dd-note">{lead.notes_summary}</p>
                    </div>
                  ) : null}
                </>
              ) : null}

              {message ? (
                <>
                  <div className="dd-section">
                    <div className="dd-label">Thread</div>
                    <p className="dd-note">{message.body}</p>
                  </div>
                  <div className="dd-section">
                    <div className="dd-label">Signals</div>
                    <div className="dd-rows">
                      <div className="dd-row"><span className="dd-row-label">Intent</span><span className="dd-row-value">{message.intent_classification ?? '—'}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Opens</span><span className="dd-row-value">{message.open_count}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Campaign</span><span className="dd-row-value">{message.campaigns?.name}</span></div>
                    </div>
                  </div>
                </>
              ) : null}

              {meeting ? (
                <>
                  <div className="dd-section">
                    <div className="dd-label">Details</div>
                    <div className="dd-rows">
                      <div className="dd-row"><span className="dd-row-label">Invitee</span><span className="dd-row-value">{meeting.invitee_name}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Company</span><span className="dd-row-value">{meeting.leads?.company_name}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Status</span><span className="dd-row-value">{meeting.status}</span></div>
                      <div className="dd-row"><span className="dd-row-label">Timezone</span><span className="dd-row-value">{meeting.timezone}</span></div>
                    </div>
                  </div>
                  {meeting.notes ? (
                    <div className="dd-section">
                      <div className="dd-label">Notes</div>
                      <p className="dd-note">{meeting.notes}</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="detail-drawer-foot">
              <button type="button" className="btn-primary">Primary action</button>
              <button type="button" className="btn-outline" onClick={() => setDetail(null)}>Close</button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
