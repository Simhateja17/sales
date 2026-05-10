'use client';
import { useState } from 'react';

type Page = 'dashboard' | 'leads' | 'calls' | 'meetings' | 'analytics' | 'settings' | 'billing' | 'team';
type SettingsPanel = 'identity' | 'voice' | 'script' | 'schedule' | 'compliance';

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('identity');
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [selectedRole, setSelectedRole] = useState(0);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const today = new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const calMeetings = [7, 8, 9, 12, 14, 19, 21, 26];
  const calDays: Array<{ d: number; cls: string }> = [];
  for (let i = 1; i <= 4; i++) calDays.push({ d: 28 + i, cls: 'dim' });
  for (let d = 1; d <= 31; d++) {
    const cls = d === 7 ? 'today' : calMeetings.includes(d) ? 'has-mtg' : '';
    calDays.push({ d, cls });
  }

  return (
    <div className="screen active" id="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <div className="sb-mark">B</div>
            <div>
              <div className="sb-name">Barsha AI</div>
              <div className="sb-sub">Singapore</div>
            </div>
          </div>
        </div>
        <div className="sb-nav">
          {([
            ['dashboard', 'Overview', <svg key="d" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, null],
            ['leads', 'Leads', <svg key="l" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, '128'],
            ['calls', 'Calls', <svg key="c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, null],
            ['meetings', 'Meetings', <svg key="m" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, null],
            ['analytics', 'Analytics', <svg key="an" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, null],
            ['settings', 'Agent Settings', <svg key="s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, null],
            ['billing', 'Billing', <svg key="b" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, null],
            ['team', 'Team', <svg key="t" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, null],
          ] as [Page, string, React.ReactNode, string | null][]).map(([id, label, icon, badge]) => (
            <div
              key={id}
              className={`nav-item${activePage === id ? ' active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              {icon}{label}
              {badge && <span className="nav-badge">{badge}</span>}
            </div>
          ))}
        </div>
        <div className="agent-pill">
          <div className="ap-lbl">Agent Status</div>
          <div className="ap-row"><span className="ap-dot" /><span className="ap-name-txt">Aria · Active</span></div>
          <div className="ap-num">+65 3159 0284</div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className={`main-content page${activePage === 'dashboard' ? ' active' : ''}`}>
        <div className="dash-topbar">
          <div>
            <div className="dash-greeting">Good morning, <em>your business</em></div>
            <div className="dash-date">{today}</div>
          </div>
          <div className="page-actions">
            <button className="btn-outline">Pause Agent</button>
            <button className="btn-primary">+ Add Leads</button>
          </div>
        </div>
        <div className="pdpa-banner">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span><strong>PDPA Compliance Active</strong> — Your agent respects Singapore&apos;s Personal Data Protection Act and identifies as AI when asked.</span>
        </div>
        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-icon ki-p">📞</div><div className="kpi-val">142</div><div className="kpi-lbl">Calls Today</div><div className="kpi-delta kd-up">↑ 18 vs yesterday</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-g">🤝</div><div className="kpi-val">23</div><div className="kpi-lbl">Meetings Booked</div><div className="kpi-delta kd-up">↑ 4 this week</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-gr">✅</div><div className="kpi-val">16.2%</div><div className="kpi-lbl">Conversion Rate</div><div className="kpi-delta kd-up">↑ 2.1%</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-b">👤</div><div className="kpi-val">847</div><div className="kpi-lbl">Leads in Pipeline</div><div className="kpi-delta kd-neutral">⬤ 128 new today</div></div>
        </div>
        <div className="dash-grid">
          <div className="card">
            <div className="card-head">
              <div className="card-title"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Today&apos;s Lead Queue</div>
              <span className="card-action" onClick={() => setActivePage('leads')}>View All →</span>
            </div>
            <div className="filters"><div className="chip active">All (128)</div><div className="chip">CEO / Founder</div><div className="chip">VP / Director</div><div className="chip">MRR S$10k+</div></div>
            <table className="data-table">
              <thead><tr><th style={{width:32}}></th><th>Name</th><th>Title</th><th>Company</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td><input type="checkbox" className="cb" defaultChecked /></td><td><div style={{fontWeight:500}}>Wei Lin Tan<div style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>FinTech Solutions SG</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>CEO</span></td><td>FinTech Solutions SG</td><td><span className="badge b-booked"><span className="bdot" />Booked</span></td></tr>
                <tr><td><input type="checkbox" className="cb" defaultChecked /></td><td><div style={{fontWeight:500}}>Priya Nair<div style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>LogiTrack Asia</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>VP Ops</span></td><td>LogiTrack Asia Pte</td><td><span className="badge b-called"><span className="bdot" />Callback</span></td></tr>
                <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>James Koh<div style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>CloudBase SG</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>Founder</span></td><td>CloudBase Singapore</td><td><span className="badge b-new"><span className="bdot" />New</span></td></tr>
                <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>Siti Rahman<div style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>MediCare Plus</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>Director</span></td><td>MediCare Plus Asia</td><td><span className="badge b-new"><span className="bdot" />New</span></td></tr>
                <tr><td><input type="checkbox" className="cb" defaultChecked /></td><td><div style={{fontWeight:500}}>Mei Ling Chen<div style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>EdTech Ventures SG</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>VP Growth</span></td><td>EdTech Ventures SG</td><td><span className="badge b-interested"><span className="bdot" />Interested</span></td></tr>
              </tbody>
            </table>
            <div style={{padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--cream-dark)'}}><span style={{fontSize:12,color:'var(--text-muted)'}}>3 leads selected</span><button className="btn-primary" style={{padding:'8px 16px',fontSize:12}}>📞 Call Selected</button></div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div className="card">
              <div className="card-head"><div className="card-title"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>Live Call Feed</div><span className="card-action" onClick={() => setActivePage('calls')}>All →</span></div>
              <div>
                <div className="mtr"><div className="mtr-av">WL</div><div className="mtr-info"><div className="mtr-name">Wei Lin Tan</div><div className="mtr-detail">CEO · FinTech · 4m 32s</div><span className="ot ot-b">Meeting Booked</span></div><div className="mtr-time">2m ago</div></div>
                <div className="mtr"><div className="mtr-av">PN</div><div className="mtr-info"><div className="mtr-name">Priya Nair</div><div className="mtr-detail">VP Ops · LogiTrack · 2m 14s</div><span className="ot ot-f">Follow Up</span></div><div className="mtr-time">11m ago</div></div>
                <div className="mtr"><div className="mtr-av">ML</div><div className="mtr-info"><div className="mtr-name">Mei Ling Chen</div><div className="mtr-detail">VP Growth · EdTech · 6m 08s</div><span className="ot ot-b">Meeting Booked</span></div><div className="mtr-time">38m ago</div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Pipeline</div></div>
              <div className="pipe-wrap">
                <div className="pipe-stage"><div className="pipe-row"><span className="pipe-lbl">Contacted</span><span className="pipe-cnt">847</span></div><div className="pipe-bar"><div className="pipe-fill pf-c" style={{width:'100%'}} /></div></div>
                <div className="pipe-stage"><div className="pipe-row"><span className="pipe-lbl">Interested</span><span className="pipe-cnt">186</span></div><div className="pipe-bar"><div className="pipe-fill pf-i" style={{width:'22%'}} /></div></div>
                <div className="pipe-stage"><div className="pipe-row"><span className="pipe-lbl">Meeting Booked</span><span className="pipe-cnt">23</span></div><div className="pipe-bar"><div className="pipe-fill pf-b" style={{width:'3%'}} /></div></div>
              </div>
              <div className="msl-list">
                <div className="msl-row"><span className="msl-lbl">Avg Call Duration</span><span className="msl-val">3m 12s</span></div>
                <div className="msl-row"><span className="msl-lbl">Best Title</span><span className="msl-val" style={{color:'var(--purple)'}}>CEO / Founder</span></div>
                <div className="msl-row"><span className="msl-lbl">Twilio Number</span><span className="msl-val" style={{color:'var(--gold)'}}>+65 3159 0284</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEADS */}
      <div className={`main-content page${activePage === 'leads' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Leads</div><div className="page-sub">Apollo · 847 contacts in pipeline</div></div><div className="page-actions"><button className="btn-outline">Export</button><button className="btn-primary">+ Pull Fresh Leads</button></div></div>
        <div style={{display:'flex',gap:12,marginBottom:18,alignItems:'center',flexWrap:'wrap' as const}}>
          <div className="search-bar" style={{flex:1,maxWidth:300}}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input placeholder="Search leads..." type="text" /></div>
          <div className="chip active">All</div><div className="chip">New</div><div className="chip">Called</div><div className="chip">Interested</div><div className="chip">Booked</div>
        </div>
        <div className="card">
          <table className="data-table">
            <thead><tr><th style={{width:32}}></th><th>Name</th><th>Title</th><th>Company</th><th>Location</th><th>Est. MRR</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr><td><input type="checkbox" className="cb" defaultChecked /></td><td><div style={{fontWeight:500}}>Wei Lin Tan<div style={{fontSize:11,color:'var(--text-muted)'}}>wltan@fintechsg.com</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>CEO</span></td><td>FinTech Solutions SG</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--purple)'}}>S$48k</td><td><span className="badge b-booked"><span className="bdot" />Booked</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
              <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>Priya Nair<div style={{fontSize:11,color:'var(--text-muted)'}}>p.nair@logitrack.sg</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>VP Ops</span></td><td>LogiTrack Asia Pte</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--purple)'}}>S$22k</td><td><span className="badge b-called"><span className="bdot" />Callback</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
              <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>James Koh<div style={{fontSize:11,color:'var(--text-muted)'}}>james@cloudbase.sg</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>Founder</span></td><td>CloudBase Singapore</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--gold)'}}>S$9k</td><td><span className="badge b-new"><span className="bdot" />New</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
              <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>Siti Rahman<div style={{fontSize:11,color:'var(--text-muted)'}}>s.rahman@medicare.sg</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>Director</span></td><td>MediCare Plus Asia</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--purple)'}}>S$31k</td><td><span className="badge b-new"><span className="bdot" />New</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
              <tr><td><input type="checkbox" className="cb" /></td><td><div style={{fontWeight:500}}>David Lim<div style={{fontSize:11,color:'var(--text-muted)'}}>dlim@proptechsg.com</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>CEO</span></td><td>PropTech Singapore</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--purple)'}}>S$15k</td><td><span className="badge b-noanswer"><span className="bdot" />No Answer</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
              <tr><td><input type="checkbox" className="cb" defaultChecked /></td><td><div style={{fontWeight:500}}>Mei Ling Chen<div style={{fontSize:11,color:'var(--text-muted)'}}>ml@edtechventures.sg</div></div></td><td><span className="badge b-interested" style={{fontSize:10}}>VP Growth</span></td><td>EdTech Ventures SG</td><td>Singapore</td><td style={{fontSize:11,fontWeight:600,color:'var(--purple)'}}>S$18k</td><td><span className="badge b-interested"><span className="bdot" />Interested</span></td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>View</button></td></tr>
            </tbody>
          </table>
          <div style={{padding:'13px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--cream-dark)'}}><span style={{fontSize:12,color:'var(--text-muted)'}}>Showing 6 of 847</span><div style={{display:'flex',gap:8}}><button className="btn-outline" style={{padding:'6px 14px',fontSize:11}}>← Prev</button><button className="btn-outline" style={{padding:'6px 14px',fontSize:11}}>Next →</button></div></div>
        </div>
      </div>

      {/* CALLS */}
      <div className={`main-content page${activePage === 'calls' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Call History</div><div className="page-sub">142 calls today · 894 this month</div></div><div className="page-actions"><div className="chip active">All</div><div className="chip">Booked</div><div className="chip">Follow Up</div><div className="chip">No Answer</div></div></div>
        {[
          { av: 'WL', name: 'Wei Lin Tan', detail: 'CEO · FinTech Solutions SG · May 7, 2026 · 9:14 AM SGT', badge: 'b-booked', status: 'Meeting Booked', dur: '4m 32s', time: '2m ago' },
          { av: 'PN', name: 'Priya Nair', detail: 'VP Ops · LogiTrack Asia · May 7, 2026 · 9:02 AM SGT', badge: 'b-called', status: 'Callback Req.', dur: '2m 14s', time: '11m ago' },
          { av: 'ML', name: 'Mei Ling Chen', detail: 'VP Growth · EdTech Ventures · May 7, 2026 · 8:30 AM SGT', badge: 'b-booked', status: 'Meeting Booked', dur: '6m 08s', time: '38m ago' },
          { av: 'JK', name: 'James Koh', detail: 'Founder · CloudBase Singapore · May 7, 2026 · 8:14 AM SGT', badge: 'b-noanswer', status: 'No Answer', dur: '0m 42s', time: '52m ago' },
          { av: 'DL', name: 'David Lim', detail: 'CEO · PropTech Singapore · May 6, 2026 · 3:45 PM SGT', badge: 'b-interested', status: 'Interested', dur: '5m 21s', time: 'Yesterday' },
        ].map(c => (
          <div key={c.av} className="call-card">
            <div className="call-av">{c.av}</div>
            <div className="call-meta"><div className="call-name">{c.name}</div><div className="call-detail">{c.detail}</div></div>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <span className={`badge ${c.badge}`}><span className="bdot" />{c.status}</span>
              <div className="call-right"><div className="call-dur">{c.dur}</div><div className="call-time-txt">{c.time}</div></div>
              <div className="play-btn"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
          </div>
        ))}
      </div>

      {/* MEETINGS */}
      <div className={`main-content page${activePage === 'meetings' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Meetings</div><div className="page-sub">23 booked this month · 6 this week</div></div><div className="page-actions"><button className="btn-outline">Sync Calendar</button></div></div>
        <div className="mtg-grid">
          <div className="card">
            <div className="cal-hdr"><div className="cal-month">May 2026</div><div className="cal-nav"><button className="cal-nbtn">‹</button><button className="cal-nbtn">›</button></div></div>
            <div className="cal-grid-wrap">
              <div className="cal-daynames">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cdn">{d}</div>)}
              </div>
              <div className="cal-days">
                {calDays.map((d, i) => <div key={i} className={`cal-day${d.cls ? ` ${d.cls}` : ''}`}>{d.d}</div>)}
              </div>
            </div>
          </div>
          <div className="mtg-list">
            <div className="card-head"><div className="card-title">Upcoming Meetings</div></div>
            <div className="mtg-item"><div className="mi-time">TODAY · 2:00 PM SGT</div><div className="mi-name">Wei Lin Tan</div><div className="mi-detail">CEO · FinTech Solutions · 20 min</div><span className="mi-type">Discovery Call</span></div>
            <div className="mtg-item"><div className="mi-time">TODAY · 4:00 PM SGT</div><div className="mi-name">Mei Ling Chen</div><div className="mi-detail">VP Growth · EdTech Ventures · 20 min</div><span className="mi-type">Discovery Call</span></div>
            <div className="mtg-item"><div className="mi-time">MAY 8 · 10:00 AM SGT</div><div className="mi-name">Priya Nair</div><div className="mi-detail">VP Ops · LogiTrack Asia · 30 min</div><span className="mi-type">Product Demo</span></div>
            <div className="mtg-item"><div className="mi-time">MAY 9 · 2:00 PM SGT</div><div className="mi-name">Siti Rahman</div><div className="mi-detail">Director · MediCare Plus · 45 min</div><span className="mi-type">Deep Dive</span></div>
            <div className="mtg-item"><div className="mi-time">MAY 12 · 11:00 AM SGT</div><div className="mi-name">David Lim</div><div className="mi-detail">CEO · PropTech Singapore · 20 min</div><span className="mi-type">Discovery Call</span></div>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className={`main-content page${activePage === 'analytics' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Analytics</div><div className="page-sub">Performance · May 2026</div></div><div className="page-actions"><div className="ptabs">{['7D','30D','90D'].map((p,i) => <button key={p} className={`ptab${analyticsPeriod===i?' active':''}`} onClick={() => setAnalyticsPeriod(i)}>{p}</button>)}</div></div></div>
        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-icon ki-p">📞</div><div className="kpi-val">894</div><div className="kpi-lbl">Total Calls</div><div className="kpi-delta kd-up">↑ 22% MoM</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-g">🤝</div><div className="kpi-val">23</div><div className="kpi-lbl">Meetings Booked</div><div className="kpi-delta kd-up">↑ 35% MoM</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-gr">📊</div><div className="kpi-val">3m 12s</div><div className="kpi-lbl">Avg Duration</div><div className="kpi-delta kd-up">↑ 18s</div></div>
          <div className="kpi-card"><div className="kpi-icon ki-b">🎯</div><div className="kpi-val">16.2%</div><div className="kpi-lbl">Conversion Rate</div><div className="kpi-delta kd-up">↑ 2.1%</div></div>
        </div>
        <div className="an-grid">
          <div className="card">
            <div className="card-head"><div className="card-title">Daily Calls — Last 7 Days</div></div>
            <div className="chart-wrap">
              <div className="bar-chart">
                {[{v:96,h:60,l:'Mon'},{v:120,h:75,l:'Tue'},{v:80,h:50,l:'Wed'},{v:144,h:90,l:'Thu'},{v:128,h:80,l:'Fri'},{v:48,h:30,l:'Sat'},{v:142,h:100,l:'Today',hi:true}].map(b => (
                  <div key={b.l} className="bar-col">
                    <div className="bar" style={{height:`${b.h}%`,...(b.hi?{background:'var(--purple-pale)',boxShadow:'0 0 12px rgba(107,79,160,.2)'}:{})}} />
                    <span className="bar-val" style={b.hi?{color:'var(--purple)'}:{}}>{b.v}</span>
                    <span className="bar-lbl">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Outcome Breakdown</div></div>
            <div className="donut-wrap">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="40" fill="none" stroke="var(--cream-dark)" strokeWidth="18"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#6B4FA0" strokeWidth="18" strokeDasharray="41 211" strokeDashoffset="0" transform="rotate(-90 55 55)"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#C9A84C" strokeWidth="18" strokeDasharray="55 197" strokeDashoffset="-41" transform="rotate(-90 55 55)"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#6366F1" strokeWidth="18" strokeDasharray="95 157" strokeDashoffset="-96" transform="rotate(-90 55 55)"/>
                <text x="55" y="59" textAnchor="middle" fill="var(--purple)" fontSize="12" fontFamily="DM Sans" fontWeight="600">16.2%</text>
              </svg>
              <div>
                <div className="dl-item"><div className="dl-dot" style={{background:'#6B4FA0'}} /><span className="dl-lbl">Booked</span><span className="dl-val">16.2%</span></div>
                <div className="dl-item"><div className="dl-dot" style={{background:'#C9A84C'}} /><span className="dl-lbl">Follow Up</span><span className="dl-val">21.8%</span></div>
                <div className="dl-item"><div className="dl-dot" style={{background:'#6366F1'}} /><span className="dl-lbl">No Answer</span><span className="dl-val">37.7%</span></div>
                <div className="dl-item"><div className="dl-dot" style={{background:'var(--cream-dark)'}} /><span className="dl-lbl">Not Interested</span><span className="dl-val">24.3%</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="an-grid3">
          <div className="card"><div className="card-head"><div className="card-title">Top Converting Titles</div></div><div style={{padding:'16px 20px'}}><div className="stat-row"><span className="stat-name">CEO / Founder</span><span className="stat-num p">19.4%</span></div><div className="stat-row"><span className="stat-name">MD / Director</span><span className="stat-num">16.2%</span></div><div className="stat-row"><span className="stat-name">VP of Growth</span><span className="stat-num">13.8%</span></div><div className="stat-row"><span className="stat-name">Head of Ops</span><span className="stat-num">11.1%</span></div><div className="stat-row"><span className="stat-name">GM / Owner</span><span className="stat-num">8.4%</span></div></div></div>
          <div className="card"><div className="card-head"><div className="card-title">Top Industries</div></div><div style={{padding:'16px 20px'}}><div className="stat-row"><span className="stat-name">FinTech / Finance</span><span className="stat-num p">28%</span></div><div className="stat-row"><span className="stat-name">Logistics / Supply</span><span className="stat-num">21%</span></div><div className="stat-row"><span className="stat-name">Healthcare / Med</span><span className="stat-num">17%</span></div><div className="stat-row"><span className="stat-name">EdTech / Learning</span><span className="stat-num">14%</span></div><div className="stat-row"><span className="stat-name">PropTech / Real Estate</span><span className="stat-num">11%</span></div></div></div>
          <div className="card"><div className="card-head"><div className="card-title">Best Call Hours (SGT)</div></div><div style={{padding:'16px 20px'}}><div className="stat-row"><span className="stat-name">9:00 – 10:00 AM</span><span className="stat-num p">24%</span></div><div className="stat-row"><span className="stat-name">10:00 – 11:00 AM</span><span className="stat-num">20%</span></div><div className="stat-row"><span className="stat-name">2:00 – 3:00 PM</span><span className="stat-num">18%</span></div><div className="stat-row"><span className="stat-name">3:00 – 4:00 PM</span><span className="stat-num">14%</span></div><div className="stat-row"><span className="stat-name">11:00 AM – 12:00</span><span className="stat-num">12%</span></div></div></div>
        </div>
      </div>

      {/* AGENT SETTINGS */}
      <div className={`main-content page${activePage === 'settings' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Agent Settings</div><div className="page-sub">Configure · Aria · Singapore</div></div></div>
        <div className="set-grid">
          <div className="set-nav">
            {([
              ['identity', 'Identity', <svg key="i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>],
              ['voice', 'Voice & Tone', <svg key="v" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>],
              ['script', 'Call Script', <svg key="s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>],
              ['schedule', 'Schedule', <svg key="sc" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ['compliance', 'Compliance', <svg key="c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>],
            ] as [SettingsPanel, string, React.ReactNode][]).map(([id, label, icon]) => (
              <div key={id} className={`sn-item${settingsPanel === id ? ' active' : ''}`} onClick={() => setSettingsPanel(id)}>
                {icon}{label}
              </div>
            ))}
          </div>
          <div>
            {settingsPanel === 'identity' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Agent Name</div><div className="sf-hint">How your agent introduces itself on every call.</div><input className="sf-inp" type="text" defaultValue="Aria" /></div>
                <div className="sf"><div className="sf-lbl">Company Name</div><input className="sf-inp" type="text" defaultValue="Your Company Pte Ltd" /></div>
                <div className="sf"><div className="sf-lbl">Value Proposition</div><div className="sf-hint">The single most powerful statement your agent leads with on calls.</div><textarea className="sf-ta" defaultValue="We help Singapore SMEs automate their sales outreach — our clients typically see 3x more qualified meetings within the first 30 days." /></div>
                <div className="sf"><div className="sf-lbl">Booking Link (Calendly)</div><input className="sf-inp" type="text" defaultValue="https://calendly.com/yourname/discovery" /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'voice' && (
              <div className="set-panel">
                <div className="sf">
                  <div className="sf-lbl">Voice Profile</div>
                  <div className="sf-hint">Choose a Retell AI voice for your agent. Click Preview to hear a sample.</div>
                  <div className="voice-grid">
                    {[{n:'Aria (SG English)',d:'Warm, professional'},{n:'Sophie (AU English)',d:'Friendly, clear'},{n:'James (UK English)',d:'Polished, formal'},{n:'Maya (US English)',d:'Confident, direct'}].map((v,i) => (
                      <div key={i} className={`voice-card${selectedVoice===i?' selected':''}`} onClick={() => setSelectedVoice(i)}>
                        <div className="vc-name">{v.n}</div><div className="vc-desc">{v.d}</div>
                        <div className="vc-play"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Preview</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sf"><div className="sf-lbl">Communication Tone</div><select className="sf-sel"><option>Professional &amp; Warm</option><option>Consultative</option><option>Direct &amp; Bold</option><option>Conversational</option></select></div>
                <div className="sf"><div className="sf-lbl">Speech Speed</div><input type="range" style={{marginTop:8}} min={0.8} max={1.3} step={0.1} defaultValue={1.0} /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'script' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Opening Line</div><textarea className="sf-ta" style={{minHeight:70}} defaultValue="Hi, this is Aria calling from [Your Company] — I'll keep this to under 2 minutes. Is now a good time?" /></div>
                <div className="sf"><div className="sf-lbl">Objection Handling</div><textarea className="sf-ta" defaultValue={"1. Too busy: \"I completely understand — when would be a better 2 minutes for a quick chat?\"\n2. Already have a solution: \"That's great — what would you change about what you're using now?\"\n3. Not in budget: \"Totally fair — most of our clients find this pays for itself within 60 days. Could I send you a quick overview?\""} /></div>
                <div className="sf"><div className="sf-lbl">Closing Statement</div><textarea className="sf-ta" style={{minHeight:70}} defaultValue="I'd love to show you how this could work for your business — can I send you a Calendly link for a quick 20-minute chat?" /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'schedule' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">Calling Hours (SGT)</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:8}}><input className="sf-inp" type="time" defaultValue="09:00" /><input className="sf-inp" type="time" defaultValue="18:00" /></div></div>
                <div className="sf"><div className="sf-lbl">Active Days</div><div style={{display:'flex',gap:8,flexWrap:'wrap' as const,marginTop:8}}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => <div key={d} className={`chip${i<5?' active':''}`}>{d}</div>)}</div></div>
                <div className="sf"><div className="sf-lbl">Maximum Calls Per Day</div><input className="sf-inp" type="number" defaultValue={150} /></div>
                <div className="sf"><div className="sf-lbl">Retry Attempts for No Answer</div><input className="sf-inp" type="number" defaultValue={2} /></div>
                <div className="set-save"><button className="btn-outline">Reset</button><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
            {settingsPanel === 'compliance' && (
              <div className="set-panel">
                <div className="sf"><div className="sf-lbl">PDPA Compliance Settings</div>
                  <div>
                    {[
                      {n:'DND Registry Check',d:"Check Singapore's Do Not Call Registry before every call."},
                      {n:'AI Identity Disclosure',d:'Agent identifies itself as AI if the prospect directly asks.'},
                      {n:'Immediate Opt-Out Logging',d:'If prospect says "remove me" or "don\'t call again", log immediately as DND.'},
                      {n:'Call Recording Consent Notice',d:'Agent informs prospect that the call may be recorded for quality purposes.'},
                    ].map(item => (
                      <div key={item.n} className="tog-switch">
                        <div><div className="ts-name">{item.n}</div><div className="ts-desc">{item.d}</div></div>
                        <label className="ts-ctrl"><input type="checkbox" defaultChecked /><span className="ts-sldr" /></label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="set-save"><button className="btn-primary">Save Changes</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BILLING */}
      <div className={`main-content page${activePage === 'billing' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Billing</div><div className="page-sub">Plan · Usage · Invoice History</div></div></div>
        <div className="bill-grid">
          <div>
            <div className="plan-card">
              <div className="plan-tag">✦ Current Plan</div>
              <div className="plan-name">Growth</div>
              <div className="plan-price">S$349<small>/month</small></div>
              <div style={{marginTop:16}}>
                {['500 calls/month included','1 AI agent (Aria)','Apollo lead integration','PDPA + DND compliance','Singapore Twilio number','Up to 3 team members'].map(f => (
                  <div key={f} className="plan-feat"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:14,height:14,color:'var(--green)'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>{f}</div>
                ))}
              </div>
              <div style={{marginTop:20,display:'flex',gap:10}}><button className="btn-outline" style={{flex:1}}>Cancel Plan</button><button className="btn-primary" style={{flex:1}}>Upgrade to Scale</button></div>
            </div>
            <div className="card" style={{marginBottom:18}}>
              <div className="card-head"><div className="card-title">Usage This Month</div></div>
              <div style={{padding:20}}>
                <div className="usage-wrap"><div className="usage-lbl"><span>Calls Used</span><span>142 / 500</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'28%'}} /></div></div>
                <div className="usage-wrap"><div className="usage-lbl"><span>Leads Pulled</span><span>847 / 2,000</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'42%'}} /></div></div>
                <div className="usage-wrap"><div className="usage-lbl"><span>Meetings Booked</span><span>23 / unlimited</span></div><div className="usage-bar"><div className="usage-fill" style={{width:'100%'}} /></div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Invoice History</div></div>
              {[{plan:'Growth Plan',date:'May 1, 2026',amt:'S$349.00'},{plan:'Growth Plan',date:'Apr 1, 2026',amt:'S$349.00'},{plan:'Starter Plan',date:'Mar 1, 2026',amt:'S$129.00'}].map(inv => (
                <div key={inv.date} className="inv-row">
                  <div><div className="inv-plan">{inv.plan}</div><div className="inv-date">{inv.date}</div></div>
                  <div style={{display:'flex',alignItems:'center',gap:16}}><div className="inv-amt">{inv.amt}</div><span className="inv-status">Paid</span><button className="btn-outline" style={{padding:'4px 12px',fontSize:11}}>PDF</button></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="up-card">
              <div className="up-title">Scale Plan</div>
              <div className="up-price">S$799<small>/mo</small></div>
              <div className="up-sub">For businesses ready to scale their outbound seriously.</div>
              <div style={{marginBottom:18}}>
                {['2,000 calls/month','3 AI agents simultaneously','Unlimited team members','CRM integrations','Priority support','Custom analytics dashboard'].map(f => (
                  <div key={f} className="up-feat"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:12,height:12,color:'var(--green)'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>{f}</div>
                ))}
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}>Upgrade Now →</button>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div className={`main-content page${activePage === 'team' ? ' active' : ''}`}>
        <div className="page-header"><div><div className="page-title">Team</div><div className="page-sub">2 of 3 seats used · Growth Plan</div></div></div>
        <div className="team-grid">
          <div className="card">
            <div className="card-head"><div className="card-title">Team Members</div><span className="card-action">Manage Roles</span></div>
            <table className="data-table">
              <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Permissions</th><th>Last Active</th><th></th></tr></thead>
              <tbody>
                <tr><td><div style={{display:'flex',alignItems:'center',gap:12}}><div className="mem-av" style={{background:'var(--purple-pale)',border:'1.5px solid var(--purple)',color:'var(--purple)'}}>YN</div><div><div className="mem-name">Your Name</div><div className="mem-email">you@yourcompany.sg</div></div></div></td><td><span className="badge b-admin">Admin</span></td><td><span className="badge b-active"><span className="bdot" />Active</span></td><td><div><span className="perm-tag">All Access</span></div></td><td style={{fontSize:11,color:'var(--text-muted)'}}>Now</td><td style={{fontSize:11,color:'var(--text-muted)'}}>Owner</td></tr>
                <tr><td><div style={{display:'flex',alignItems:'center',gap:12}}><div className="mem-av" style={{background:'var(--gold-pale)',border:'1.5px solid var(--gold)',color:'#92670A'}}>KL</div><div><div className="mem-name">Kenny Lau</div><div className="mem-email">kenny@yourcompany.sg</div></div></div></td><td><span className="badge b-member">Member</span></td><td><span className="badge b-active"><span className="bdot" />Active</span></td><td><div><span className="perm-tag">Leads</span><span className="perm-tag">Calls</span><span className="perm-tag">Meetings</span></div></td><td style={{fontSize:11,color:'var(--text-muted)'}}>1h ago</td><td><button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>Edit</button></td></tr>
                <tr><td><div style={{display:'flex',alignItems:'center',gap:12}}><div className="mem-av" style={{background:'var(--cream-dark)',border:'1.5px solid var(--border-dark)',color:'var(--text-muted)'}}>+</div><div><div className="mem-name" style={{color:'var(--text-muted)'}}>Open Seat</div><div className="mem-email">1 seat remaining</div></div></div></td><td>—</td><td><span className="badge b-pending">Available</span></td><td>—</td><td>—</td><td><button className="btn-primary" style={{padding:'5px 14px',fontSize:11}}>Invite</button></td></tr>
              </tbody>
            </table>
          </div>
          <div className="inv-card">
            <div className="ic-title">Invite a teammate</div>
            <div className="ic-sub">Add someone to your Barsha AI workspace. They&apos;ll receive an email invitation.</div>
            <div className="inv-form">
              <input className="sf-inp" type="email" placeholder="colleague@company.sg" />
              <div className="sf-lbl" style={{marginTop:4}}>Select Role</div>
              <div className="role-grid">
                {[{n:'Member',d:'View leads, calls & meetings'},{n:'Admin',d:'Full access including billing'}].map((r,i) => (
                  <div key={r.n} className={`role-opt${selectedRole===i?' selected':''}`} onClick={() => setSelectedRole(i)}>
                    <div className="ro-name">{r.n}</div><div className="ro-desc">{r.d}</div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{justifyContent:'center',marginTop:4}}>Send Invitation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
