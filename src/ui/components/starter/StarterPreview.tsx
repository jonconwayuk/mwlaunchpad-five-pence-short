'use client';
import { useState } from 'react';
import type { ItemState } from '@/src/engine/types';
import { useLiveState } from '@/src/lib/useLiveState';
import { STAGES, STAGE_LABEL, shortDate } from './format';
import { JourneyRow, type Act } from './JourneyRow';
import { WaitingCard } from './WaitingCard';
import { LatestNotification, Reminders } from './Reminders';
import { HelpChat } from '@/src/ui/components/chat/HelpChat';

// The Blocked Flag only picks the card and is never shown. After wave C the server strips it for a
// starter, so a waiting item is also recognised by its Usual Range.
const isWaiting = (i: ItemState) => i.status === 'in-progress' && (i.blockedFlag || i.usualRange !== undefined);

const PAGE = 'mx-auto w-full max-w-[420px] px-5 pt-8 pb-16 text-[17px] leading-[1.55] text-ink @5xl:max-w-[1080px] @5xl:px-10';

/** Before HR applies a Pathway, /api/state answers 404: a calm welcome, never an endless Loading. */
export function NoPlan({ firstName, personId }: { firstName: string; personId: string }) {
  return (
    <main className={PAGE}>
      <div className="@5xl:grid @5xl:grid-cols-[minmax(0,1fr)_360px] @5xl:gap-12">
        <div>
          <h1 className="font-serif text-[27px] leading-tight text-racing">Welcome, {firstName}.</h1>
          <p className="mt-3 max-w-[52ch]">HR is getting your plan ready. You do not need to do anything yet; it will appear here as soon as it is ready.</p>
        </div>
        <div className="mt-8 @5xl:mt-0"><HelpChat personId={personId} /></div>
      </div>
    </main>
  );
}

export const ActingFor = ({ name }: { name: string }) => (
  <p role="status" className="mb-6 rounded-[6px] bg-calm px-4 py-2 text-[15px] font-medium">Acting for {name}</p>
);

export function StarterPreview({ query = '?as=starter', personId, firstName = 'there', actorPersonId }: {
  query?: string; personId: string; firstName?: string; actorPersonId?: string;
}) {
  const { state, loading, refresh } = useLiveState(query);
  // shortcut: receipts live in the page only, lost on reload; upgrade when /api/state returns Provide receipts.
  const [receipts, setReceipts] = useState<Record<string, string>>({});

  if (!state && loading) {
    return <main className={`${PAGE} text-[var(--muted)]`}>Loading your journeys</main>;
  }
  // A 404 (no Applied Pathway yet) or any other failure on the first load reads as the calm welcome.
  if (!state) return <NoPlan firstName={firstName} personId={personId} />;

  const { engineState: es, person, simulatedDate } = state;
  const actingFor = (es as typeof es & { actingFor?: string }).actingFor;
  const act: Act = async (itemId, actionId, value) => {
    try {
      const res = await fetch(`/api/actions${actingFor ? '?as=delegate' : ''}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId, actionId, value, actorPersonId: actorPersonId ?? person.id, personId: person.id }),
      });
      return res.ok; // a 404 or 501 before wave C stays quiet
    } catch {
      return false;
    } finally {
      void refresh().catch(() => undefined);
    }
  };

  // The server applies D2f.4 for the starter: Failed items are masked while pending, `stopped` after Confirm.
  if ((es as typeof es & { stopped?: boolean }).stopped) {
    return (
      <main className={PAGE}>
        <p className="font-serif text-[21px] text-racing">Your recruiter will be in touch.</p>
      </main>
    );
  }
  const waiting = es.items.filter(isWaiting);
  const rest = es.items.filter((i) => !isWaiting(i));

  return (
    <main className={PAGE}>
      <LatestNotification notifications={es.notifications} />
      {actingFor && <ActingFor name={actingFor} />}
      <header>
        <h1 className="font-serif text-[27px] leading-tight text-racing">{STAGE_LABEL[es.stage]}</h1>
        {waiting[0]?.waitingDays !== undefined && (
          <p className="mt-1 text-[15px] text-[var(--muted)]">Day {waiting[0].waitingDays} of your wait</p>
        )}
        {(state as typeof state & { basedOn?: string }).basedOn && <p className="mt-1 text-[15px] text-[var(--muted)]">{(state as typeof state & { basedOn?: string }).basedOn}</p>}
      </header>

      {/* Phone: one column in DOM order, help first so it is never held behind Actions. Desktop: the plan on the left, help and waiting card on the right. */}
      <div className="@5xl:grid @5xl:grid-cols-[minmax(0,1fr)_360px] @5xl:grid-rows-[auto_1fr] @5xl:items-start @5xl:gap-x-12">
        <div className="mt-6 flex flex-col gap-4 @5xl:col-start-2 @5xl:row-start-1">
          <HelpChat personId={person.id} />
          {waiting.map((i) => <WaitingCard key={i.itemId} item={i} />)}
        </div>

        <div className="@5xl:col-start-1 @5xl:row-span-2 @5xl:row-start-1">
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
                      actingFor={actingFor}
                      receipt={receipts[i.itemId]}
                      onReceipt={(id) => setReceipts((r) => ({ ...r, [id]: shortDate(simulatedDate) }))}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-8 @5xl:col-start-2 @5xl:row-start-2">
          <Reminders notifications={es.notifications} />
        </div>
      </div>
    </main>
  );
}
