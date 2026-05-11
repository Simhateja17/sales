'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  { cat: 'Business Basics', q: 'What is the name of your business?', hint: "This will be used as your agent's identity when speaking to leads.", type: 'text', placeholder: 'e.g. Apex Solutions Pte Ltd', key: 'company' },
  { cat: 'Business Basics', q: 'Which industry are you in?', hint: 'Helps us pull the right leads from Apollo.', type: 'select', options: ['SaaS / Software', 'Logistics & Supply Chain', 'Financial Services / FinTech', 'Healthcare / MedTech', 'E-Commerce / Retail', 'Legal / Consulting', 'Real Estate / PropTech', 'Education / EdTech', 'Manufacturing', 'Other'], key: 'industry' },
  { cat: 'Business Basics', q: 'What city are you based in?', hint: 'Used for your caller ID and local context on calls.', type: 'text', placeholder: 'e.g. Singapore, Jurong East', key: 'city' },
  { cat: 'Business Basics', q: 'Describe what your business does in 2–3 sentences.', hint: 'Your agent will use this to explain your company to every prospect.', type: 'textarea', placeholder: 'e.g. We help mid-sized logistics companies automate last-mile delivery tracking...', key: 'desc' },
  { cat: 'Sales Model', q: 'Is your business B2B or B2C?', hint: 'This shapes how your agent speaks and who it targets.', type: 'choice', choices: [{ i: '🏢', l: 'B2B', s: 'You sell to businesses' }, { i: '👥', l: 'B2C', s: 'You sell to individual customers' }, { i: '🔀', l: 'Both', s: 'Mixed model' }], key: 'bizType' },
  { cat: 'Sales Model', q: 'Who should your agent call?', hint: 'Select every decision-maker title that matters for your sales.', type: 'tags', tags: ['CEO / Founder', 'MD / Director', 'VP of Operations', 'VP of Sales', 'Head of Finance', 'Procurement Manager', 'IT Manager', 'Marketing Head', 'Business Owner'], key: 'titles' },
  { cat: 'Target Market', q: 'Which cities or regions should your agent target?', hint: 'Apollo will pull leads from these locations only.', type: 'text', placeholder: 'e.g. Singapore, Kuala Lumpur, Jakarta', key: 'region' },
  { cat: 'Target Market', q: 'What size of companies should your agent target?', hint: "We'll use this to filter leads by company headcount.", type: 'choice', choices: [{ i: '🌱', l: '1–20', s: 'Very small businesses' }, { i: '📈', l: '21–200', s: 'SMEs & growing startups' }, { i: '🏗️', l: '201–1000', s: 'Mid-market' }, { i: '🏦', l: '1000+', s: 'Enterprise' }], key: 'companySize' },
  { cat: 'Target Market', q: "Minimum monthly revenue (MRR) you'd like leads to have?", hint: 'Helps qualify leads before calling. Set to 0 to skip.', type: 'range', min: 0, max: 100, unit: 'k SGD/mo', key: 'mrr' },
  { cat: 'Your Offer', q: 'What is your main product or service?', hint: 'Be specific — your agent will pitch this directly.', type: 'text', placeholder: 'e.g. AI-powered inventory management software', key: 'product' },
  { cat: 'Your Offer', q: 'What is your pricing or engagement model?', hint: 'Helps the agent set the right expectations on calls.', type: 'select', options: ['Monthly subscription (SaaS)', 'Annual contract', 'Project-based / one-time', 'Retainer / ongoing service', 'Free trial then paid', 'Custom / enterprise pricing'], key: 'pricing' },
  { cat: 'Your Offer', q: 'What is the single biggest result your customers get?', hint: 'Your agent will use this as the core value proposition.', type: 'textarea', placeholder: 'e.g. Our clients typically reduce logistics costs by 30% within the first 3 months...', key: 'vp' },
  { cat: 'Objections & FAQs', q: 'What are the top 3 objections prospects give you?', hint: 'Your agent will be trained to handle these on live calls.', type: 'textarea', placeholder: '1. Too expensive\n2. We already have a solution\n3. Not the right time', key: 'objections' },
  { cat: 'Capacity', q: 'How many new clients can you handle per month?', hint: "We'll pace your agent's calling to match your real capacity.", type: 'range', min: 1, max: 100, unit: 'clients/mo', key: 'capacity' },
  { cat: 'Meeting Booking', q: 'What is your Calendly or booking link?', hint: 'Your agent will share this with interested prospects to book immediately.', type: 'text', placeholder: 'https://calendly.com/yourname', key: 'calLink' },
  { cat: 'Agent Personality', q: 'What tone should your agent use?', hint: 'This sets the personality of how your agent speaks.', type: 'choice', choices: [{ i: '💼', l: 'Professional', s: 'Formal, polished' }, { i: '😊', l: 'Friendly', s: 'Warm, approachable' }, { i: '🔥', l: 'Bold & Direct', s: 'Confident, no fluff' }, { i: '🧠', l: 'Consultative', s: 'Advisory, educational' }], key: 'tone' },
  { cat: 'Agent Identity', q: "What should your agent's name be?", hint: 'This is the name it will introduce itself as on every call.', type: 'text', placeholder: 'e.g. Aria, Maya, Jamie', key: 'agentName' },
];

type Answers = Record<string, string | string[] | number>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
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

  function next() {
    if (isLast) {
      sessionStorage.setItem('barsha_answers', JSON.stringify(answers));
      router.push('/summary');
    } else {
      setStep(s => s + 1);
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

  function renderInput() {
    const s = current;
    const val = answers[s.key];

    if (s.type === 'text') {
      return (
        <input
          ref={inputRef}
          className="ob-inp"
          type="text"
          placeholder={s.placeholder}
          value={(val as string) || ''}
          onChange={e => setAnswer(s.key, e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') next(); }}
        />
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
      );
    }

    if (s.type === 'tags') {
      const selected = (val as string[]) || [];
      return (
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
        <div className="ob-logo">Barsha AI <small>Singapore</small></div>
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
            {renderInput()}
          </div>
          <div className="ob-nav">
            <button
              className="btn-back"
              onClick={prev}
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>
            <button className="btn-next" onClick={next}>
              {isLast ? (
                <>
                  Build My Agent{' '}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                </>
              ) : (
                <>
                  Continue{' '}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
