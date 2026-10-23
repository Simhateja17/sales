'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getBillingStatus, getCallingStatus, type BillingUsage, type CallRecord } from '@/lib/api';
import { fmtDate, initials } from '../_lib/ui';

type Filter = 'all' | 'booked' | 'follow_up' | 'no_answer';

const FILTERS: Array<[Filter, string]> = [['all', 'All'], ['booked', 'Booked'], ['follow_up', 'Needs follow-up'], ['no_answer', 'No answer']];

function outcomeOf(call: CallRecord) {
  return call.outcome_type || call.call_outcomes?.[0]?.outcome_type || null;
}

function callTag(call: CallRecord): { label: string; tone: 'p' | 'g' | 'r' | 'd' } {
  const outcome = outcomeOf(call);
  if (outcome === 'booked' || call.meeting_id) return { label: 'Booked', tone: 'p' };
  if (call.status === 'no_answer' || call.status === 'busy' || outcome === 'no_answer') return { label: 'No answer', tone: 'r' };
  if (call.status === 'failed') return { label: 'Failed', tone: 'r' };
  if (outcome === 'follow_up_needed' || outcome === 'interested' || outcome === 'booking_link_sent') return { label: 'Follow-up', tone: 'd' };
  if (call.status === 'completed') return { label: 'Answered', tone: 'g' };
  const raw = call.status.replace('_', ' ');
  return { label: raw.charAt(0).toUpperCase() + raw.slice(1), tone: 'g' };
}

function matches(call: CallRecord, filter: Filter) {
  const tag = callTag(call).label;
  if (filter === 'booked') return tag === 'Booked';
  if (filter === 'follow_up') return tag === 'Follow-up';
  if (filter === 'no_answer') return tag === 'No answer';
  return true;
}

function duration(seconds: number | null) {
  if (seconds == null) return '';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Keep only the last digits of a phone number visible. */
function maskPhone(value: string | null | undefined) {
  if (!value) return 'Number unavailable';
  return value.length > 4 ? `${value.slice(0, -4).replace(/\d/g, '•')}${value.slice(-4)}` : value;
}

/** Transcripts are stored as plain text, usually one "Agent: ..." / "User: ..." line per turn. */
function transcriptLines(transcript: string | null) {
  if (!transcript) return [];
  return transcript.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(agent|ai|assistant|user|caller|customer)\s*:\s*(.*)$/i);
    if (!match) return { who: '', ai: false, text: line };
    const ai = /^(agent|ai|assistant)$/i.test(match[1]);
    return { who: ai ? 'Agent' : 'Caller', ai, text: match[2] };
  });
}

const WAVE = [30, 55, 80, 45, 90, 60, 35, 70, 95, 50, 40, 75, 85, 30, 60, 45, 90, 55, 35, 80, 65, 40, 70, 50, 85, 30, 60, 95, 45, 55, 75, 40, 65, 85, 35, 50, 70, 90, 45, 60];

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** Dark recording player: gold play button, a decorative waveform that fills as the audio plays, and elapsed/total time. */
function CallPlayer({ src, fallbackSeconds }: { src: string; fallbackSeconds: number | null }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(fallbackSeconds || 0);
  const progress = total ? time / total : 0;

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }

  return (
    <div className="calls-player">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setTime(0); }}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={event => { if (Number.isFinite(event.currentTarget.duration)) setTotal(event.currentTarget.duration); }}
      />
      <button type="button" className="calls-play" onClick={toggle} aria-label={playing ? 'Pause recording' : 'Play recording'}>
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="#1A172C" /> : <path d="M7 4l13 8-13 8z" fill="#1A172C" />}</svg>
      </button>
      <div className="calls-wave" aria-hidden="true">
        {WAVE.map((height, index) => <i key={index} className={index / WAVE.length < progress ? 'p' : ''} style={{ height: `${height}%` }} />)}
      </div>
      <span className="calls-clock">{clock(time)} / {clock(total)}</span>
    </div>
  );
}

