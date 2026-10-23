'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, type ConnectedAccount, type Workspace, type WorkspaceBilling } from '@/lib/api';
import NavIcon from './NavIcon';
import { initials, navGroups, type Page } from './ui';

const TRIAL_DAYS = 7;

/** Whole days left on a trial, or null when the workspace is not trialing. */
function trialDaysLeft(billing: WorkspaceBilling | null | undefined) {
  if (billing?.subscription_status !== 'trialing' || !billing.trial_end) return null;
  return Math.max(0, Math.ceil((new Date(billing.trial_end).getTime() - Date.now()) / 86400000));
}

export default function Sidebar({
  activePage,
  onNavigate,
  workspace,
  billing,
  smtpAccount,
  pendingReplies,
  onError,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  workspace: Workspace | null;
  billing?: WorkspaceBilling | null;
  smtpAccount: ConnectedAccount | null;
  pendingReplies: number;
  /** Kept so existing callers still type-check; the redesigned sidebar has no collapsed state. */
  collapsed?: boolean;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const daysLeft = trialDaysLeft(billing);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      setLoggingOut(false);
      onError?.(error instanceof Error ? error.message : 'Could not log out. Please try again.');
    }
  }

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="sb-mark" aria-hidden="true"><i /></span>
        <div>
          <div className="sb-name">CircleOn</div>
          <div className="sb-sub">AI sales agent</div>
        </div>
      </div>
      <nav className="sb-nav" data-tour="nav" aria-label="App">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="sb-group">{group.label}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={() => (item.id === 'support' ? router.push('/support') : onNavigate(item.id))}
              >
                <NavIcon name={item.id} />
                <span className="nav-label">{item.label}</span>
                {item.id === 'inbox' && pendingReplies > 0 ? <span className="nav-badge">{pendingReplies}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </nav>
      {daysLeft !== null ? (
        <div className="sb-trial">
          <div className="sb-trial-top"><b>Free trial</b><span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span></div>
          <div className="sb-trial-bar"><i style={{ width: `${Math.min(100, Math.max(6, ((TRIAL_DAYS - daysLeft) / TRIAL_DAYS) * 100))}%` }} /></div>
          <button type="button" onClick={() => onNavigate('billing')}>Choose your plan</button>
        </div>
      ) : null}
      <div className="sb-me">
        <span className="sb-avatar" aria-hidden="true">{initials(workspace?.name)}</span>
        <div>
          <b>{workspace?.name || 'Workspace'}</b>
          <small>{smtpAccount?.status === 'connected' ? smtpAccount.from_email : 'No mailbox connected'}</small>
        </div>
        <button type="button" className="sb-logout" onClick={handleLogout} disabled={loggingOut} aria-label={loggingOut ? 'Logging out' : 'Log out'}>
          <NavIcon name="logout" />
        </button>
      </div>
    </aside>
  );
}
