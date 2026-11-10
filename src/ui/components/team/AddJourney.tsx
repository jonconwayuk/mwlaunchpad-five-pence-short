'use client';
import { useState } from 'react';
import { FOCUS } from '@/src/ui/components/starter/JourneyRow';
import { STAGE_LABEL } from '@/src/ui/components/starter/format';
import { send, type TeamData, type TeamStarter } from './useTeam';

const FIELD = `min-h-[44px] w-full rounded border border-[var(--hairline)] bg-paper px-3 ${FOCUS}`;

/** Add a Journey (B2): library filtered by Journey tags, unlock Now or After a card, optional by default. */
export function AddJourney({ starter, viewerId, library, onDone }: {
  starter: TeamStarter; viewerId: string; library: NonNullable<TeamData['library']>; onDone: () => void;
}) {
  const onPathway = new Set(starter.engineState.items.map((i) => i.journeyId));
  const tagValues = [...new Set(library.flatMap((j) => Object.values(j.tags).filter((v): v is string => !!v)))].sort();
  const [tag, setTag] = useState('');
  const [journeyId, setJourneyId] = useState('');
  const [after, setAfter] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choices = library.filter((j) => !onPathway.has(j.id) && (!tag || Object.values(j.tags).includes(tag)));

  const confirm = async () => {
    setBusy(true);
    const err = await send('/api/additions', {
      personId: starter.person.id, journeyId, byPersonId: viewerId, mandatory,
      unlock: after.startsWith('c:') ? { kind: 'after-container', containerId: after.slice(2) } : after ? { kind: 'after', itemId: after } : { kind: 'now' },
    });
    setBusy(false);
    if (err) setError(err); else onDone();
  };

  return (
    <div className="mt-3 flex flex-col gap-3 rounded border border-[var(--hairline)] bg-[var(--paper-2)] p-4">
      <label className="flex flex-col gap-1 text-[15px]">Filter by tag
        <select className={FIELD} value={tag} onChange={(e) => { setTag(e.target.value); setJourneyId(''); }}>
          <option value="">All journeys</option>
          {tagValues.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[15px]">Journey
        <select className={FIELD} value={journeyId} onChange={(e) => setJourneyId(e.target.value)}>
          <option value="">Choose a journey</option>
          {choices.map((j) => <option key={j.id} value={j.id}>{j.title} ({STAGE_LABEL[j.stage]})</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[15px]">Unlock
        <select className={FIELD} value={after} onChange={(e) => setAfter(e.target.value)}>
          <option value="">Now</option>
          {starter.engineState.containers.map((c) => <option key={c.containerId} value={`c:${c.containerId}`}>After {c.label}</option>)}
          {starter.engineState.items.map((i, _, all) => {
            // Repeated Journeys (Pulse check) share a title, so number them in Pathway order.
            const twins = all.filter((x) => x.title === i.title);
            const n = twins.length > 1 ? ` (${twins.indexOf(i) + 1} of ${twins.length})` : '';
            return <option key={i.itemId} value={i.itemId}>After {i.title}{n}</option>;
          })}
        </select>
      </label>
      <label className="flex min-h-[44px] items-center gap-3 text-[15px]">
        <input type="checkbox" className={`h-5 w-5 accent-[var(--heritage)] ${FOCUS}`} checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} />
        Mandatory
      </label>
      {error && <p role="alert" className="text-[15px] text-ink">{error}</p>}
      <button type="button" disabled={!journeyId || busy} onClick={() => void confirm()}
        className={`min-h-[44px] rounded bg-heritage px-4 font-semibold text-paper disabled:opacity-50 ${FOCUS}`}>
        Confirm
      </button>
    </div>
  );
}
