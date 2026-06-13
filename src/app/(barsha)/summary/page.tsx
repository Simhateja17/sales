'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkspace, provisionVoiceAgent } from '@/lib/api';

type Answers = Record<string, string | string[] | number>;

export default function SummaryPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [activeTab, setActiveTab] = useState<'plain' | 'prompt'>('plain');
  const [generatedAt, setGeneratedAt] = useState('');
  const [savedPrompt, setSavedPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('barsha_answers');
    if (saved) setAnswers(JSON.parse(saved));
    setGeneratedAt(new Date().toLocaleString());

    getWorkspace()
      .then(data => {
        if (data.agentConfig?.raw_answers) {
          setAnswers(data.agentConfig.raw_answers);
        }
        if (data.agentConfig?.system_prompt) {
          setSavedPrompt(data.agentConfig.system_prompt);
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const get = (key: string, fallback = '—') => {
    const v = answers[key];
    if (!v) return fallback;
    if (Array.isArray(v)) return v.length ? v.slice(0, 3).join(', ') : fallback;
    return String(v);
  };

  const generatedPrompt = `# BARSHA AI — SYSTEM PROMPT
# Market: Singapore
# Generated: ${generatedAt || '—'}

## IDENTITY
You are ${get('agentName', 'Aria')}, calling on behalf of ${get('company', '[Company]')} based in ${get('city', 'Singapore')}.
Industry: ${get('industry', '[Industry]')}

## PDPA COMPLIANCE — READ FIRST
- You are operating under Singapore's Personal Data Protection Act (PDPA).
- Disclose you are an AI agent if the prospect directly asks.
- Do not call numbers on the DND Registry (pre-scrubbed by platform).
- Calling hours: Monday–Friday, 9am–6pm SGT only.
- On opt-out: log as DNC and end call immediately.
- Inform prospect this call may be recorded for quality purposes.

## COMPANY CONTEXT
${get('desc', '[Not provided]')}

## YOUR OFFER
Product/Service: ${get('product', '—')}
Pricing: ${get('pricing', '—')}
Value Prop: ${get('vp', '—')}
Booking Link: ${get('calLink', '[Not set]')}

## TARGET PROSPECT
Business Model: ${get('bizType', 'B2B')}
Decision Maker Titles: ${get('titles', 'CEO, Founder, Director')}
Company Size: ${get('companySize', '—')}
Target Region: ${get('region', 'Singapore')}
Min MRR: ${answers.mrr ? 'S$' + answers.mrr + 'k' : 'No filter'}

## CALL FLOW
[0:00] Open: "Hi, this is ${get('agentName', 'Aria')} from ${get('company', '[Company]')} — is now a good 2 minutes?"
[0:20] Hook: one-sentence value statement for their industry.
[0:45] Discovery: 1-2 open questions. Listen actively.
[2:00] Pitch: share the core offer if they are engaged.
[3:00] Objection Handling (see below).
[4:00] Close: offer the Calendly link for a 20-minute discovery call.

## OBJECTION HANDLING
${get('objections', "1. Too busy: offer a specific callback time\n2. Have a solution: ask what they would improve about it\n3. No budget: ask what would need to change for them to consider it")}

## TONE & CONSTRAINTS
Style: ${get('tone', 'Professional & Warm')}
Max Clients: ${get('capacity', '20')}/month — prioritise highest-intent prospects.
Never quote exact prices, make guarantees, or sign agreements.`;

  const rawPrompt = savedPrompt || generatedPrompt;

  async function handleLaunchAgent() {
    setLaunchError('');
    setLaunching(true);

    try {
      const result = await provisionVoiceAgent();
      sessionStorage.setItem('barsha_launch_job_id', result.job.id);
      router.push(`/dashboard?launchJobId=${result.job.id}`);
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'Failed to start AI launch job.');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="screen active" id="summary">
      <div className="sum-hdr">
        <div className="sum-icon">✦</div>
        <div className="sum-title">Your Agent is Ready</div>
        <p className="sum-sub">{loading ? 'Loading your saved setup...' : 'Review your setup before going live.'}</p>
      </div>

      <div className="toggle-bar">
        <button
          className={`tgl-btn${activeTab === 'plain' ? ' active' : ''}`}
          onClick={() => setActiveTab('plain')}
        >
          Plain Summary
        </button>
        <button
          className={`tgl-btn${activeTab === 'prompt' ? ' active' : ''}`}
          onClick={() => setActiveTab('prompt')}
        >
          Raw AI Prompt
        </button>
      </div>

      <div className="sum-box">
        {activeTab === 'plain' && (
          <div className="sum-panel active">
            <div className="sum-sec">
              <div className="ss-lbl">Business</div>
              <div className="ss-grid">
                <div className="ss-item"><div className="ss-key">Company</div><div className="ss-val">{get('company')}</div></div>
                <div className="ss-item"><div className="ss-key">Industry</div><div className="ss-val">{get('industry')}</div></div>
                <div className="ss-item"><div className="ss-key">City</div><div className="ss-val">{get('city')}</div></div>
                <div className="ss-item"><div className="ss-key">Model</div><div className="ss-val">{get('bizType')}</div></div>
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">Target Leads</div>
              <div className="ss-grid">
                <div className="ss-item"><div className="ss-key">Region</div><div className="ss-val">{get('region')}</div></div>
                <div className="ss-item"><div className="ss-key">Titles</div><div className="ss-val">{get('titles')}</div></div>
                <div className="ss-item"><div className="ss-key">Capacity</div><div className="ss-val">{answers.capacity ? answers.capacity + ' clients/mo' : '—'}</div></div>
                <div className="ss-item"><div className="ss-key">Min MRR</div><div className="ss-val">{answers.mrr ? 'S$' + answers.mrr + 'k+' : 'No filter'}</div></div>
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">Compliance</div>
              <div className="ss-full" style={{ color: '#92670A', fontSize: 12 }}>
                ✦ PDPA compliance active. DND registry checked before each call. Agent will identify itself as AI if asked directly.
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">Value Proposition</div>
              <div className="ss-full">{get('vp') !== '—' ? get('vp') : get('product')}</div>
            </div>
          </div>
        )}
        {activeTab === 'prompt' && (
          <div className="sum-panel active">
            <div className="prompt-box">{rawPrompt}</div>
          </div>
        )}
      </div>

      {launchError && (
        <div className="pdpa-banner" style={{ marginTop: 16 }}>
          <span>{launchError}</span>
        </div>
      )}

      <div className="sum-actions">
        <button className="btn-outline" onClick={() => router.push('/onboarding')}>← Edit Answers</button>
        <button
          className="btn-gold"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={handleLaunchAgent}
          disabled={launching || loading}
        >
          {launching ? 'Launching...' : 'Launch My Agent →'}
        </button>
      </div>
    </div>
  );
}
