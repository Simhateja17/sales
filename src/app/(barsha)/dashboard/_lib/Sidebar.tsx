'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, type ConnectedAccount, type Workspace } from '@/lib/api';
import { navItems, type Page } from './ui';

export default function Sidebar({
  activePage,
  onNavigate,
  workspace,
  smtpAccount,
  pendingReplies,
  onError,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  workspace: Workspace | null;
  smtpAccount: ConnectedAccount | null;
  pendingReplies: number;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
        <div className="sb-logo">
          <div className="sb-mark">B</div>
          <div>
            <div className="sb-name">Barsha</div>
            <div className="sb-sub">Email sales agent</div>
          </div>
        </div>
      </div>
      <nav className="sb-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
          >
            <span style={{ width: 22, fontSize: 10, fontWeight: 700 }}>{item.marker}</span>
            {item.label}
            {item.id === 'inbox' && pendingReplies > 0 ? <span className="nav-badge">{pendingReplies}</span> : null}
          </button>
        ))}
      </nav>
      <div className="agent-pill">
        <div className="ap-lbl">Mailbox</div>
        <div className="ap-row">
          <span className="ap-dot" style={{ background: smtpAccount?.status === 'connected' ? undefined : '#A89FB5' }} />
          <div>
            <div className="ap-name-txt">{smtpAccount?.from_email || 'Not connected'}</div>
            <div className="ap-num">{workspace?.name || 'Workspace'}</div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="nav-item sb-logout"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
      >
        <span style={{ width: 22, fontSize: 10, fontWeight: 700 }}>Lo</span>
        {loggingOut ? 'Logging out...' : 'Log out'}
      </button>
    </aside>
  );
}
