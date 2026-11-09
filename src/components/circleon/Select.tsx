'use client';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const MENU_MAX_HEIGHT = 280;
const MENU_MIN_WIDTH = 180;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;

// The menu is portalled to <body> and fixed to the viewport so scrolling drawers
// and modals cannot clip it. It stays attached to its trigger while they scroll.
function useAnchoredMenuStyle(open: boolean, anchorRef: RefObject<HTMLElement | null>) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN;
      const openUp = spaceBelow < Math.min(MENU_MAX_HEIGHT, 160) && spaceAbove > spaceBelow;
      const width = Math.max(rect.width, MENU_MIN_WIDTH);
      setStyle({
        position: 'fixed',
        left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN)),
        width,
        maxHeight: Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
        ...(openUp ? { bottom: window.innerHeight - rect.top + MENU_GAP } : { top: rect.bottom + MENU_GAP }),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorRef]);

  return style;
}

// Capture phase: drawers and modals stop mousedown propagation on their panels,
// which would otherwise hide an outside click from a bubbling document listener.
function useOutsidePress(open: boolean, refs: RefObject<HTMLElement | null>[], onOutside: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!refs.some(ref => ref.current?.contains(target))) onOutside();
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open, refs, onOutside]);
}

function useScrollActiveIntoView(listRef: RefObject<HTMLUListElement | null>, active: number) {
  useEffect(() => {
    if (active < 0) return;
    const option = listRef.current?.children[active] as HTMLElement | undefined;
    option?.scrollIntoView({ block: 'nearest' });
  }, [listRef, active]);
}

function Caret() {
  return (
    <svg className="ui-select-caret" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

export default function Select({ value, options, onChange, className, disabled, placeholder = 'Select…', 'aria-label': ariaLabel }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const listId = useId();
  const menuStyle = useAnchoredMenuStyle(open, triggerRef);
  const pressRefs = useMemo(() => [triggerRef, listRef], []);
  const close = useCallback(() => setOpen(false), []);
  useOutsidePress(open, pressRefs, close);
  useScrollActiveIntoView(listRef, open ? active : -1);

  const selected = options.find(option => option.value === value);

  const openMenu = () => {
    const current = options.findIndex(option => option.value === value && !option.disabled);
    setActive(current >= 0 ? current : options.findIndex(option => !option.disabled));
    setOpen(true);
  };

  const pick = (option: SelectOption) => {
    if (option.disabled) return;
    if (option.value !== value) onChange(option.value);
    setOpen(false);
  };

  const step = (from: number, direction: 1 | -1) => {
    for (let index = from + direction; index >= 0 && index < options.length; index += direction) {
      if (!options[index].disabled) return index;
    }
    return from;
  };

  const jumpToTyped = (key: string) => {
    const now = Date.now();
    const text = now - typeahead.current.at > 600 ? key : typeahead.current.text + key;
    typeahead.current = { text, at: now };
    const match = options.findIndex(option => !option.disabled && option.label.toLowerCase().startsWith(text.toLowerCase()));
    if (match >= 0) setActive(match);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(current => step(current, 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(current => step(current, -1)); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(step(-1, 1)); }
    else if (event.key === 'End') { event.preventDefault(); setActive(step(options.length, -1)); }
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (options[active]) pick(options[active]);
    } else if (event.key === 'Escape') {
      // Closes only this menu, not the drawer or modal listening on window.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      jumpToTyped(event.key);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`ui-select${className ? ` ${className}` : ''}${open ? ' is-open' : ''}`}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => { if (open) setOpen(false); else openMenu(); }}
        onKeyDown={onKeyDown}
      >
        <span className={`ui-select-value${selected ? '' : ' is-placeholder'}`}>{selected ? selected.label : placeholder}</span>
        <Caret />
      </button>
      {open ? createPortal(
        <ul
          id={listId}
          ref={listRef}
          className="ui-select-menu"
          role="listbox"
          style={menuStyle}
          onMouseDown={event => { event.preventDefault(); event.stopPropagation(); }}
          onClick={event => event.stopPropagation()}
        >
          {options.map((option, index) => (
            <li
              key={`${option.value}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              className={`ui-select-option${index === active ? ' is-active' : ''}${option.value === value ? ' is-selected' : ''}${option.disabled ? ' is-disabled' : ''}`}
              onMouseEnter={() => { if (!option.disabled) setActive(index); }}
              onClick={() => pick(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>,
        document.body,
      ) : null}
    </>
  );
}

const MAX_VISIBLE_SUGGESTIONS = 50;

interface SuggestInputProps {
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

// Free-text input with suggestions. Replaces <datalist>, whose popup the browser
// draws itself and which cannot be styled.
export function SuggestInput({ value, suggestions, onChange, className, placeholder, required }: SuggestInputProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return suggestions.slice(0, MAX_VISIBLE_SUGGESTIONS);
    const starts = suggestions.filter(item => item.toLowerCase().startsWith(query));
    const contains = suggestions.filter(item => !item.toLowerCase().startsWith(query) && item.toLowerCase().includes(query));
    return [...starts, ...contains].slice(0, MAX_VISIBLE_SUGGESTIONS);
  }, [value, suggestions]);

  const showList = open && filtered.length > 0;
  const menuStyle = useAnchoredMenuStyle(showList, wrapRef);
  const pressRefs = useMemo(() => [wrapRef, listRef], []);
  const close = useCallback(() => setOpen(false), []);
  useOutsidePress(showList, pressRefs, close);
  useScrollActiveIntoView(listRef, showList ? active : -1);

  const pick = (item: string) => {
    onChange(item);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive(current => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(current => Math.max(current - 1, 0));
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Enter' && showList && active >= 0) {
      // Without a highlighted suggestion, Enter still submits the form as usual.
      event.preventDefault();
      pick(filtered[active]);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="ui-suggest" ref={wrapRef}>
      <input
        className={className}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        value={value}
        onClick={() => setOpen(true)}
        onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className={`ui-suggest-caret${showList ? ' is-open' : ''}`}
        aria-label="Show suggestions"
        tabIndex={-1}
        onMouseDown={event => event.preventDefault()}
        onClick={() => setOpen(current => !current)}
      >
        <Caret />
      </button>
      {showList ? createPortal(
        <ul
          id={listId}
          ref={listRef}
          className="ui-select-menu"
          role="listbox"
          style={menuStyle}
          onMouseDown={event => { event.preventDefault(); event.stopPropagation(); }}
          onClick={event => event.stopPropagation()}
        >
          {filtered.map((item, index) => (
            <li
              key={item}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={item === value}
              className={`ui-select-option${index === active ? ' is-active' : ''}${item === value ? ' is-selected' : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(item)}
            >
              {item}
            </li>
          ))}
        </ul>,
        document.body,
      ) : null}
    </div>
  );
}
