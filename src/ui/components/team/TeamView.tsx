'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NeedsDecision } from '@/src/engine/types';
import { FOCUS } from '@/src/ui/components/starter/JourneyRow';
import { shortDate } from '@/src/ui/components/starter/format';
import { AddJourney } from './AddJourney';
import { SendReminder } from './SendReminder';
import { progressSummary } from './summary';
import { send, useTeam, type TeamData, type TeamRole, type TeamStarter } from './useTeam';

const BTN = `min-h-[44px] rounded px-4 font-semibold ${FOCUS}`;
const NO_PLAN = 'No plan yet — HR will apply one';

export function TeamView({ viewerId, as }: { viewerId: string; as: TeamRole }) {
  const router = useRouter();
  const { data, error, refresh } = useTeam(viewerId, as);
  const reload = () => void refresh().catch(() => undefined);

  return (
    // Container queries, not media queries: the phone frame in the top strip is a 390px box on a wide window.
    <div className="@container">
      <main className="mx-auto max-w-[420px] px-5 pt-6 pb-16 text-[17px] leading-[1.55] text-ink @4xl:max-w-[1200px] @4xl:px-8">
        <label className="flex items-center gap-3 text-[15px] text-[var(--muted)] @4xl:max-w-[420px]">Viewing as
          <select className={`min-h-[44px] min-w-0 flex-1 rounded border border-[var(--hairline)] bg-paper px-3 text-ink ${FOCUS}`}
            value={viewerId} onChange={(e) => router.push(`/team?viewer=${e.target.value}`)}>
            {(data?.viewers ?? [{ id: viewerId, name: viewerId, role: as }]).map((v) => (
              <option key={v.id} value={v.id}>{v.name}, {v.role === 'buddy' ? 'Buddy' : 'Line Manager'}</option>
            ))}
          </select>
        </label>
        {error && <p role="alert" className="mt-6">{error}</p>}
        {!data ? <p className="mt-8 text-[var(--muted)]">Loading your team</p> : <Team data={data} reload={reload} />}
      </main>
    </div>
  );
}

