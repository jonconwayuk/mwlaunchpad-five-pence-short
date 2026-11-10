'use client';
import { useState } from 'react';
import type { ItemState } from '@/src/engine/types';
import { useLiveState } from '@/src/lib/useLiveState';
import { STAGES, STAGE_LABEL, shortDate } from './format';
import { JourneyRow, type Act } from './JourneyRow';
import { WaitingCard } from './WaitingCard';

// The Blocked Flag only picks the card and is never shown. After wave C the server strips it for a
// starter, so a waiting item is also recognised by its Usual Range.
const isWaiting = (i: ItemState) => i.status === 'in-progress' && (i.blockedFlag || i.usualRange !== undefined);

export function StarterPreview() {
  const { state, refresh } = useLiveState('?as=starter');
  // shortcut: receipts live in the page only, lost on reload; upgrade when /api/state returns Provide receipts.
  const [receipts, setReceipts] = useState<Record<string, string>>({});

  if (!state) {
    return <main className="mx-auto max-w-[420px] px-5 py-8 text-[17px] text-[var(--muted)]">Loading your journeys</main>;
  }

  const { engineState: es, person, simulatedDate } = state;
  const act: Act = async (itemId, actionId, value) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId, actionId, value, actorPersonId: person.id }),
      });
      return res.ok; // a 404 or 501 before wave C stays quiet
    } catch {
      return false;
    } finally {
      void refresh().catch(() => undefined);
    }
  };

  const waiting = es.items.filter(isWaiting);
  const rest = es.items.filter((i) => !isWaiting(i));

  return (
    <main className="mx-auto max-w-[420px] px-5 pt-8 pb-16 text-[17px] leading-[1.55] text-ink">
      <header>
        <h1 className="font-serif text-[27px] leading-tight text-racing">{STAGE_LABEL[es.stage]}</h1>
        {waiting[0]?.waitingDays !== undefined && (
          <p className="mt-1 text-[15px] text-[var(--muted)]">Day {waiting[0].waitingDays} of your wait</p>
        )}
      </header>

      {waiting.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {waiting.map((i) => <WaitingCard key={i.itemId} item={i} />)}
        </div>
      )}

      {es.nextUp && <p className="mt-6 max-w-[62ch]">{es.nextUp.line}</p>}

      {STAGES.map((stage) => {
        const items = rest.filter((i) => i.stage === stage);
        if (items.length === 0) return null;
        return (
          <section key={stage} aria-labelledby={`stage-${stage}`} className="mt-8">
            <h2
              id={`stage-${stage}`}
              className={stage === es.stage ? 'sr-only' : 'mb-3 font-serif text-[21px] text-racing'}
            >
              {STAGE_LABEL[stage]}
            </h2>
            <ul className="flex flex-col gap-3">
              {items.map((i) => (
                <JourneyRow
                  key={i.itemId}
                  item={i}
                  act={act}
                  receipt={receipts[i.itemId]}
                  onReceipt={(id) => setReceipts((r) => ({ ...r, [id]: shortDate(simulatedDate) }))}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
