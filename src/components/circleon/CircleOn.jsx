'use client';

// The CircleOn design export as a React component.
//
// The export was authored as a single class with React's exact lifecycle
// (state / setState / componentDidMount / componentDidUpdate /
// componentWillUnmount), so the body below is a verbatim port. The only
// behavioural changes are navigation-related, because the one-file SPA is now
// split across real URLs:
//
//   * `page` is read from props (the route) instead of state
//   * goto() pushes a URL; gotoAndScroll() navigates then scrolls
//   * `theme` is persisted, since the component now remounts on navigation
//
import React, { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { cssToObj } from './cssToObj';
import Ambience from './Ambience';
import Nav from './Nav';
import Footer from './Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import About from './pages/About';
import Safety from './pages/Safety';
import Stories from './pages/Stories';
import Blog from './pages/Blog';
import Help from './pages/Help';
import Pricing from './pages/Pricing';
import { applyTheme, readStoredTheme } from '@/lib/theme';

export const ROUTES = {
  'home': '/',
  'lead-generation': '/lead-generation',
  'voice-agent': '/voice-agent',
  'follow-up': '/follow-up',
  'pricing': '/pricing',
  'about': '/about',
  'safety': '/safety',
  'stories': '/stories',
  'blog': '/blog',
  'help': '/help',
};

// Set by gotoAndScroll() when an anchor on the home page is requested from
// another route; consumed by componentDidMount once the home page renders.
let pendingScroll = null;

const PAGES = {
  'home': Home,
  'lead-generation': Product,
  'voice-agent': Product,
  'follow-up': Product,
  'about': About,
  'safety': Safety,
  'stories': Stories,
  'blog': Blog,
  'help': Help,
  'pricing': Pricing,
};

class CircleOnShell extends React.Component {

  state = { mounted: false, theme: 'light', resourcesOpen: false, form: { name: '', email: '', company: '' }, submitted: false, activeSolution: 'voice-agent', billing: 'monthly', calcLead: true, calcVoice: true, calcFollow: false, calcMinutes: 500, starterPick: 'lead', openFaq: 0, diagramScale: 1, freeLeadsOpen: false, freeLeadsSubmitted: false, freeLeadsForm: { company: '', industry: '', icp: '', email: '' } };
  toggleFaq = (i) => () => this.setState(s => ({ openFaq: s.openFaq === i ? -1 : i }));
  leadStepClick = (i) => () => {
    clearTimeout(this._leadPauseTimer);
    this.setState({ leadActive: i, leadPaused: true });
    this._leadPauseTimer = setTimeout(() => this.setState({ leadPaused: false }), 4200);
  };
  voiceStepClick = (i) => () => {
    clearTimeout(this._voicePauseTimer);
    this.setState({ voiceStep: i, voicePaused: true });
    this._voicePauseTimer = setTimeout(() => this.setState({ voicePaused: false }), 4200);
  };
  followStepClick = (i) => () => {
    clearTimeout(this._followPauseTimer);
    this.setState({ followStep: i, followPaused: true });
    this._followPauseTimer = setTimeout(() => this.setState({ followPaused: false }), 4200);
  };

  componentDidMount() {
    this.setState({ mounted: true });
    // The preference is shared with the dashboard and auth pages, so a choice
    // made anywhere in the product is already stored by the time this mounts.
    this.setState({ theme: readStoredTheme() });
    if (pendingScroll) {
      const id = pendingScroll;
      pendingScroll = null;
      requestAnimationFrame(() => requestAnimationFrame(() => this.scrollTo(id)));
    }
    this.startCounters();
    this._leadTimer = setInterval(() => {
      if (!this.state.leadPaused) this.setState(s => ({ leadActive: ((s.leadActive ?? 0) + 1) % 5 }));
    }, 1900);
    this._voiceTimer = setInterval(() => {
      if (!this.state.voicePaused) this.setState(s => ({ voiceStep: ((s.voiceStep ?? 0) + 1) % 6 }));
    }, 1900);
    this._followTimer = setInterval(() => {
      if (!this.state.followPaused) this.setState(s => ({ followStep: ((s.followStep ?? 0) + 1) % 6 }));
    }, 1900);
  }
  componentWillUnmount() {
    clearInterval(this._leadTimer); clearTimeout(this._leadPauseTimer);
    clearInterval(this._voiceTimer); clearTimeout(this._voicePauseTimer);
    clearInterval(this._followTimer); clearTimeout(this._followPauseTimer);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.page !== 'home' && this.props.page === 'home') {
      window.__coCountStart = Date.now();
      window.__coCountDone = false;
      this._raf = null;
      this.startCounters();
    }
  }
  startCounters = () => {
    if (window.__coCountDone || this._raf) return;
    if (!window.__coCountStart) window.__coCountStart = Date.now();
    const dur = 1400;
    const tick = () => {
      const p = Math.min(1, (Date.now() - window.__coCountStart) / dur);
      if (p < 1) { this._raf = setTimeout(tick, 70); } else { this._raf = null; window.__coCountDone = true; }
      this.setState({ _ctick: Date.now() });
    };
    this._raf = setTimeout(tick, 0);
  };

  setMonthly = () => this.setState({ billing: 'monthly' });
  setAnnual = () => this.setState({ billing: 'annual' });
  toggleTheme = () => this.setState((s) => {
    const theme = s.theme === 'dark' ? 'light' : 'dark';
    // Stamps <html> as well as persisting, so the dashboard, login, signup, and
    // onboarding pages open in the same theme.
    applyTheme(theme);
    return { theme };
  });
  toggleCalc = (key) => this.setState(s => ({ [key]: !s[key] }));
  setCalcMinutes = (e) => this.setState({ calcMinutes: Number(e.target.value) });
  setStarterPick = (k) => this.setState({ starterPick: k });
  solutionOrder = ['lead-generation', 'voice-agent', 'follow-up'];
  setActiveSolution = (id) => this.setState({ activeSolution: id });
  cycleSolution = (dir) => { const o = this.solutionOrder; const i = o.indexOf(this.state.activeSolution); this.setState({ activeSolution: o[(i + dir + o.length) % o.length] }); };

  goto = (page) => {
    this.setState({ resourcesOpen: false });
    this.props.router.push(ROUTES[page] || '/');
  };
  gotoAndScroll = (id) => {
    this.setState({ resourcesOpen: false });
    if (this.props.page === 'home') {
      requestAnimationFrame(() => requestAnimationFrame(() => this.scrollTo(id)));
      return;
    }
    pendingScroll = id;
    this.props.router.push('/');
  };
  scrollTo = (id) => { const el = document.getElementById(id); if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY - 84; window.scrollTo({ top, behavior: 'smooth' }); };
  toggleResources = () => this.setState(s => ({ resourcesOpen: !s.resourcesOpen }));
  onField = (k) => (e) => { const v = e.target.value; this.setState(s => ({ form: { ...s.form, [k]: v } })); };
  submit = (e) => {
    e.preventDefault();
    this.setState({ submitted: true, sendError: null });
    this.send({ kind: 'waitlist', ...this.state.form });
  };
  send = (payload) => {
    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); })
      .catch(() => this.setState({ sendError: true }));
  };

  openFreeLeads = () => this.setState({ freeLeadsOpen: true });
  closeFreeLeads = () => this.setState({ freeLeadsOpen: false });
  onFreeLeadField = (k) => (e) => { const v = e.target.value; this.setState(s => ({ freeLeadsForm: { ...s.freeLeadsForm, [k]: v } })); };
  submitFreeLeads = (e) => {
    e.preventDefault();
    this.setState({ freeLeadsSubmitted: true, sendError: null });
    this.send({ kind: 'free-leads', ...this.state.freeLeadsForm });
  };
  resetFreeLeads = () => this.setState({ freeLeadsSubmitted: false, freeLeadsForm: { company: '', industry: '', icp: '', email: '' } });

  num(arr) { return arr.map((label, i) => ({ n: i + 1, n2: String(i + 1).padStart(2, '0'), label, left: i % 2 === 0, notLeft: i % 2 !== 0 })); }
  voicesData() {
    const raw = [
      { name: 'Maya', tag: 'INBOUND · WARM', warmth: 88, pace: 62, depth: 38, lang: 'en-US', dur: '0:23', a: '#7447C8', b: '#BBACEB', d: '#471E86' },
      { name: 'Priya', tag: 'DISCOVERY · CRISP', warmth: 70, pace: 78, depth: 55, lang: 'en-IN', dur: '0:21', a: '#7447C8', b: '#945FF9', d: '#471E86' },
      { name: 'Anders', tag: 'OUTBOUND · STEADY', warmth: 55, pace: 60, depth: 75, lang: 'en-GB', dur: '0:25', a: '#0065D2', b: '#90BAF1', d: '#00378D' },
      { name: 'Sofía', tag: 'RENEWAL · EMPATHETIC', warmth: 92, pace: 35, depth: 48, lang: 'es-MX', dur: '0:24', a: '#7447C8', b: '#C49E62', d: '#471E86' },
      { name: 'Kenji', tag: 'TECHNICAL · EVEN', warmth: 58, pace: 52, depth: 68, lang: 'ja-JP', dur: '0:19', a: '#0065D2', b: '#7447C8', d: '#00378D' },
      { name: 'Lior', tag: 'OUTBOUND · BRIGHT', warmth: 66, pace: 82, depth: 44, lang: 'en-US', dur: '0:22', a: '#7447C8', b: '#C49E62', d: '#471E86' },
    ];
    return raw.map((v) => ({ ...v, orb: `conic-gradient(from 200deg,${v.a},${v.d},${v.b},${v.a})` }));
  }

  // The score pills carry their own colours, so they need dark variants: the
  // light pink/cream backgrounds stayed put in dark mode while the card's
  // blanket text override repainted the labels pale, leaving them unreadable.
  leadSamplesData(dark) {
    // Carried as --chip-fg rather than `color:` so the card's blanket override,
    // which is !important and would beat any inline colour, cannot reach it.
    const hot = dark ? 'background:#4A2A24;--chip-fg:#F0B7A3' : 'background:#FBE9E4;--chip-fg:#B4522F';
    const warm = dark ? 'background:#453820;--chip-fg:#EBCB79' : 'background:#FCF3DC;--chip-fg:#8A6A16';
    return [
      { initials: 'SC', name: 'Sarah Chen', company: 'Acme Corp', score: 92, tag: 'Hot', pillStyle: hot, delayMs: 600 },
      { initials: 'MW', name: 'Marcus Webb', company: 'Loopline', score: 78, tag: 'Warm', pillStyle: warm, delayMs: 1900 },
      { initials: 'PN', name: 'Priya Nair', company: 'Vantage Systems', score: 95, tag: 'Hot', pillStyle: hot, delayMs: 3200 },
    ];
  }

  freeLeadsResultData() {
    return [];
  }

  numHoriz(arr) { return arr.map((label, i) => ({ n: i + 1, n2: String(i + 1).padStart(2, '0'), label, notLast: i !== arr.length - 1, evenStep: i % 2 === 0, oddStep: i % 2 !== 0, isStep1: i === 0, isStep2: i === 1, isStep3: i === 2, isStep4: i === 3, isStep5: i === 4, isStep6: i === 5, delayMs: i * 700 })); }

  // Editorial typographic workflow columns: a big serif verb, a faint oversized letter
  // watermark behind it, a short description, and a "Read More" link, no connecting line.
  flowSketch(arr) {
    return arr.map((pair, i) => ({
      n2: String(i + 1).padStart(2, '0'),
      word: pair[0], label: pair[1],
      letter: pair[0].charAt(0),
      notLast: i !== arr.length - 1,
      accent: i % 2 === 0 ? '#7447C8' : '#C49E62',
      offsetDown: i % 2 !== 0,
      notOffsetDown: i % 2 === 0,
      delayMs: i * 900,
      isStep1: i === 0, isStep2: i === 1, isStep3: i === 2, isStep4: i === 3, isStep5: i === 4, isStep6: i === 5,
    }));
  }

  // Adds interactive/active-step styling to a flowSketch array: pulsing ring + filled
  // circle for the active step, dimmed for upcoming, checked for completed, click to jump.
  decorateLeadFlow(arr) {
    const active = this.state.leadActive ?? 0;
    const dark = this.state.theme === 'dark';
    return arr.map((s, i) => {
      const isActive = i === active, isDone = i < active;
      return {
        ...s, isActive, isDone,
        onClick: this.leadStepClick(i),
        circleStyle: `width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:16px;cursor:pointer;position:relative;transition:transform .3s,background .3s;background:${isActive ? '#7447C8' : dark ? (isDone ? '#4B3C54' : '#403248') : isDone ? '#E0D6F7' : '#ECE9F6'};transform:${isActive ? 'scale(1.12)' : 'scale(1)'}`,
        ringStyle: isActive ? 'position:absolute;inset:-6px;border-radius:50%;border:2px solid #7447C8;animation:leadRing 1.6s ease-out infinite' : 'display:none',
        iconColorA: isActive ? '#fff' : '#7447C8',
        iconColorB: isActive ? '#fff' : '#C49E62',
        wordStyle: `font-weight:700;font-size:15.5px;margin-bottom:6px;letter-spacing:-.01em;transition:color .3s;color:${dark ? (isActive ? '#E5BB62' : '#FFF8FF') : isActive ? '#471E86' : '#1A172C'}`,
        arrowStyle: `font-size:18px;letter-spacing:-2px;margin:22px 6px 0;flex-shrink:0;transition:color .3s;color:${isDone ? '#7447C8' : dark ? '#806D88' : '#C6C3D6'};position:relative;overflow:hidden`,
      };
    });
  }

  // Generic version of decorateLeadFlow for any flowSketch array + state key + click handler.
  decorateFlow(arr, activeIdx, stepClick) {
    const dark = this.state.theme === 'dark';
    return arr.map((s, i) => {
      const isActive = i === activeIdx, isDone = i < activeIdx;
      return {
        ...s, isActive, isDone,
        onClick: stepClick(i),
        circleStyle: `width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:16px;cursor:pointer;position:relative;transition:transform .3s,background .3s;background:${isActive ? '#7447C8' : dark ? (isDone ? '#4B3C54' : '#403248') : isDone ? '#E0D6F7' : '#ECE9F6'};transform:${isActive ? 'scale(1.12)' : 'scale(1)'}`,
        ringStyle: isActive ? 'position:absolute;inset:-6px;border-radius:50%;border:2px solid #7447C8;animation:leadRing 1.6s ease-out infinite' : 'display:none',
        iconColorA: isActive ? '#fff' : '#7447C8',
        iconColorB: isActive ? '#fff' : '#C49E62',
        wordStyle: `font-weight:700;font-size:15.5px;margin-bottom:6px;letter-spacing:-.01em;transition:color .3s;color:${dark ? (isActive ? '#E5BB62' : '#FFF8FF') : isActive ? '#471E86' : '#1A172C'}`,
        arrowStyle: `font-size:18px;letter-spacing:-2px;margin:22px 6px 0;flex-shrink:0;transition:color .3s;color:${isDone ? '#7447C8' : dark ? '#806D88' : '#C6C3D6'};position:relative;overflow:hidden`,
      };
    });
  }

  // Feature-usage progress bars: horizontal pill tracks filled with an alternating purple/gold brand gradient.
  statsBarBuild(data) {
    const palette = ['#7447C8', '#C49E62', '#9B72E8'];
    const bars = data.bars.map((b, i) => {
      const c = palette[i % palette.length];
      return {
        label: b.label, value: b.value,
        labelColor: c,
        barStyle: `width:${b.value}%;height:100%;border-radius:999px;background-image:radial-gradient(circle at 15% 20%, rgba(255,255,255,.6) 0%, transparent 45%), linear-gradient(90deg, ${c}cc, ${c});box-shadow:0 0 0 1px rgba(255,255,255,.4) inset`,
      };
    });
    return { title: data.title, caption: data.caption, bars };
  }
  // Monthly trend area chart: dotted purple fill under a rising line.
  statsTrendBuild(data) {
    const viewW = 600, viewH = 200;
    const vals = data.points.map((p) => p.value);
    const min = Math.min(...vals) * 0.85, max = Math.max(...vals) * 1.05;
    const n = data.points.length;
    const dots = data.points.map((p, i) => ({
      x: (i / (n - 1)) * viewW,
      y: viewH - ((p.value - min) / (max - min)) * viewH,
    }));
    const lineD = dots.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ');
    const areaD = `${lineD} L ${viewW} ${viewH} L 0 ${viewH} Z`;
    const last = dots[dots.length - 1];
    const lastVal = data.points[data.points.length - 1].value;
    const badgeText = lastVal + '%';
    const badgeW = 30 + badgeText.length * 9;
    const badgeX = Math.min(Math.max(last.x - badgeW / 2, 4), viewW - badgeW - 4);
    const badge = { x: badgeX, y: Math.max(last.y - 42, 4), w: badgeW, text: badgeText, tx: badgeX + badgeW / 2 };
    const gridY = [0.25, 0.5, 0.75].map((f) => viewH * f);
    return { title: data.title, viewW, viewH, lineD, areaD, dots, badge, gridY, months: data.points.map((p) => p.label) };
  }
  numChain(arr) { return arr.map((label, i) => ({ n: i + 1, n2: String(i + 1).padStart(2, '0'), label, notLast: i !== arr.length - 1 })); }

  // Small stroke-icon set (Feather-style) rendered as a React element so section cards read at a glance.
  icon(name) {
    const defs = {
      zap:['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
      clock:['c:12 12 9','M12 7v5l3.5 2'],
      shield:['M12 3 5 6v5c0 4.5 3 7.6 7 8.7 4-1.1 7-4.2 7-8.7V6z','m9 12 2 2 4-4'],
      sync:['M23 4v6h-6','M1 20v-6h6','M3.5 9a9 9 0 0 1 14.9-3.4L23 10','M20.5 15a9 9 0 0 1-14.9 3.4L1 14'],
      cloud:['M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'],
      funnel:['M22 3H2l8 9.5V19l4 2v-8.5L22 3z'],
      bell:['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.7 21a2 2 0 0 1-3.4 0'],
      target:['c:12 12 9','c:12 12 5','c:12 12 1'],
      layers:['M12 2 2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5'],
      rocket:['M12 15l-3-3a20 20 0 0 1 4-6c3-3 6-3 8-3 0 2 0 5-3 8a20 20 0 0 1-6 4z','M9 12H5s.5-3 2-4 4 0 4 0','M12 15v4s3-.5 4-2 0-4 0-4'],
      globe:['c:12 12 9','M3 12h18','M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z'],
      wave:['M4 10v4','M8 6v12','M12 3v18','M16 6v12','M20 10v4'],
      doc:['M14 3H6v18h12V8z','M14 3v5h5','M8 13h8','M8 17h5'],
      route:['c:18 5 3','c:6 12 3','c:18 19 3','M8.6 13.5l6.8 4','M15.4 6.5l-6.8 4'],
      home:['M3 10 12 3l9 7','M5 9v11h14V9'],
      health:['M22 12h-4l-3 8-4-16-3 8H2'],
      wrench:['M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.6-.7-.7-2.6z'],
      monitor:['M3 4h18v13H3z','M8 21h8','M12 17v4'],
      phone:['M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z'],
      calendar:['M4 5h16v16H4z','M4 10h16','M8 3v4','M16 3v4'],
      chat:['M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z'],
      mail:['M3 5h18v14H3z','m3 6 9 7 9-7'],
      message:['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
      inbox:['M22 12h-6l-2 3h-4l-2-3H2','M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z'],
      card:['M2 6h20v12H2z','M2 10h20'],
      dot:['c:12 12 4'],
    };
    const arr = defs[name] || defs.dot;
    const kids = arr.map((s, i) => {
      if (s.slice(0, 2) === 'c:') { const p = s.slice(2).split(' ').map(Number); return React.createElement('circle', { key: i, cx: p[0], cy: p[1], r: p[2] }); }
      return React.createElement('path', { key: i, d: s });
    });
    return React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.35, strokeLinecap: 'round', strokeLinejoin: 'round', style: { filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.45))' } }, ...kids);
  }

  // Turn a product's sections into icon-cards, and any section flagged chart:true into small bar charts.
  buildSections(sections) {
    const accents = [
      ['#fff', 'radial-gradient(circle at 30% 24%,rgba(255,255,255,.72),rgba(255,255,255,0) 26%),radial-gradient(circle at 72% 86%,#2b164f 0%,transparent 55%),conic-gradient(from 210deg at 50% 50%,#471E86,#7447C8,#B9A7E8,#7447C8,#471E86)'],
      ['#fff', 'radial-gradient(circle at 30% 24%,rgba(255,255,255,.72),rgba(255,255,255,0) 26%),radial-gradient(circle at 72% 86%,#5f4310 0%,transparent 55%),conic-gradient(from 210deg at 50% 50%,#8b6730,#C49E62,#F0DCB1,#C49E62,#8b6730)'],
      ['#fff', 'radial-gradient(circle at 30% 24%,rgba(255,255,255,.72),rgba(255,255,255,0) 26%),radial-gradient(circle at 72% 86%,#0d2b62 0%,transparent 55%),conic-gradient(from 210deg at 50% 50%,#174EA6,#2F6FD6,#90BAF1,#2F6FD6,#174EA6)'],
    ];
    return sections.map((sec, si) => {
      const isChart = !!sec.chart;
      const items = (sec.items || []).map((it, i) => {
        const a = accents[(si + i) % 2];
        return { ...it, iconEl: this.icon(it.ic),
          badgeStyle: `width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${a[0]};background:${a[1]};box-shadow:inset 0 2px 0 rgba(255,255,255,.34),inset 0 -14px 22px -10px rgba(0,0,0,.32),0 12px 26px -12px rgba(8,3,12,.7);border:1px solid rgba(255,255,255,.18)` };
      });
      const charts = (sec.chartData || []).map((ch) => ({
        title: ch.title, caption: ch.caption,
        bars: ch.bars.map((b) => ({
          label: b.label, value: b.value, labelColor: b.hi ? '#471E86' : '#716F82',
          fillStyle: b.hi
            ? `width:${b.w}%;height:9px;border-radius:6px;background-color:#7447C8;background-image:radial-gradient(circle,rgba(255,255,255,.6) 1px,transparent 1.5px);background-size:7px 7px`
            : `width:${b.w}%;height:9px;border-radius:6px;background:#BBACEB`,
        })),
      }));
      return { ...sec, isChart, notChart: !isChart, items, charts };
    });
  }

  renderVals() {
    const page = this.props.page;
    const products = {
      'lead-generation': {
        eyebrow: 'Lead Generation',
        title: 'Find and qualify your best leads on autopilot',
        subtitle: 'AI prospecting that discovers, enriches, and scores leads matching your ICP, then routes them to your CRM the instant they\'re ready, while buying intent is still at its peak.',
        features: [
          { title: 'Smart Prospecting', desc: 'Surface companies and contacts that match your ideal customer profile automatically.' },
          { title: 'Data Enrichment', desc: 'Append verified emails, roles, and firmographics to every lead in seconds.' },
          { title: 'AI Lead Scoring', desc: 'Rank prospects by intent and fit so your team works the hottest leads first.' },
          { title: 'Real-time CRM Sync', desc: 'Push qualified leads to HubSpot, Salesforce, or Pipedrive the moment they qualify.' },
        ],
        workflowTitle: 'How Lead Generation Works',
        workflow: [['Identify', 'Identify your target audience'], ['Discover', 'Find qualified prospects that match your ICP'], ['Enrich', 'Enrich contact data with verified details'], ['Score', 'AI lead scoring ranks by intent and fit'], ['Deliver', 'Send qualified leads straight to your CRM']],
        statsBarData: {
          title: 'How teams put Lead Generation to work',
          bars: [
            { label: 'AI lead scoring', value: 95, isUs: true },
            { label: 'CRM sync', value: 88, isUs: true },
            { label: 'ICP enrichment', value: 92, isUs: true },
          ],
          caption: 'Share of active accounts using each capability weekly, based on CircleOn product usage.',
        },
        statsTrendData: {
          title: 'Pipeline value sourced by CircleOn grows every month',
          points: [
            { label: 'Feb', value: 38 }, { label: 'Apr', value: 47 }, { label: 'Jun', value: 55 },
            { label: 'Aug', value: 68 }, { label: 'Oct', value: 79 }, { label: 'Dec', value: 91 },
          ],
        },
        flowNotes: ['fully hands-off', 'always improving'],
        sections: [
          { heading: 'Benefits', note: 'Fill your pipeline without lifting a finger.', items: [
            { ic: 'zap', title: 'Be first to respond', desc: '78% of buyers purchase from whoever replies first, CircleOn makes that you, every time.' },
            { ic: 'clock', title: '11 hours back per rep', desc: 'Reps stop building lists by hand and spend the week closing instead.' },
            { ic: 'shield', title: 'Clean, verified data', desc: 'Every email and record verified and deduplicated before it hits your CRM.' },
          ] },
          { heading: 'Integrations', note: 'Works with the tools your team already uses.', items: [
            { ic: 'sync', title: 'HubSpot', desc: 'Two-way sync of leads and activity.' },
            { ic: 'cloud', title: 'Salesforce', desc: 'Native lead and contact objects.' },
            { ic: 'funnel', title: 'Pipedrive', desc: 'Auto-create deals from scored leads.' },
            { ic: 'bell', title: 'Slack', desc: 'Get pinged the second a hot lead lands.' },
          ] },
          { heading: 'Use Cases', note: 'One engine, three ways teams grow with it.', items: [
            { ic: 'target', title: 'Outbound sales', desc: 'Build targeted lists at scale.' },
            { ic: 'layers', title: 'Agencies', desc: 'Prospect for multiple clients in parallel.' },
            { ic: 'rocket', title: 'Founders', desc: 'Run pipeline without a full sales team.' },
          ] },
        ],
        faqs: [
          { q: 'Why does response speed matter so much?', a: 'Contact a lead within 5 minutes and you\'re 21× more likely to qualify it than at 30 minutes, and 100× more likely to even connect (MIT / InsideSales). Yet the average company takes 47 hours. CircleOn routes scored leads instantly so a rep can act inside that window.' },
          { q: 'Where do the leads come from?', a: 'CircleOn combines licensed B2B data providers with public web signals, then verifies every contact before it reaches you.' },
          { q: 'How is lead scoring calculated?', a: 'Our model weighs firmographic fit, buying signals, and engagement to produce a 0–100 score you can tune to your ICP.' },
          { q: 'Can I bring my own CRM?', a: 'Yes, native integrations cover the major CRMs, and an open API handles everything else.' },
        ],
      },
      'voice-agent': {
        eyebrow: 'Voice Agent',
        title: 'Voice AI agents that answer every call, 24/7',
        subtitle: 'Deploy human-sounding voice agents that answer in under a second, qualify prospects, book meetings, and handle support, day or night, in any timezone. No voicemail, no hold music, no missed revenue.',
        features: [
          { title: 'Natural Conversation', desc: 'Low-latency, human-sounding speech that understands interruptions and context.' },
          { title: 'Appointment Booking', desc: 'Checks live availability and books directly into your calendar.' },
          { title: 'Knowledge Retrieval', desc: 'Answers questions using your docs, pricing, and policies.' },
          { title: 'Seamless Human Handoff', desc: 'Transfers to a live rep with full context when it matters.' },
        ],
        workflowTitle: 'How the Voice Agent Works',
        workflow: [['Answer', 'Answers every incoming call instantly'], ['Understand', 'Understands customer intent from natural speech'], ['Retrieve', 'Retrieves business knowledge to inform the call'], ['Respond', 'Answers questions accurately and naturally'], ['Schedule', 'Schedules the appointment or executes the task'], ['Transfer', 'Transfers to a human when it truly matters']],
        statsBarData: {
          title: 'How teams put the Voice Agent to work',
          bars: [
            { label: 'Appointment booking', value: 89, isUs: true },
            { label: 'Support handling', value: 82, isUs: true },
            { label: 'Human handoff', value: 76, isUs: true },
          ],
          caption: 'Share of active accounts using each capability weekly, based on CircleOn product usage.',
        },
        statsTrendData: {
          title: 'After-hours calls captured by CircleOn climb every month',
          points: [
            { label: 'Feb', value: 61 }, { label: 'Apr', value: 68 }, { label: 'Jun', value: 74 },
            { label: 'Aug', value: 82 }, { label: 'Oct', value: 88 }, { label: 'Dec', value: 94 },
          ],
        },
        flowNotes: ['sounds human', 'never sleeps'],
        sections: [
          { heading: 'Voice capabilities', note: 'Everything a great front-desk hire can do, except it never misses a call, and 85% of callers who hit voicemail never ring back.', items: [
            { ic: 'globe', title: 'Multilingual', desc: 'Fluent across 30+ languages and accents.' },
            { ic: 'wave', title: 'Custom voice', desc: 'Match your brand tone and persona.' },
            { ic: 'doc', title: 'Call summaries', desc: 'Every call transcribed and summarized.' },
            { ic: 'route', title: 'Smart routing', desc: 'Sends complex calls to the right person.' },
          ] },
          { heading: 'Supported industries', note: 'Teams that live and die by the phone.', items: [
            { ic: 'home', title: 'Real estate', desc: 'Qualify buyers and schedule showings.' },
            { ic: 'health', title: 'Healthcare', desc: 'Book and confirm appointments.' },
            { ic: 'wrench', title: 'Home services', desc: 'Capture jobs even after hours.' },
            { ic: 'monitor', title: 'SaaS support', desc: 'Deflect tier-1 tickets instantly.' },
          ] },
          { heading: 'Integrations', note: 'Plugs into your existing phone stack.', items: [
            { ic: 'phone', title: 'Twilio', desc: 'Bring your own numbers.' },
            { ic: 'calendar', title: 'Google Calendar', desc: 'Real-time availability.' },
            { ic: 'chat', title: 'Zendesk', desc: 'Log calls as tickets.' },
          ] },
        ],
        faqs: [
          { q: 'How much do missed calls really cost?', a: 'The average small business misses 62% of its calls and loses about $126K a year, 85% of those callers never ring back and 62% dial a competitor instead (Aira / 411 Locals, 2026). CircleOn answers all of them.' },
          { q: 'Does it sound robotic?', a: 'No, CircleOn uses natural, low-latency speech with realistic turn-taking. Across analyses of over a million business calls, 99% of callers report neutral-to-positive sentiment with AI answering.' },
          { q: 'What happens for complex calls?', a: 'The agent recognizes when it\'s out of scope and transfers to a human with the full transcript and context attached.' },
          { q: 'Can it use my business knowledge?', a: 'Yes. Upload docs, FAQs, and pricing and the agent grounds every answer in your content.' },
        ],
      },
      'follow-up': {
        eyebrow: 'Follow Up',
        title: 'Automated follow-up that never drops a lead',
        subtitle: 'Personalized email, SMS, and WhatsApp sequences, timed by AI, because 80% of sales close between the 5th and 12th touch, and CircleOn makes every one without you lifting a finger.',
        features: [
          { title: 'Smart Timing', desc: 'AI decides the best moment to reach each lead based on behavior.' },
          { title: 'Deep Personalization', desc: 'Every message tailored to the prospect, not a template blast.' },
          { title: 'Multi-channel', desc: 'Email, SMS, and WhatsApp orchestrated in one sequence.' },
          { title: 'Auto Meeting Booking', desc: 'Confirms and reschedules meetings without you touching a thing.' },
        ],
        workflowTitle: 'How Follow Up Works',
        workflow: [['Capture', 'A new lead is captured the moment they show interest'], ['Wait', 'AI waits based on smart, behavior-driven timing'], ['Email', 'Sends a personalized email tailored to the lead'], ['Remind', 'Follows up with an SMS or WhatsApp reminder'], ['Confirm', 'Confirms the meeting automatically'], ['Convert', 'Turns the conversation into a paying customer']],
        statsBarData: {
          title: 'How teams put Follow Up to work',
          bars: [
            { label: 'Email sequences', value: 93, isUs: true },
            { label: 'SMS reminders', value: 85, isUs: true },
            { label: 'Smart send timing', value: 90, isUs: true },
          ],
          caption: 'Share of active accounts using each capability weekly, based on CircleOn product usage.',
        },
        statsTrendData: {
          title: 'Conversion rate rises every month as sequences improve',
          points: [
            { label: 'Feb', value: 29 }, { label: 'Apr', value: 36 }, { label: 'Jun', value: 44 },
            { label: 'Aug', value: 58 }, { label: 'Oct', value: 69 }, { label: 'Dec', value: 81 },
          ],
        },
        flowNotes: ['perfectly timed', 'never misses'],
        sections: [
          { heading: 'Multi-channel communication', note: 'Meet prospects where they actually reply, texted prospects convert about 40% higher, and multi-channel sequences roughly double reply rates.', items: [
            { ic: 'mail', title: 'Email', desc: 'Personalized, deliverability-optimized.' },
            { ic: 'message', title: 'SMS', desc: 'Short, timely nudges that get read.' },
            { ic: 'chat', title: 'WhatsApp', desc: 'Rich, conversational follow-ups.' },
            { ic: 'inbox', title: 'Unified inbox', desc: 'Every reply in one thread.' },
          ] },
          { heading: 'Analytics', note: 'See exactly what\'s working. CircleOn tracks every channel, sequence, and test, so you can double down on what converts.', chart: true, chartData: [
            { title: 'Reply rate by channel', caption: 'Adding channels compounds replies, three beats one, every time.', bars: [
              { label: 'Email only', value: '8%', w: 26, hi: false },
              { label: 'Email + SMS', value: '19%', w: 61, hi: false },
              { label: 'Email + SMS + WhatsApp', value: '31%', w: 100, hi: true },
            ] },
            { title: 'Where deals convert', caption: 'The full funnel, first send to booked meeting.', bars: [
              { label: 'Sent', value: '100%', w: 100, hi: false },
              { label: 'Opened', value: '61%', w: 61, hi: false },
              { label: 'Replied', value: '27%', w: 27, hi: false },
              { label: 'Meeting booked', value: '11%', w: 12, hi: true },
            ] },
            { title: 'A/B test, subject line', caption: 'CircleOn auto-promotes the winning variant.', bars: [
              { label: 'Variant A', value: '6.2%', w: 63, hi: false },
              { label: 'Variant B, winner', value: '9.8%', w: 100, hi: true },
            ] },
          ] },
          { heading: 'Integrations', note: 'Fits the tools you already run on.', items: [
            { ic: 'sync', title: 'HubSpot', desc: 'Trigger sequences on any event.' },
            { ic: 'calendar', title: 'Calendly', desc: 'Book straight into your calendar.' },
            { ic: 'card', title: 'Stripe', desc: 'Follow up on failed payments.' },
          ] },
        ],
        faqs: [
          { q: 'Why automate follow-up instead of doing it manually?', a: 'Because it\'s where deals quietly die: 80% of sales need 5+ follow-ups, yet 44% of reps stop after one and only 8% ever reach five (SPOTIO). CircleOn runs all five-plus, perfectly timed, automatically.' },
          { q: 'Will messages feel automated?', a: 'No, each message is generated for the individual prospect using their context, so replies feel personal and relevant.' },
          { q: 'How does smart timing work?', a: 'The model learns when each lead engages and paces outreach to land at high-response moments instead of fixed intervals.' },
          { q: 'Which channels are supported?', a: 'Email, SMS, and WhatsApp today, orchestrated together in a single sequence with a unified reply inbox.' },
        ],
      },
    };

    const product = products[page] || null;
    if (product) {
      product.flow = this.flowSketch(product.workflow);
      product.flowHighlights = product.flow.slice(0, 3);
      product.features = product.features.map((f, i) => ({ ...f, n: i + 1, n2: String(i + 1).padStart(2, '0') }));
      product.statsBar = this.statsBarBuild(product.statsBarData);
      product.statsTrend = this.statsTrendBuild(product.statsTrendData);
      product.heroStat = { value: product.statsBarData.bars[2].value + '%', label: product.statsBarData.caption.replace(/,.*$/, '') };
      product.sections = this.buildSections(product.sections);
      product.faqs = product.faqs.map((q, i) => ({ ...q, n2: String(i + 1).padStart(2, '0'), isOpen: this.state.openFaq === i, isClosed: this.state.openFaq !== i, toggle: this.toggleFaq(i) }));
    }

    const dark = this.state.theme === 'dark';
    const mockSoftBg = dark ? '#362a41' : '#FAF9FF';
    const mockBorder = dark ? '#5c4a63' : '#D8D5E2';
    const mockHeading = dark ? '#fff9ff' : '#1A172C';
    const mockMuted = dark ? '#ded3e5' : '#716F82';
    const mockBody = dark ? '#f0e8f5' : '#423F54';
    const activeSolution = this.state.activeSolution;
    const leadActive = activeSolution === 'lead-generation';
    const voiceActive = activeSolution === 'voice-agent';
    const followActive = activeSolution === 'follow-up';
    const orbStyle = (active, grad) => `width:${active ? 190 : 152}px;height:${active ? 190 : 152}px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;background:${grad};box-shadow:${active ? '0 46px 80px -26px rgba(71,30,134,.5), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -22px 34px -10px rgba(0,0,0,.2)' : '0 20px 38px -16px rgba(71,30,134,.35), inset 0 2px 0 rgba(255,255,255,.4), inset 0 -16px 24px -8px rgba(0,0,0,.16)'};transition:width .5s cubic-bezier(.2,.8,.2,1),height .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s`;
    const iconWrapStyle = (active) => `width:56px;height:56px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px -8px rgba(22,15,46,.35);position:relative;z-index:1`;
    const titleStyle = (active) => `font-family:'Fraunces',serif;font-size:${active ? 21 : 19}px;font-weight:400;margin:22px 0 8px;color:${dark ? active ? '#FFF8FF' : '#CFC3D5' : active ? '#1A172C' : '#423F54'};cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:color .3s,font-size .3s`;
    const descStyle = (active) => `font-size:14.5px;line-height:1.6;margin:0;max-width:230px;text-align:center;color:${dark ? '#D2C6D8' : '#423F54'};cursor:pointer;opacity:${active ? 1 : .82};transition:opacity .3s`;
    const arrowStyle = (active) => `font-size:15px;color:#C49E62;transition:color .3s`;
    const tabStyle = (active) => `display:flex;align-items:center;justify-content:center;padding:0;border-radius:0;font-weight:700;font-size:19px;color:${dark ? active ? '#F7F0FF' : '#AFA4BA' : active ? '#1A172C' : '#8A87A0'};background:transparent;box-shadow:none;cursor:pointer;transition:color .25s;white-space:nowrap`;
    const sheen = 'radial-gradient(circle at 24% 18%, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 26%), ';
    const leadGrad = sheen + 'radial-gradient(circle at 70% 88%, #1A0E38 0%, transparent 54%), radial-gradient(circle at 85% 15%, #C9B6FF 0%, transparent 40%), conic-gradient(from 210deg at 50% 50%, #471E86, #7447C8, #B79CF2, #7447C8, #471E86)';
    const voiceGrad = sheen + 'radial-gradient(circle at 70% 88%, #4A2F0B 0%, transparent 54%), radial-gradient(circle at 85% 15%, #F6E4BE 0%, transparent 40%), conic-gradient(from 210deg at 50% 50%, #96712F, #C49E62, #F0DCB1, #C49E62, #96712F)';
    const followGrad = sheen + 'radial-gradient(circle at 70% 88%, #1A0E38 0%, transparent 54%), radial-gradient(circle at 85% 15%, #C9B6FF 0%, transparent 40%), conic-gradient(from 30deg at 50% 50%, #471E86, #7447C8, #B79CF2, #7447C8, #471E86)';

    const goto = this.goto;
    const team = [
      { initials: 'AR', name: 'Ava Reyes', role: 'CEO & Co-founder' },
      { initials: 'JK', name: 'Jonah Kim', role: 'CTO & Co-founder' },
      { initials: 'ML', name: 'Maya Lopez', role: 'Head of AI' },
      { initials: 'DP', name: 'Deepak Patel', role: 'Head of Product' },
    ];
    const resources = [
      { label: 'About', note: 'Our mission & team', onClick: () => goto('about') },
      { label: 'Safety', note: 'Responsible & secure AI', onClick: () => goto('safety') },
      { label: 'Customer Stories', note: 'Results from real teams', onClick: () => goto('stories') },
      { label: 'Blog', note: 'Ideas & playbooks', onClick: () => goto('blog') },
      { label: 'Help Center', note: 'Docs & support', onClick: () => goto('help') },
    ];

    const footerCols = [
      { title: 'Solutions', links: [
        { label: 'Lead Generation', onClick: () => goto('lead-generation') },
        { label: 'Voice Agent', onClick: () => goto('voice-agent') },
        { label: 'Follow Up', onClick: () => goto('follow-up') },
      ] },
      { title: 'Resources', links: [
        { label: 'About', onClick: () => goto('about') },
        { label: 'Safety', onClick: () => goto('safety') },
        { label: 'Customer Stories', onClick: () => goto('stories') },
        { label: 'Blog', onClick: () => goto('blog') },
        { label: 'Help Center', onClick: () => goto('help') },
      ] },
      { title: 'Company', links: [
        { label: 'Contact', onClick: () => goto('help') },
        { label: 'Careers', onClick: () => goto('about') },
        { label: 'Privacy Policy', onClick: () => goto('safety') },
        { label: 'Terms of Service', onClick: () => goto('safety') },
      ] },
    ];

    const freeFeats = ['Explore the platform', 'Up to 50 leads / mo', 'Community support', 'No credit card required'];
    const leadStarterFeats = ['Lead Generation solution', 'Up to 500 leads / mo', 'AI lead scoring', 'CRM sync', 'Email support'];
    const voiceStarterFeats = ['Voice Agent solution', 'Up to 300 minutes / mo', 'Appointment booking', 'Call summaries', 'Email support'];
    const followStarterFeats = ['Follow Up solution', 'Up to 500 contacts / mo', 'Email + SMS sequences', 'Smart send timing', 'Email support'];
    const starterPick = this.state.starterPick;
    const starterFeats = starterPick === 'voice' ? voiceStarterFeats : starterPick === 'follow' ? followStarterFeats : leadStarterFeats;
    const starterOpt = (active) => `display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;transition:.2s;border:1px solid ${active ? dark ? '#806044' : '#1A172C' : dark ? '#765c7f' : '#D8D5E2'};background:${active ? dark ? '#403248' : '#1A172C' : dark ? '#2c1f36' : '#fff'};color:${active ? '#fff' : dark ? '#ded3e5' : '#423F54'}`;
    const proFeats = ['All 3 AI solutions', 'Unlimited leads', 'Voice agent, 500 min / mo', 'Multi-channel follow-up', 'Priority support'];

    const { calcLead, calcVoice, calcFollow, calcMinutes } = this.state;
    // Recommend the cheapest plan that covers the requested minutes, then add
    // that plan's overage for anything beyond its allowance.
    const mins = this.state.calcMinutes;
    const PLAN_RATES = [
      { tier: 'Atelier', monthly: 996, included: 2000, overage: 0.42 },
      { tier: 'Maison', monthly: 3154, included: 10000, overage: 0.32 },
    ];
    const withOverage = (p) =>
      p.monthly + Math.round(Math.max(0, mins - p.included) * p.overage);
    const calcPick = withOverage(PLAN_RATES[0]) <= withOverage(PLAN_RATES[1])
      ? PLAN_RATES[0] : PLAN_RATES[1];
    const calcTotal = withOverage(calcPick).toLocaleString();
    const calcExtra = Math.max(0, mins - calcPick.included);
    const chip = (active) => `display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;${active ? `background:${dark ? '#403248' : '#1A172C'};color:#fff;border:1px solid ${dark ? '#806044' : '#1A172C'}` : `background:transparent;color:${dark ? '#ded3e5' : '#716F82'};border:1px solid ${dark ? '#765c7f' : '#D8D5E2'}`}`;

    const isMonthly = this.state.billing === 'monthly';
    const proPrice = isMonthly ? '$149' : '$119';
    const proPer = isMonthly ? '/ mo' : '/ mo, billed yearly';
    const starterPrice = isMonthly ? '$59' : '$47';
    const starterPer = isMonthly ? '/ mo' : '/ mo, billed yearly';
    const segBtn = (active) => `padding:11px 20px;border-radius:999px;border:none;background:${active ? dark ? '#403248' : '#1A172C' : 'transparent'};color:${active ? '#fff' : dark ? '#ded3e5' : '#716F82'};font-weight:600;font-size:14px;cursor:pointer;transition:.2s`;
    const comparisonRows = [
      { label: 'Voice minutes included', atelier: '2,000', maison: '10,000', sovereign: 'Custom' },
      { label: 'Overage per minute', atelier: '$0.42', maison: '$0.32', sovereign: 'Custom' },
      { label: 'Active agents', atelier: '1', maison: 'Unlimited', sovereign: 'Unlimited' },
      { label: 'Languages', atelier: '2', maison: 'All 31', sovereign: 'All 31' },
      { label: 'Custom voice cloning', atelier: '\u2014', maison: '1 voice', sovereign: 'Unlimited' },
      { label: 'Support', atelier: 'Email + Slack', maison: 'Priority + shared Slack', sovereign: 'Dedicated architect' },
    ];

    const dur = 1400;
    const counting = typeof window !== 'undefined' && this.state.mounted;
    const start = counting
      ? (window.__coCountStart || (page === 'home' ? (window.__coCountStart = Date.now()) : Date.now()))
      : 0;
    const rawP = counting ? Math.min(1, Math.max(0, (Date.now() - start) / dur)) : 0;
    const cp = 1 - Math.pow(1 - rawP, 3);
    if (counting && page === 'home' && !window.__coCountDone) this.startCounters();
    const rc = (to) => Math.round(cp * to);
    return {
      statA: rc(21) + '×',
      statB: rc(62) + '%',
      statC: rc(80) + '%',
      statLeads: String(rc(128)),
      statConv: rc(42) + '%',
      isHome: page === 'home',
      isProduct: !!product,
      isLeadPage: page === 'lead-generation',
      isVoicePage: page === 'voice-agent',
      isFollowPage: page === 'follow-up',
      isAbout: page === 'about',
      isSafety: page === 'safety',
      isStories: page === 'stories',
      isBlog: page === 'blog',
      isHelp: page === 'help',
      isPricing: page === 'pricing',
      product,
      resources, footerCols, freeFeats, leadStarterFeats, voiceStarterFeats, followStarterFeats, proFeats,
      mockSoftBg, mockBorder, mockHeading, mockMuted, mockBody,
      isMonthly, proPrice, proPer, starterPrice, starterPer, comparisonRows,
      starterFeats,
      theme: this.state.theme,
      themeToggleAria: this.state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      toggleTheme: this.toggleTheme,
      starterIsLead: starterPick === 'lead', starterIsVoice: starterPick === 'voice', starterIsFollow: starterPick === 'follow',
      starterLeadStyle: starterOpt(starterPick === 'lead'),
      starterVoiceStyle: starterOpt(starterPick === 'voice'),
      starterFollowStyle: starterOpt(starterPick === 'follow'),
      setStarterLead: () => this.setStarterPick('lead'),
      setStarterVoice: () => this.setStarterPick('voice'),
      setStarterFollow: () => this.setStarterPick('follow'),
      setMonthly: this.setMonthly, setAnnual: this.setAnnual,
      monthlyBtnStyle: segBtn(isMonthly), annualBtnStyle: segBtn(!isMonthly),
      calcLead, calcVoice, calcFollow, calcMinutes, calcTotal: '$' + calcTotal,
      calcLeadChipStyle: chip(calcLead), calcVoiceChipStyle: chip(calcVoice), calcFollowChipStyle: chip(calcFollow),
      toggleCalcLead: () => this.toggleCalc('calcLead'),
      toggleCalcVoice: () => this.toggleCalc('calcVoice'),
      toggleCalcFollow: () => this.toggleCalc('calcFollow'),
      setCalcMinutes: this.setCalcMinutes,
      calcMinutesLabel: mins.toLocaleString() + ' min',
      calcPlanLabel: calcPick.tier + ' fits this volume',
      calcMinutesNote: calcExtra > 0
        ? calcExtra.toLocaleString() + ' min over, at $' + calcPick.overage.toFixed(2) + ' / min'
        : calcPick.included.toLocaleString() + ' minutes included',
      atelierOverage: '$0.42',
      maisonOverage: '$0.32',
      plans: [
        {
          tier: 'Atelier', audience: 'founders', price: '$996', per: ' / mo',
          billingNote: 'Billed annually. 2,000 minutes included.',
          blurb: 'For founders running their own pipeline. One agent, two languages, white-glove setup.',
          feats: ['1 agent \u00b7 2,000 min / mo', '2 languages', 'HubSpot or Pipedrive',
                  'Standard voice library', 'Email + Slack support', '$0.42 / min overage'],
          cta: 'Start with Atelier', href: '/signup',
        },
        {
          tier: 'Maison', ribbon: 'Most popular', featured: true,
          audience: 'revenue teams', price: '$3,154', per: ' / mo',
          billingNote: 'Billed annually. 10,000 minutes included.',
          blurb: 'For revenue teams ready to scale. Unlimited agents, custom voice cloning, and a shared Slack channel with our team.',
          feats: ['Unlimited agents \u00b7 10k min / mo', 'All 31 languages',
                  'Salesforce, HubSpot, Attio, Pipedrive', 'Custom voice cloning (1 included)',
                  'Priority routing & SLAs', '$0.32 / min overage'],
          cta: 'Start with Maison', href: '/signup',
        },
        {
          tier: 'Sovereign', audience: 'enterprises', price: 'Custom', per: '',
          billingNote: 'Annual contract. Volume-based pricing.',
          blurb: 'For enterprises with regulated workloads, dedicated infrastructure, and procurement teams that have opinions.',
          feats: ['Single-tenant deployment', 'Dedicated infra (any region)',
                  'Unlimited voice cloning', 'Dedicated solutions architect',
                  '99.99% uptime SLA', 'Custom data residency'],
          // Sovereign cannot be bought online, so this goes to the enquiry form.
          cta: 'Talk to sales', onClick: this.gotoWaitlist,
        },
      ],
      resourcesOpen: this.state.resourcesOpen,
      toggleResources: this.toggleResources,
      leadActive, voiceActive, followActive,
      leadOrbStyle: orbStyle(leadActive, leadGrad, -9),
      voiceOrbStyle: orbStyle(voiceActive, voiceGrad, 5),
      followOrbStyle: orbStyle(followActive, followGrad, -6),
      leadIconWrapStyle: iconWrapStyle(leadActive, -9),
      voiceIconWrapStyle: iconWrapStyle(voiceActive, 5),
      followIconWrapStyle: iconWrapStyle(followActive, -6),
      leadTabStyle: tabStyle(leadActive), voiceTabStyle: tabStyle(voiceActive), followTabStyle: tabStyle(followActive),
      leadTitleStyle: titleStyle(leadActive), voiceTitleStyle: titleStyle(voiceActive), followTitleStyle: titleStyle(followActive),
      leadDescStyle: descStyle(leadActive), voiceDescStyle: descStyle(voiceActive), followDescStyle: descStyle(followActive),
      leadArrowStyle: arrowStyle(leadActive), voiceArrowStyle: arrowStyle(voiceActive), followArrowStyle: arrowStyle(followActive),
      setActiveLead: () => this.setActiveSolution('lead-generation'),
      setActiveVoice: () => this.setActiveSolution('voice-agent'),
      setActiveFollow: () => this.setActiveSolution('follow-up'),
      prevSolution: () => this.cycleSolution(-1),
      nextSolution: () => this.cycleSolution(1),
      gotoHome: () => goto('home'),
      gotoPricing: () => goto('pricing'),
      goLeadTitle: () => goto('lead-generation'),
      goVoiceTitle: () => goto('voice-agent'),
      goFollowTitle: () => goto('follow-up'),
      goLeadContent: () => this.gotoAndScroll('wf-lead'),
      goVoiceContent: () => this.gotoAndScroll('wf-voice'),
      goFollowContent: () => this.gotoAndScroll('wf-follow'),
      scrollSolutions: () => this.scrollTo('solutions'),
      gotoWaitlist: () => this.gotoAndScroll('waitlist'),
      homeLeadFlow: this.decorateLeadFlow(this.flowSketch([['Identify', 'Identify your target audience'], ['Discover', 'Find qualified prospects that match your ICP'], ['Enrich', 'Enrich contact data with verified details'], ['Score', 'AI lead scoring ranks by intent and fit'], ['Deliver', 'Send qualified leads straight to your CRM']])),
      homeVoiceFlow: this.decorateFlow(this.flowSketch([['Answer', 'Answers every incoming call instantly'], ['Understand', 'Understands customer intent from natural speech'], ['Retrieve', 'Retrieves business knowledge to inform the call'], ['Respond', 'Answers questions accurately and naturally'], ['Schedule', 'Schedules the appointment or executes the task'], ['Transfer', 'Transfers to a human when it truly matters']]), this.state.voiceStep ?? 0, this.voiceStepClick),
      homeFollowFlow: this.decorateFlow(this.flowSketch([['Capture', 'A new lead is captured the moment they show interest'], ['Wait', 'AI waits based on smart, behavior-driven timing'], ['Email', 'Sends a personalized email tailored to the lead'], ['Remind', 'Follows up with an SMS or WhatsApp reminder'], ['Confirm', 'Confirms the meeting automatically'], ['Convert', 'Turns the conversation into a paying customer']]), this.state.followStep ?? 0, this.followStepClick),
      leadFlow: this.numHoriz(['Identify Target Audience', 'Find Qualified Prospects', 'Enrich Contact Data', 'AI Lead Scoring', 'Send Qualified Leads to CRM']),
      voiceFlow: this.numHoriz(['Incoming Call', 'AI Understands Customer Intent', 'Retrieves Business Knowledge', 'Answers Questions', 'Schedules Appointment or Executes Task', 'Transfers to Human if Needed']),
      followFlow: this.numHoriz(['Lead Captured', 'AI Waits Based on Smart Timing', 'Personalized Email', 'SMS or WhatsApp Reminder', 'Meeting Confirmation', 'Customer Conversion']),
      voices: this.voicesData(),
      leadSamples: this.leadSamplesData(dark),
      form: this.state.form,
      onName: this.onField('name'), onEmail: this.onField('email'), onCompany: this.onField('company'),
      submit: this.submit, submitted: this.state.submitted, notSubmitted: !this.state.submitted,
      freeLeadsOpen: this.state.freeLeadsOpen,
      openFreeLeads: this.openFreeLeads,
      closeFreeLeads: this.closeFreeLeads,
      freeLeadsForm: this.state.freeLeadsForm,
      onFreeLeadCompany: this.onFreeLeadField('company'),
      onFreeLeadIndustry: this.onFreeLeadField('industry'),
      onFreeLeadIcp: this.onFreeLeadField('icp'),
      onFreeLeadEmail: this.onFreeLeadField('email'),
      submitFreeLeads: this.submitFreeLeads,
      resetFreeLeads: this.resetFreeLeads,
      freeLeadsSubmitted: this.state.freeLeadsSubmitted,
      freeLeadsNotSubmitted: !this.state.freeLeadsSubmitted,
      freeLeadsResults: this.freeLeadsResultData(),
      freeLeadsEmail: this.state.freeLeadsForm.email,
      freeLeadsHeadline: this.state.freeLeadsForm.company ? ('Matched to ' + this.state.freeLeadsForm.company) : 'Matched to your ideal customer profile',
      team: team,
      safety: [
        { title: 'Human in control', desc: 'Every agent operates within guardrails you define, with human handoff always available.' },
        { title: 'Data encryption', desc: 'Data is encrypted in transit (TLS 1.3) and at rest (AES-256) across our infrastructure.' },
        { title: 'Privacy by design', desc: 'We never sell your data or your customers\' data, and you can delete it at any time.' },
        { title: 'Compliance', desc: 'SOC 2 Type II, GDPR, and CCPA aligned, with regional data residency options.' },
        { title: 'Responsible AI', desc: 'Models are tested for bias and misuse, with transparent logging of every action.' },
        { title: 'Consent-aware outreach', desc: 'Built-in opt-out handling and DNC compliance across voice, SMS, and email.' },
      ],
      metrics: [
        { value: '+42%', label: 'average conversion lift' },
        { value: '3.1×', label: 'more qualified pipeline' },
        { value: '11 hrs', label: 'saved per rep, weekly' },
      ],
      stories: [
        { quote: 'CircleOn books more demos overnight than our SDRs used to in a week. It changed how we sell.', initials: 'SL', name: 'Sara Lin', role: 'VP Sales, Northwind' },
        { quote: 'The voice agent answers every after-hours call. We stopped losing jobs to competitors who picked up first.', initials: 'TM', name: 'Tom Meyer', role: 'Owner, BrightHome Services' },
        { quote: 'Follow-up used to fall through the cracks. Now every lead gets a perfectly-timed nudge automatically.', initials: 'RC', name: 'Rina Chen', role: 'Growth Lead, Fintra' },
      ],
      categories: ['All', 'Growth', 'Voice AI', 'Automation', 'Product'].map((label) => ({ label, chipStyle: `padding:9px 18px;border-radius:999px;border:1px solid ${label === 'All' ? '#1A172C' : '#D8D5E2'};background:${label === 'All' ? '#1A172C' : '#fff'};color:${label === 'All' ? '#fff' : '#1A172C'};font-size:13.5px;font-weight:600;cursor:pointer;transition:.2s` })),
      posts: [
        { cat: 'Automation', title: 'Building a follow-up engine that closes itself', excerpt: 'How AI sequencing keeps every lead warm without a human lifting a finger.', read: '6 min read', thumbGrad: 'linear-gradient(150deg,#F1EEFD,#F8EED5)', avatarGrad: 'linear-gradient(155deg,#945FF9,#7447C8)', author: team[0] },
        { cat: 'Voice AI', title: 'What makes an AI voice agent sound human', excerpt: 'The pacing, tone, and interruption handling that separate great agents from robotic ones.', read: '5 min read', thumbGrad: 'linear-gradient(150deg,#F8EED5,#F1EEFD)', avatarGrad: 'linear-gradient(155deg,#E6CE9D,#C49E62)', author: team[2] },
        { cat: 'Growth', title: 'Lead scoring that reps actually trust', excerpt: 'Why most scoring models get ignored, and the signals that make reps believe the number.', read: '7 min read', thumbGrad: 'linear-gradient(150deg,#F1EEFD,#F8EED5)', avatarGrad: 'linear-gradient(155deg,#945FF9,#7447C8)', author: team[1] },
        { cat: 'Product', title: 'Inside CircleOn: how our agents stay in sync', excerpt: 'A look at the shared context layer that keeps lead gen, voice, and follow-up talking to each other.', read: '4 min read', thumbGrad: 'linear-gradient(150deg,#F8EED5,#F1EEFD)', avatarGrad: 'linear-gradient(155deg,#E6CE9D,#C49E62)', author: team[3] },
      ],
      featured: {
        cat: 'Growth', read: '8 min read',
        title: 'The 5-minute rule: why speed-to-lead decides who wins',
        excerpt: "Responding within five minutes makes you 21× more likely to qualify a lead. Here's how AI agents make that the default, not the exception.",
        author: team[0],
      },
      sidePosts: [
        { cat: 'Voice AI', read: '5 min read', title: 'What makes an AI voice agent sound human', thumbGrad: 'linear-gradient(150deg,#F1EEFD,#F8EED5)' },
        { cat: 'Growth', read: '7 min read', title: 'Lead scoring that reps actually trust', thumbGrad: 'linear-gradient(150deg,#F8EED5,#F1EEFD)' },
      ],
      lastSidePost: { cat: 'Automation', read: '6 min read', title: 'Building a follow-up engine that closes itself' },
      helpCats: [
        { title: 'Getting Started', desc: 'Set up your workspace and launch your first agent.', count: 12 },
        { title: 'Lead Generation', desc: 'Sources, scoring, enrichment, and CRM sync.', count: 18 },
        { title: 'Voice Agent', desc: 'Numbers, voices, knowledge, and call routing.', count: 15 },
        { title: 'Follow Up', desc: 'Sequences, channels, timing, and analytics.', count: 14 },
      ],
      socials: [
        { short: 'in' }, { short: 'X' }, { short: 'GH' },
      ],
    };
  }

  render() {
    const v = this.renderVals();
    const PageBody = PAGES[this.props.page] || Home;
    // The export set the wrapper background inline. It lives in .co-root now,
    // so the saved theme — applied to <html> before paint — can override it.
    return (
      <div className="co-root" data-co-theme={v.theme} suppressHydrationWarning>
        <Ambience />
        <Nav v={v} />
        <PageBody v={v} />
        <Footer v={v} />
      </div>
    );
  }
}

export default function CircleOn({ page }) {
  const router = useRouter();
  return <CircleOnShell page={page} router={router} />;
}
