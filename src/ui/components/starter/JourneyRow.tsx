'use client';
import { useState } from 'react';
import type { ActionStep, ActorRole, ItemState, JourneyStatus } from '@/src/engine/types';

export type Act = (itemId: string, actionId: string, value?: string) => Promise<boolean>;

export const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant';
const BUTTON = `min-h-11 rounded-[4px] px-4 font-medium ${FOCUS}`;
const PRIMARY = `${BUTTON} bg-heritage text-paper disabled:opacity-60`;
const QUIET = `${BUTTON} border border-[var(--hairline)] bg-paper text-heritage`;

/** Section 5.3: severity by darkness, weight, a word and a shape. Never a red or an amber. */
const LOOK: Record<JourneyStatus, { box: string; title: string; word: string }> = {
  'not-started': { box: 'border border-[var(--hairline)]', title: 'text-[var(--muted)]', word: 'Not started' },
  'in-progress': { box: 'border border-[var(--hairline)] border-l-[3px] border-l-heritage', title: '', word: 'In progress' },
  'action-required': { box: 'border border-[var(--hairline)] border-l-[3px] border-l-vibrant', title: 'font-semibold text-ink', word: 'Action required' },
  done: { box: 'border border-[var(--hairline)] border-l-[3px] border-l-racing', title: 'text-[var(--muted)]', word: 'Done' },
  skipped: { box: 'border border-dotted border-[var(--hairline)]', title: 'text-[var(--muted)]', word: 'Not for me' },
  cancelled: { box: 'bg-charcoal text-paper', title: '', word: 'Stopped' },
};

export function JourneyRow({ item, act, receipt, onReceipt, actingFor }: {
  item: ItemState; act: Act; receipt?: string; onReceipt: (itemId: string) => void;
  /** The starter's name when a Delegate is viewing (D12a.4). */
  actingFor?: string;
}) {
  const look = LOOK[item.status];
  const action = item.status === 'action-required' ? item.currentAction : undefined;
  const wordColour = item.status === 'cancelled' ? '' : 'text-[var(--muted)]';
  return (
    <li className={`rounded-[6px] px-4 py-3 ${look.box}`}>
      <div className="flex min-h-11 items-center justify-between gap-3">
        <span className={`flex items-center gap-2 ${look.title}`}>
          {item.status === 'not-started' && <Padlock />}
          {item.status === 'done' && <Tick />}
          {item.title}
        </span>
        <span className={`shrink-0 text-[15px] ${wordColour}`}>{look.word}</span>
      </div>
      {item.addedBy && <p className="text-[14px] text-[var(--muted)]">Added by {item.addedBy.name}</p>}
      {action && action.type !== 'provide' && <p className="mt-1">{action.label}</p>}
      {action && actingFor && action.starterOnly
        ? <p className="mt-2 text-[15px] text-[var(--muted)]">Waiting for {actingFor}</p>
        : action && <ActionControl item={item} act={act} onReceipt={onReceipt} />}
      {item.actions && item.actions.length > 0 && <Steps itemId={item.itemId} steps={item.actions} />}
      {receipt && <p className="mt-1 text-[15px] text-[var(--muted)]">Submitted {receipt}</p>}
      {!item.mandatory && (item.status === 'action-required' || item.status === 'in-progress') && (
        <button type="button" className={`${QUIET} mt-3`} onClick={() => void act(item.itemId, 'skip')}>
          Not for me
        </button>
      )}
    </li>
  );
}

const OWNER: Record<ActorRole, string | undefined> = {
  starter: undefined, 'line-manager': 'Your Line Manager', buddy: 'Your buddy', hr: 'HR',
};

/** The list stays in the markup when collapsed (hidden), so the toggle's aria-controls always resolves. */
export function Steps({ itemId, steps }: { itemId: string; steps: ActionStep[] }) {
  const [open, setOpen] = useState(false);
  const id = `steps-${itemId}`;
  return (
    <div className="mt-1">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
        className={`flex min-h-11 items-center text-[15px] text-[var(--muted)] underline underline-offset-2 ${FOCUS}`}>
        {open ? 'Hide steps' : `Show steps (${steps.length})`}
      </button>
      <ol id={id} hidden={!open} className="flex flex-col gap-2 pb-1 text-[15px]">
        {steps.map((st) => {
          const who = st.owner ? OWNER[st.owner] : undefined;
          const tone = st.state === 'current' ? 'font-semibold text-ink' : st.state === 'upcoming' ? 'text-[var(--muted)]' : '';
          return (
            <li key={st.id} data-state={st.state} aria-current={st.state === 'current' ? 'step' : undefined} className={`flex items-start gap-2 ${tone}`}>
              <span className="mt-0.5 flex w-4 shrink-0 justify-center">
                {st.state === 'done' ? <Tick /> : <span aria-hidden="true" className={`mt-1 size-2 rounded-full ${st.state === 'current' ? 'bg-vibrant' : 'border border-[var(--muted)]'}`} />}
              </span>
              <span>
                {st.label}
                {who && <span className="text-[var(--muted)]"> ({who})</span>}
                <span className="sr-only">{st.state === 'done' ? ', done' : st.state === 'current' ? ', current step' : ', upcoming'}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ActionControl({ item, act, onReceipt }: { item: ItemState; act: Act; onReceipt: (itemId: string) => void }) {
  const action = item.currentAction;
  const [busy, setBusy] = useState(false);
  const [field, setField] = useState('');
  if (!action) return null;
  const run = async (value?: string) => {
    setBusy(true);
    const ok = await act(item.itemId, action.id, value);
    setBusy(false);
    return ok;
  };

  switch (action.type) {
    case 'read':
      return (
        <button type="button" disabled={busy} className={`${PRIMARY} mt-3`} onClick={() => void run()}>
          Got it
        </button>
      );
    case 'task':
      if (action.owner !== 'starter') return null;
      return (
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            disabled={busy}
            checked={busy}
            className={`size-6 accent-[var(--heritage)] ${FOCUS}`}
            onChange={(e) => e.target.checked && void run()}
          />
          Mark as done
        </label>
      );
    case 'choose':
      return (
        <div role="group" aria-label={action.label} className="mt-3 flex flex-wrap gap-2">
          {(action.options ?? []).map((o) => (
            <button key={o} type="button" disabled={busy} className={QUIET} onClick={() => void run(o)}>
              {o}
            </button>
          ))}
        </div>
      );
    case 'provide':
      return (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            // D3a: the content is passed through once and never kept here; only a receipt line stays.
            void run(field).then((ok) => {
              setField('');
              if (ok) onReceipt(item.itemId);
            });
          }}
        >
          <label htmlFor={`provide-${item.itemId}`} className="text-[15px] text-[var(--muted)]">
            {action.label}
          </label>
          <input
            id={`provide-${item.itemId}`}
            required
            autoComplete="off"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className={`min-h-11 rounded-[4px] border border-[var(--hairline)] px-3 ${FOCUS}`}
          />
          <button type="submit" disabled={busy} className={PRIMARY}>
            Submit
          </button>
        </form>
      );
    default:
      return null;
  }
}

const Padlock = () => (
  <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="7" width="12" height="8" rx="1.5" />
    <path d="M4 7V4.5a3 3 0 0 1 6 0V7" />
  </svg>
);

const Tick = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--racing)" strokeWidth="2">
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
);