export default function CallsView({ onOpenSettings, onOpenCampaigns }: { onOpenSettings: () => void; onOpenCampaigns?: () => void }) {
  const [calls, setCalls] = useState<CallRecord[] | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    getCallingStatus().then(data => setCalls(data.calls || [])).catch(e => setError(e instanceof Error ? e.message : 'Could not load calls.'));
    getBillingStatus().then(data => setUsage(data.usage)).catch(() => {});
  }, []);

  const visible = useMemo(() => (calls || []).filter(call => matches(call, filter)), [calls, filter]);
  const selected = visible.find(call => call.id === selectedId) || visible[0] || null;
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const thisMonth = (calls || []).filter(call => new Date(call.started_at || call.created_at) >= monthStart);
  const booked = thisMonth.filter(call => callTag(call).label === 'Booked').length;
  const missed = thisMonth.filter(call => callTag(call).label === 'No answer').length;
  const minutesUsed = usage?.used.minutes ?? 0;
  const minutesLimit = usage?.limits.minutes ?? 0;

  return (
    <section className="calls-page">
      <div className="page-header">
        <div>
          <div className="page-kicker">Voice agent</div>
          <h2 className="page-title">Calls</h2>
          <p className="page-sub">Every call your AI agent answered or made, with recording, transcript and summary.</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline" type="button" onClick={onOpenSettings}>Agent settings</button>
          {onOpenCampaigns ? <button className="btn-primary" type="button" onClick={onOpenCampaigns}>Call a lead</button> : null}
        </div>
      </div>
      {error ? <div className="pdpa-banner">{error}</div> : null}
      <div className="mtg-kpis">
        <div><b>{thisMonth.length}</b><span>Calls this month</span></div>
        <div><b>{booked}</b><span>Appointments booked</span></div>
        <div><b>{missed}</b><span>No answer</span></div>
        <div className="calls-minutes">
          <b>{minutesUsed}</b><span>{minutesLimit ? `of ${minutesLimit} AI minutes used` : 'AI minutes used'}</span>
          {minutesLimit ? <div className="calls-meter"><i style={{ width: `${Math.min(100, Math.round((minutesUsed / minutesLimit) * 100))}%` }} /></div> : null}
        </div>
      </div>
      {calls === null && !error ? <div className="card"><div className="sf-hint" style={{ padding: 20 }}>Loading calls…</div></div> : null}
      {calls !== null ? (
        <div className="calls-grid">
          <div className="calls-list">
            <div className="calls-filters" role="group" aria-label="Filter calls">
              {FILTERS.map(([key, label]) => <button key={key} type="button" className={filter === key ? 'on' : ''} onClick={() => setFilter(key)}>{label}</button>)}
            </div>
            {visible.length ? visible.map(call => {
              const tag = callTag(call);
              return (
                <button key={call.id} type="button" className={`calls-row${selected?.id === call.id ? ' on' : ''}`} onClick={() => setSelectedId(call.id)}>
                  <span className="calls-av">{initials(call.leads?.full_name || 'Unknown caller')}</span>
                  <span className="calls-body"><b>{call.leads?.full_name || 'Unknown caller'}</b><small>{[maskPhone(call.to_number || call.leads?.phone), duration(call.duration_seconds)].filter(Boolean).join(' · ')}</small></span>
                  <span className={`calls-tag calls-tag-${tag.tone}`}>{tag.label}</span>
                </button>
              );
            }) : <div className="sf-hint" style={{ padding: 20 }}>{calls.length ? 'No calls match this filter.' : 'No calls yet. Calls appear here once your voice agent starts dialing or answering.'}</div>}
          </div>
          {selected ? (
            <article className="calls-detail">
              <header>
                <span className="calls-av calls-av-lg">{initials(selected.leads?.full_name || 'Unknown caller')}</span>
                <div>
                  <h3>{selected.leads?.full_name || 'Unknown caller'}</h3>
                  <p>{[selected.leads?.company_name, fmtDate(selected.started_at || selected.created_at), duration(selected.duration_seconds)].filter(Boolean).join(' · ')}</p>
                </div>
                <span className={`calls-tag calls-tag-${callTag(selected).tone}`}>{callTag(selected).label}</span>
              </header>
              {selected.recording_url ? <CallPlayer key={selected.id} src={selected.recording_url} fallbackSeconds={selected.duration_seconds} /> : null}
              {selected.summary || selected.outcome_summary ? (
                <div className="calls-summary"><span>AI summary</span>{selected.summary || selected.outcome_summary}</div>
              ) : null}
              {selected.next_action ? <p className="calls-next"><b>Next step:</b> {selected.next_action}</p> : null}
              <span className="calls-mono">Transcript</span>
              {transcriptLines(selected.transcript).length ? (
                <div className="calls-tx">
                  {transcriptLines(selected.transcript).map((line, index) => (
                    <div key={index} className={`calls-line${line.ai ? ' ai' : ''}`}><b>{line.who}</b><span>{line.text}</span></div>
                  ))}
                </div>
              ) : <p className="sf-hint">No transcript for this call.</p>}
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
