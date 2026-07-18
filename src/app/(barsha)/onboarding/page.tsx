'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApolloFilters, getTargetSuggestions, getWorkspace, saveOnboarding, saveOnboardingDraft } from '@/lib/api';

type StepType = 'text' | 'textarea' | 'select' | 'choice' | 'tags' | 'range';

interface Choice { i: string; l: string; s: string; }

interface Step {
  cat: string;
  q: string;
  hint: string;
  type: StepType;
  placeholder?: string;
  key: string;
  options?: string[];
  choices?: Choice[];
  tags?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

const STEPS: Step[] = [
  { cat: 'Business', q: 'What is the name of your business?', hint: 'We use this as your workspace and sender identity.', type: 'text', placeholder: 'e.g. Apex Solutions Pte Ltd', key: 'company' },
  { cat: 'Find customers', q: 'What do you sell?', hint: 'Use everyday language. For example: accounting software for small companies.', type: 'textarea', placeholder: 'Describe your main product or service...', key: 'product' },
  { cat: 'Find customers', q: 'Who usually buys it?', hint: 'Choose common buyers and add your own role if needed.', type: 'tags', tags: ['Founder / CEO', 'Operations', 'Sales', 'Marketing', 'Finance', 'IT', 'Procurement', 'HR / People'], key: 'titles' },
  { cat: 'Find customers', q: 'Which industry should we search?', hint: 'Choose an Apollo industry or type a more specific market. This helps your agent focus on the right companies.', type: 'text', placeholder: 'e.g. information technology & services', key: 'industry' },
  { cat: 'Find customers', q: 'Where are the customers you want to reach?', hint: 'Choose a common market or enter any city, region, or country.', type: 'choice', choices: [{ i: '🇸🇬', l: 'Singapore', s: 'Singapore only' }, { i: '🌏', l: 'Southeast Asia', s: 'Regional customers' }, { i: '🌍', l: 'Worldwide', s: 'No regional restriction' }, { i: '✎', l: 'Other', s: 'Add your own location' }], key: 'region' },
  { cat: 'Find customers', q: 'What size company is usually a good fit?', hint: 'Choose the closest option or add your own.', type: 'choice', choices: [{ i: '🌱', l: '1–20', s: 'Very small businesses' }, { i: '📈', l: '21–200', s: 'Growing companies' }, { i: '🏗️', l: '201–1000', s: 'Mid-market' }, { i: '🏦', l: '1000+', s: 'Enterprise' }, { i: '✎', l: 'Other', s: 'Add your own range' }], key: 'companySize' },
];

type Answers = Record<string, string | string[] | number>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [apolloIndustryOptions, setApolloIndustryOptions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const current = STEPS[step];
  const pct = Math.round((step / STEPS.length) * 100);
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    setTimeout(() => {
      if (current.type === 'text') inputRef.current?.focus();
      if (current.type === 'textarea') textareaRef.current?.focus();
    }, 80);
  }, [step, current.type]);

  useEffect(() => {
    Promise.all([getWorkspace(), getApolloFilters()])
      .then(([data, apollo]) => {
        if (data.agentConfig?.raw_answers) {
          setAnswers(data.agentConfig.raw_answers);
        }
        setApolloIndustryOptions(apollo.industryOptions);
        if (!data.workspace.onboarding_completed && data.workspace.onboarding_step > 0) {
          setStep(Math.min(data.workspace.onboarding_step, STEPS.length - 1));
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  async function saveDraft(nextStep: number) {
    setDraftStatus('Saving...');
    await saveOnboardingDraft(answers, nextStep);
    setDraftStatus('Saved');
  }

  async function next() {
    setError('');

    const value = answers[current.key];
    if ((value === undefined || value === '' || (Array.isArray(value) && !value.length)) && !answers[`${current.key}Custom`]) {
      setError('Please choose an option or add your own answer.');
      return;
    }
    if (value === 'Other' && !String(answers[`${current.key}Custom`] || '').trim()) {
      setError('Please add your custom answer.');
      return;
    }

    if (isLast) {
      setSaving(true);
      try {
        sessionStorage.setItem('barsha_answers', JSON.stringify(answers));
        await saveOnboarding(answers);
        router.push('/summary');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save onboarding.');
      } finally {
        setSaving(false);
      }
    } else {
      const nextStep = step + 1;
      setSaving(true);
      try {
        await saveDraft(nextStep);
        setStep(nextStep);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save progress.');
      } finally {
        setSaving(false);
      }
    }
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  function setAnswer(key: string, val: string | string[] | number) {
    setAnswers(prev => ({ ...prev, [key]: val }));
  }

  function toggleTag(tag: string) {
    const current = (answers[STEPS[step].key] as string[]) || [];
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setAnswer(STEPS[step].key, next);
  }

  async function suggestRoles() {
    setSuggestionMessage('Finding role suggestions...');
    try {
      const data = await getTargetSuggestions({ product: String(answers.product || ''), buyer: String(answers.titlesCustom || '') });
      setSuggestedTitles(data.suggestions.titles);
      setSuggestionMessage(data.suggestions.consumer_warning
        ? 'This looks consumer-focused. Apollo works best for business buyers such as partners, agencies, or corporate customers.'
        : data.suggestions.explanation);
    } catch (error) {
      setSuggestionMessage(error instanceof Error ? error.message : 'Could not suggest roles. You can still add your own.');
    }
  }

  function renderInput() {
    const s = current;
    const val = answers[s.key];

    if (s.type === 'text') {
      return (
        <>
          <input
            ref={inputRef}
            className="ob-inp"
            type="text"
            placeholder={s.placeholder}
            value={(val as string) || ''}
            onChange={e => setAnswer(s.key, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') next(); }}
            list={s.key === 'industry' ? 'apollo-onboarding-industry-options' : undefined}
          />
          {s.key === 'industry' ? (
            <datalist id="apollo-onboarding-industry-options">
              {apolloIndustryOptions.map(industry => <option key={industry} value={industry} />)}
            </datalist>
          ) : null}
        </>
      );
    }

    if (s.type === 'textarea') {
      return (
        <textarea
          ref={textareaRef}
          className="ob-ta"
          placeholder={s.placeholder}
          value={(val as string) || ''}
          onChange={e => setAnswer(s.key, e.target.value)}
        />
      );
    }

    if (s.type === 'select') {
      return (
        <select
          className="ob-sel"
          value={(val as string) || ''}
          onChange={e => setAnswer(s.key, e.target.value)}
        >
          <option value="">Choose one...</option>
          {s.options!.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }

    if (s.type === 'choice') {
      return (
        <div>
        <div className="choice-grid">
          {s.choices!.map(c => (
            <button
              key={c.l}
              className={`choice-btn${val === c.l ? ' selected' : ''}`}
              onClick={() => setAnswer(s.key, c.l)}
            >
              <span className="ci">{c.i}</span>
              <span className="cl">{c.l}</span>
              <span className="cs">{c.s}</span>
            </button>
          ))}
        </div>
        {val === 'Other' ? <input className="ob-inp" value={String(answers[`${s.key}Custom`] || '')} onChange={e => setAnswer(`${s.key}Custom`, e.target.value)} placeholder="Add your own answer" /> : null}
        </div>
      );
    }

    if (s.type === 'tags') {
      const selected = (val as string[]) || [];
      return (
        <div>
        <div className="tags-wrap">
          {s.tags!.map(t => (
            <button
              key={t}
              className={`tag-btn${selected.includes(t) ? ' selected' : ''}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {suggestedTitles.length ? <div className="tags-wrap">{suggestedTitles.map(t => <button key={t} className={`tag-btn${selected.includes(t) ? ' selected' : ''}`} onClick={() => toggleTag(t)}>{t}</button>)}</div> : null}
        <input className="ob-inp" value={String(answers[`${s.key}Custom`] || '')} onChange={e => setAnswer(`${s.key}Custom`, e.target.value)} placeholder="Other role, e.g. Fleet Manager" />
        <button className="btn-outline" type="button" onClick={suggestRoles} disabled={!answers.product}>Suggest roles for my business</button>
        {suggestionMessage ? <div className="ob-hint">{suggestionMessage}</div> : null}
        </div>
      );
    }

    if (s.type === 'range') {
      const numVal = (val as number) !== undefined ? (val as number) : Math.floor(s.max! / 5);
      return (
        <div className="range-wrap">
          <div className="range-display">
            <div className="range-val">{numVal}</div>
            <div className="range-unit">{s.unit}</div>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            value={numVal}
            onChange={e => setAnswer(s.key, Number(e.target.value))}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="screen active" id="onboarding">
      <div className="ob-header">
        <div className="ob-logo">CircleOn<small>Singapore</small></div>
        <div className="prog-wrap">
          <div className="prog-lbl">
            <span>{current.cat}</span>
            <span>{pct}%</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="ob-cnt">Step {step + 1} of {STEPS.length}</div>
      </div>
      <div className="ob-body">
        <div className="ob-card">
          <div className="ob-top">
            <div className="ob-cat-lbl"><span className="ob-cat-dot" />{current.cat}</div>
            <div className="ob-q">{current.q}</div>
            <div className="ob-hint">{current.hint}</div>
          </div>
          <div className="ob-body-area">
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}
            {renderInput()}
          </div>
          <div className="ob-nav">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>{draftStatus}</div>
            <button
              className="btn-back"
              onClick={prev}
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>
            <button className="btn-next" onClick={next} disabled={saving}>
              {isLast ? (
                <>
                  {saving ? 'Saving Agent...' : 'Build My Agent'}{' '}
                  {!saving && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  )}
                </>
              ) : (
                <>
                  {saving ? 'Saving...' : 'Continue'}{' '}
                  {!saving && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
