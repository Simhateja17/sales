'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkspace, saveOnboarding } from '@/lib/api';

type Answers = Record<string, string | string[] | number>;

export default function SummaryPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [savedPrompt, setSavedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'plain' | 'prompt'>('plain');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('circleon_answers') || sessionStorage.getItem('barsha_answers');
    if (saved) setAnswers(JSON.parse(saved));

    getWorkspace()
      .then(data => {
        if (data.agentConfig?.raw_answers) setAnswers(data.agentConfig.raw_answers);
        if (data.agentConfig?.system_prompt) setSavedPrompt(data.agentConfig.system_prompt);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const get = (key: string, fallback = '—') => {
    const value = answers[key];
    if (!value) return fallback;
    return Array.isArray(value) ? (value.length ? value.join(', ') : fallback) : String(value);
  };

  const targetPrompt = savedPrompt || `Find email-ready prospects for ${get('company', 'this business')}.

What they sell: ${get('product')}
Likely buyers: ${get('titles')}
Target region: ${get('region')}
Preferred company size: ${get('companySize')}

Only use prospects that fit these requirements. Do not import an existing or suppressed lead. Preserve emails supplied by the user as the primary email.`;

  function updateAnswer(key: string, value: string) {
    setAnswers(current => ({ ...current, [key]: value }));
  }

  async function openWorkspace() {
    setSaveError('');
    setSaving(true);
    try {
      await saveOnboarding(answers);
      sessionStorage.setItem('circleon_answers', JSON.stringify(answers));
      sessionStorage.removeItem('barsha_answers');
      router.push('/dashboard');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your email preferences.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen active" id="summary">
      <div className="sum-hdr">
        <div className="sum-icon">✦</div>
        <div className="sum-title">Your lead targeting is ready</div>
        <p className="sum-sub">{loading ? 'Loading your saved setup...' : 'Review who CircleOn should find before opening your workspace.'}</p>
      </div>

      <div className="toggle-bar">
        <button className={`tgl-btn${activeTab === 'plain' ? ' active' : ''}`} onClick={() => setActiveTab('plain')}>
          Plain Summary
        </button>
        <button className={`tgl-btn${activeTab === 'prompt' ? ' active' : ''}`} onClick={() => setActiveTab('prompt')}>
          Targeting Instructions
        </button>
      </div>

      <div className="sum-box">
        {activeTab === 'plain' ? (
          <div className="sum-panel active">
            <div className="sum-sec">
              <div className="ss-lbl">Your business</div>
              <div className="ss-grid">
                <div className="ss-item"><div className="ss-key">Business</div><div className="ss-val">{get('company')}</div></div>
                <div className="ss-item"><div className="ss-key">What you sell</div><div className="ss-val">{get('product')}</div></div>
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">Customers to find</div>
              <div className="ss-grid">
                <div className="ss-item"><div className="ss-key">Likely buyers</div><div className="ss-val">{get('titles')}</div></div>
                <div className="ss-item"><div className="ss-key">Region</div><div className="ss-val">{get('region')}</div></div>
                <div className="ss-item"><div className="ss-key">Company size</div><div className="ss-val">{get('companySize')}</div></div>
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">How CircleOn protects your credits</div>
              <div className="ss-full">
                Existing and suppressed leads are removed before enrichment. CircleOn enriches ten candidates at a time and stops once your requested number of email-ready leads is reached.
              </div>
            </div>
            <div className="sum-sec">
              <div className="ss-lbl">Optional: help CircleOn write stronger emails</div>
              <div className="ss-grid">
                <OptionalChoice label="Problem customers want solved" value={get('customerProblem', '')} options={['Save time', 'Reduce costs', 'Increase sales', 'Reduce risk', 'Improve customer experience']} onChange={value => updateAnswer('customerProblem', value)} />
                <OptionalChoice label="Result customers want" value={get('vp', '')} options={['A faster process', 'Lower costs', 'More revenue', 'Fewer errors', 'Better visibility']} onChange={value => updateAnswer('vp', value)} />
                <OptionalChoice label="Common concern" value={get('objections', '')} options={['Too expensive', 'Not the right time', 'Already use another solution', 'Need approval', 'Not sure it will work']} onChange={value => updateAnswer('objections', value)} />
                <OptionalChoice label="Email tone" value={get('tone', '')} options={['Professional', 'Friendly', 'Direct', 'Warm and conversational']} onChange={value => updateAnswer('tone', value)} />
                <OptionalChoice label="When they may need you" value={get('timingSignal', '')} options={['Hiring', 'Expanding', 'Using manual processes', 'Using outdated tools', 'Recently funded', 'Entering a new market']} onChange={value => updateAnswer('timingSignal', value)} />
                <OptionalChoice label="Booking link" value={get('calLink', '')} options={['No booking link yet']} onChange={value => updateAnswer('calLink', value)} customPlaceholder="Paste your booking link" />
              </div>
              <div className="sf-hint" style={{ marginTop: 10 }}>You can skip every option here and add it later.</div>
            </div>
          </div>
        ) : (
          <div className="sum-panel active">
            <div className="prompt-box">{targetPrompt}</div>
          </div>
        )}
      </div>

      {saveError ? <div className="pdpa-banner" style={{ marginTop: 16 }}><span>{saveError}</span></div> : null}

      <div className="sum-actions">
        <button className="btn-outline" onClick={() => router.push('/onboarding')}>← Edit Answers</button>
        <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={openWorkspace} disabled={loading || saving}>
          {saving ? 'Saving...' : 'Open My Workspace →'}
        </button>
      </div>
    </div>
  );
}

function OptionalChoice({ label, value, options, onChange, customPlaceholder = 'Add your own answer' }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  customPlaceholder?: string;
}) {
  const known = !value || options.includes(value);
  return (
    <div className="ss-item">
      <div className="ss-key">{label}</div>
      <select className="sf-inp" value={known ? value : 'Other'} onChange={event => onChange(event.target.value === 'Other' ? 'Other' : event.target.value)}>
        <option value="">Skip for now</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
        <option value="Other">Other</option>
      </select>
      {(!known || value === 'Other') ? (
        <input className="sf-inp" style={{ marginTop: 8 }} value={value === 'Other' ? '' : value} onChange={event => onChange(event.target.value)} placeholder={customPlaceholder} />
      ) : null}
    </div>
  );
}