function Team({ data, reload }: { data: TeamData; reload: () => void }) {
  const { viewer, starters, tasks, noPlan, handovers } = data;
  const isLm = viewer.role === 'line-manager';
  const [taskError, setTaskError] = useState<string | null>(null);
  const everyone = [...starters.map((s) => ({ id: s.person.id, name: s.person.name, s })), ...noPlan.map((p) => ({ ...p, s: undefined }))];
  const [picked, setPicked] = useState<string | null>(null);
  const selected = everyone.some((e) => e.id === picked) ? picked : everyone[0]?.id;
  // On a phone every starter is listed in turn; from 896px the list sits beside the selected starter.
  const shown = (id: string) => (id === selected ? '' : '@4xl:hidden');
  return (
    <div className="@4xl:mt-2 @4xl:grid @4xl:grid-cols-[minmax(320px,400px)_1fr] @4xl:gap-12">
      <div>
        <h1 className="mt-6 font-serif text-[27px] leading-tight text-racing">Your starters</h1>
        <p className="text-[15px] text-[var(--muted)]">{shortDate(data.simulatedDate)}</p>

        {everyone.length === 0 && <p className="mt-6 text-[var(--muted)]">No starters yet.</p>}
        <ul className="mt-4 hidden flex-col gap-2 @4xl:flex">
          {everyone.map((e) => (
            <li key={e.id}>
              <button type="button" aria-pressed={e.id === selected} onClick={() => setPicked(e.id)}
                className={`w-full rounded-[6px] border bg-paper p-4 text-left ${e.id === selected ? 'border-heritage ring-2 ring-vibrant' : 'border-[var(--hairline)]'} ${FOCUS}`}>
                <span className="block font-semibold text-racing">{e.name}</span>
                <span className="block text-[15px] text-[var(--muted)]">
                  {e.s ? progressSummary(e.name, e.s.engineState, isLm).line : NO_PLAN}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {isLm && starters.flatMap((s) => s.engineState.needsDecisions.map((nd) => (
          <DecisionCard key={`${s.person.id}-${nd.hardStopId}`} starter={s} nd={nd} reload={reload} />
        )))}

        <section className="mt-8">
          <h2 className="text-[21px] font-semibold text-racing">To-do</h2>
          {taskError && <p role="alert" className="mt-2 text-[15px]">{taskError}</p>}
          {tasks.length === 0 && handovers.length === 0 ? <p className="mt-2 text-[var(--muted)]">Nothing to do right now.</p> : (
            <ul className="mt-2 flex flex-col gap-2">
              {handovers.map((h) => (
                <li key={`h-${h.id}`} className="border-l-[3px] border-heritage bg-paper py-2 pl-3">
                  {h.starterName} asked for help: {h.question}
                  <span className="block text-[15px] text-[var(--muted)]">{shortDate(h.at)}, from their help chat</span>
                </li>
              ))}
              {tasks.map((t) => (
                <li key={`${t.personId}-${t.itemId}-${t.actionId}`}>
                  <label className="flex min-h-[44px] items-center gap-3 border-l-[3px] border-vibrant bg-paper pl-3">
                    <input type="checkbox" className={`h-5 w-5 shrink-0 accent-[var(--heritage)] ${FOCUS}`}
                      onChange={(e) => {
                        const box = e.currentTarget;
                        void send('/api/actions', { itemId: t.itemId, actionId: t.actionId, actorPersonId: viewer.id, personId: t.personId }).then((err) => {
                          if (err) { box.checked = false; setTaskError('That did not save, so it is still on your list. Try again.'); } else { setTaskError(null); reload(); }
                        });
                      }} />
                    <span>{t.label}<span className="block text-[15px] text-[var(--muted)]">{t.starterName}</span></span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="min-w-0">
        {everyone.map((e) => (
          <div key={e.id} className={shown(e.id)}>
            {e.s ? <StarterCard s={e.s} data={data} reload={reload} /> : (
              <section className="mt-8 border-t border-[var(--hairline)] pt-6 @4xl:border-t-0">
                <h2 className="text-[21px] font-semibold text-racing">{e.name}</h2>
                <p className="mt-1">{NO_PLAN}</p>
              </section>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StarterCard({ s, data, reload }: { s: TeamStarter; data: TeamData; reload: () => void }) {
  const { viewer, library } = data;
  const es = s.engineState;
  const isLm = viewer.role === 'line-manager';
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const summary = progressSummary(s.person.name, es, isLm);
  const blocked = es.items.filter((i) => i.blockedFlag);
  const additions = es.items.filter((i) => i.addedBy);

  const sendNote = async () => {
    const err = await send('/api/team', { kind: 'note', personId: s.person.id, authorId: viewer.id, body: note });
    setSent(err ?? 'Note sent');
    if (!err) setNote('');
  };

  return (
    <section className="mt-8 border-t border-[var(--hairline)] pt-6 @4xl:border-t-0">
      <h2 className="text-[21px] font-semibold text-racing @4xl:font-serif @4xl:text-[27px]">{s.person.name}</h2>
      <p className="mt-1">{summary.line}</p>
      {summary.next && <p className="mt-1">Next: <strong>{summary.next}</strong></p>}

      {es.containers.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2" aria-label="Containers">
          {es.containers.map((c) => (
            <li key={c.containerId} className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[6px] border border-[var(--hairline)] px-4 py-3 ${c.complete ? 'bg-calm' : 'bg-paper'}`}>
              <span className="font-semibold">{c.label}</span>
              <span className="flex items-center gap-2 text-[15px]">
                <span aria-hidden className="flex gap-1">
                  {Array.from({ length: Math.min(c.mandatoryCount, 8) }, (_, n) => (
                    <span key={n} className={`h-2 w-4 rounded-full ${n < c.doneCount ? 'bg-racing' : 'bg-[var(--hairline)]'}`} />
                  ))}
                </span>
                {c.complete ? 'Done' : `${c.doneCount} of ${c.mandatoryCount} done`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isLm && blocked.map((i) => (
        <p key={i.itemId} className="mt-3 border-l-[3px] border-dashed border-everyday pl-3">
          Blocked Flag: {i.title}
          <span className="block text-[15px] text-[var(--muted)]">
            Waiting on {i.currentAction?.label ?? 'a system'}{i.waitingDays !== undefined ? ` for ${i.waitingDays} days` : ''}
          </span>
        </p>
      ))}

      {isLm && s.chooseResults && s.chooseResults.length > 0 && (
        <ul className="mt-3 text-[15px]">
          {s.chooseResults.map((c) => <li key={`${c.itemId}-${c.label}`}>{c.label}: <strong>{c.value}</strong></li>)}
        </ul>
      )}

      {isLm && additions.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {additions.map((i) => (
            <li key={i.itemId} className="flex min-h-[44px] items-center justify-between gap-3 border-l-[3px] border-heritage pl-3">
              <span>{i.title}<span className="block text-[15px] text-[var(--muted)]">Added by {i.addedBy?.name}</span></span>
              {i.addedBy?.personId === viewer.id && i.status === 'not-started' && (
                <button type="button" className={`${BTN} border border-[var(--hairline)] text-heritage`}
                  onClick={() => void send('/api/additions', { personId: s.person.id, itemId: i.itemId, byPersonId: viewer.id }, 'DELETE').then(reload)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isLm && library && (adding
        ? <AddJourney starter={s} viewerId={viewer.id} library={library} onDone={() => { setAdding(false); reload(); }} />
        : <button type="button" className={`${BTN} mt-4 bg-heritage text-paper`} onClick={() => setAdding(true)}>Add a journey</button>)}

      {isLm && <SendReminder personId={s.person.id} name={s.person.name} viewerId={viewer.id} />}

      <label className="mt-6 flex flex-col gap-1 text-[15px]">Note to {s.person.name}
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
          className={`rounded border border-[var(--hairline)] p-3 text-[17px] ${FOCUS}`} />
      </label>
      <button type="button" disabled={!note.trim()} onClick={() => void sendNote()}
        className={`${BTN} mt-2 border border-[var(--hairline)] text-heritage disabled:opacity-50`}>Send note</button>
      {sent && <p role="status" className="mt-1 text-[15px] text-[var(--muted)]">{sent}</p>}
    </section>
  );
}

function DecisionCard({ starter, nd, reload }: { starter: TeamStarter; nd: NeedsDecision; reload: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const decide = async (decision: 'confirm' | 'extend' | 'dismiss') => {
    const err = await send(`/api/hard-stops/${nd.hardStopId}/decision`, { personId: starter.person.id, decision, reason });
    setError(err);
    if (!err) reload();
  };
  return (
    <section className="mt-6 rounded bg-ink p-4 text-paper">
      <h2 className="flex items-center gap-2 font-semibold">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-vibrant" />Needs decision
      </h2>
      <p className="mt-1">{starter.person.name}: {nd.label}</p>
      <p className="text-[15px] opacity-80">{nd.reason}</p>
      <label className="mt-3 flex flex-col gap-1 text-[15px]">Reason
        <input value={reason} onChange={(e) => setReason(e.target.value)}
          className={`min-h-[44px] rounded bg-paper px-3 text-ink ${FOCUS}`} />
      </label>
      {error && <p role="alert" className="mt-2 text-[15px] text-vibrant">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!reason.trim()} className={`${BTN} bg-vibrant text-ink disabled:opacity-50`} onClick={() => void decide('confirm')}>Confirm</button>
        {nd.extendAllowed && <button type="button" disabled={!reason.trim()} className={`${BTN} border border-paper disabled:opacity-50`} onClick={() => void decide('extend')}>Extend 7 days</button>}
        <button type="button" disabled={!reason.trim()} className={`${BTN} border border-paper disabled:opacity-50`} onClick={() => void decide('dismiss')}>Dismiss</button>
      </div>
    </section>
  );
}
