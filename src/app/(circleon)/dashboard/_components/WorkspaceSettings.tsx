'use client';

import { useEffect, useState } from 'react';
import { billingAction, type AgentConfig, type Workspace, type WorkspaceBilling } from '@/lib/api';
import plans from '@/lib/pricing.json';
import { initials } from '../_lib/ui';
import { planLabel } from '@/lib/planLabel';

type Member = { id: string; email: string; status: string };

function ReadField({ label, value, hint }: { label: string; value?: string | number | null; hint?: string }) {
  return (
    <div className="mb-field">
      <span>{label}</span>
      <div className="st-read">{value || '—'}</div>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

/** Workspace tab: business details from onboarding, the team and booking link. Read-only; targeting is edited in onboarding. */
export default function WorkspaceSettings({ workspace, billing, agentConfig, leadCount, onEditTargeting, onOpenBilling }: {
  workspace: Workspace | null;
  billing: WorkspaceBilling | null;
  agentConfig: AgentConfig | null;
  leadCount: number;
  onEditTargeting: () => void;
  onOpenBilling: () => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    billingAction<{ members: Member[] }>('/team', 'GET').then(data => setMembers(data.members.filter(m => m.status !== 'revoked'))).catch(() => {});
  }, []);
  const plan = plans.find(item => item.id === billing?.plan);

  return (
    <div className="set-panel">
      <h3 className="st-h3">Workspace</h3>
      <p className="st-sub">Your business details, team and booking link.</p>

      <div className="mb-group st-first">
        <h4>Business</h4>
        <div className="mb-grid">
          <ReadField label="Business name" value={workspace?.name} />
          <ReadField label="Plan" value={planLabel(workspace?.plan, 'Not selected')} />
          <ReadField label="Industry" value={agentConfig?.industry} />
          <ReadField label="City" value={agentConfig?.city} />
        </div>
        <div className="mb-grid st-gap"><ReadField label="What you sell" value={agentConfig?.product} hint="Used to personalise every email" /></div>
        <div className="mb-grid st-gap"><ReadField label="Calendar booking link" value={agentConfig?.booking_link} /></div>
        <p className="st-note">{leadCount} verified lead{leadCount === 1 ? '' : 's'} in your workspace. Targeting and email-writing preferences are edited in onboarding.</p>
      </div>

      <div className="mb-group">
        <h4>Team{plan ? ` · ${members.length + 1} of ${plan.seats} seats` : ''}</h4>
        <div className="st-member">
          <span className="st-av">{initials(workspace?.name)}</span>
          <span className="st-member-body"><b>{workspace?.name || 'Workspace'}</b><small>Owner</small></span>
          <span className="st-pill">Owner</span>
        </div>
        {members.map(member => (
          <div className="st-member" key={member.id}>
            <span className="st-av">{initials(member.email.split('@')[0])}</span>
            <span className="st-member-body"><b>{member.email}</b><small style={{ textTransform: 'capitalize' }}>{member.status}</small></span>
            <span className="st-muted">Member</span>
          </div>
        ))}
        <button className="btn-outline" type="button" style={{ marginTop: 12 }} onClick={onOpenBilling}>Invite teammate</button>
      </div>

      <div className="mb-foot">
        <span />
        <div className="mb-actions">
          <button className="btn-outline" type="button" onClick={onOpenBilling}>View billing</button>
          <button className="btn-primary" type="button" onClick={onEditTargeting}>Edit targeting</button>
        </div>
      </div>
    </div>
  );
}
