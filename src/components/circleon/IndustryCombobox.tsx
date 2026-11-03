'use client';
import { useEffect, useMemo, useRef, useState, type Ref } from 'react';

interface Props {
  value: string;
  options: string[];
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function IndustryCombobox({ value, options, placeholder, inputRef, onChange, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter(o => o.toLowerCase().startsWith(q));
    const contains = options.filter(o => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [value, options]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (active < 0 || !listRef.current) return;
    const el = listRef.current.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const pick = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setActive(-1);
  };

  const showList = open && filtered.length > 0;

  return (
    <div className="ob-combo" ref={wrapRef}>
      <input
        ref={inputRef}
        className="ob-inp"
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onClick={() => setOpen(true)}
        onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive(a => Math.min(a + 1, filtered.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(a => Math.max(a - 1, 0));
          } else if (e.key === 'Escape') {
            setOpen(false);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (showList && active >= 0) pick(filtered[active]);
            else { setOpen(false); onSubmit(); }
          }
        }}
      />
      <button
        type="button"
        className={`ob-combo-caret${showList ? ' open' : ''}`}
        aria-label="Show industries"
        tabIndex={-1}
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {showList ? (
        <ul className="ob-combo-list" role="listbox" ref={listRef}>
          {filtered.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={i === active}
              className={`ob-combo-opt${i === active ? ' active' : ''}${opt === value ? ' selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => { e.preventDefault(); pick(opt); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
