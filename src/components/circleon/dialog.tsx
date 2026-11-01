'use client';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// In-app replacements for window.confirm and window.prompt, styled like the
// rest of CircleOn instead of the browser's "www.circleon.ai says" box.
// Both can be awaited from any event handler without a provider.

interface BaseOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Destructive actions get a red button and focus Cancel by default.
  danger?: boolean;
}

interface PromptOptions extends BaseOptions {
  inputType?: 'text' | 'datetime-local';
  defaultValue?: string;
  placeholder?: string;
  // Confirm stays disabled until the input matches this exactly (case-insensitive).
  mustMatch?: string;
}

interface DialogProps extends PromptOptions {
  withInput: boolean;
  onDone: (result: string | null) => void;
}

function Dialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, withInput, inputType = 'text', defaultValue = '', placeholder, mustMatch, onDone }: DialogProps) {
  const [value, setValue] = useState(defaultValue);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canConfirm = !withInput || (mustMatch ? value.trim().toLowerCase() === mustMatch.trim().toLowerCase() : value.trim() !== '');

  useEffect(() => {
    if (withInput) inputRef.current?.focus();
    else if (danger) cancelRef.current?.focus();
    else confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onDone(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [danger, onDone, withInput]);

  const confirm = () => { if (canConfirm) onDone(withInput ? value : ''); };

  return (
    <div className="modal-backdrop" role="presentation" style={{ zIndex: 1000 }} onMouseDown={() => onDone(null)}>
      <section className="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="co-dialog-title" style={{ width: 'min(460px, 100%)', padding: 24 }} onMouseDown={event => event.stopPropagation()}>
        <div id="co-dialog-title" className="card-title" style={{ fontSize: 18 }}>{title}</div>
        {message ? <p className="sf-hint" style={{ marginTop: 10, lineHeight: 1.6, fontSize: 14 }}>{message}</p> : null}
        {withInput ? (
          <input
            ref={inputRef}
            className="sf-inp"
            style={{ marginTop: 14, width: '100%' }}
            type={inputType}
            value={value}
            placeholder={placeholder}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); confirm(); } }}
          />
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button ref={cancelRef} className="btn-outline" type="button" onClick={() => onDone(null)}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            className="btn-primary"
            type="button"
            disabled={!canConfirm}
            style={danger ? { background: '#b42318', borderColor: '#b42318' } : undefined}
            onClick={confirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function open(options: PromptOptions, withInput: boolean): Promise<string | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise(resolve => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const previousFocus = document.activeElement as HTMLElement | null;
    const onDone = (result: string | null) => {
      root.unmount();
      host.remove();
      previousFocus?.focus?.();
      resolve(result);
    };
    root.render(<Dialog {...options} withInput={withInput} onDone={onDone} />);
  });
}

export async function confirmDialog(options: BaseOptions): Promise<boolean> {
  return (await open(options, false)) !== null;
}

export function promptDialog(options: PromptOptions): Promise<string | null> {
  return open(options, true);
}
