import type { ActionStep, ActorRole, ItemState, JourneyStatus } from '@/src/engine/types';
import { FOCUS } from '@/src/ui/components/starter/JourneyRow';
import { STAGES } from '@/src/ui/components/journey-builder/constants';

const WORD: Record<JourneyStatus, string> = {
  'not-started': 'Not started', 'in-progress': 'In progress', 'action-required': 'Action required',
  done: 'Done', skipped: 'Skipped', cancelled: 'Stopped',
};
const OWNER: Record<ActorRole, string> = { starter: 'Starter', 'line-manager': 'Line Manager', buddy: 'Buddy', hr: 'HR' };
const MARK: Record<ActionStep['state'], string> = { done: '●', current: '◐', upcoming: '○' };
const STATE_WORD: Record<ActionStep['state'], string> = { done: 'Done', current: 'Current', upcoming: 'Upcoming' };

/** Who owns a step: automations are Hidden, otherwise the owner (a plain Action defaults to the Starter). */
const ownerWord = (a: ActionStep) => (a.type === 'automation' ? 'Hidden automation' : OWNER[a.owner ?? 'starter']);

/** Line Manager only (D5): every Journey under its Stage, each opening to its Actions in order. */
export function JourneyDetails({ items }: { items: ItemState[] }) {
  const groups = STAGES.map((s) => ({ ...s, items: items.filter((i) => i.stage === s.id) })).filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <section className="mt-6" aria-label="Journeys">
      <h3 className="font-semibold text-racing">Journeys</h3>
      {groups.map((g) => (
        <div key={g.id} className="mt-3">
          <p className="text-[15px] text-[var(--muted)]">{g.label}</p>
          <ul className="mt-1 flex flex-col gap-2">
            {g.items.map((i) => (
              <li key={i.itemId}>
                <details className="rounded-[6px] border border-[var(--hairline)] bg-paper">
                  <summary className={`flex min-h-[44px] cursor-pointer flex-wrap items-center justify-between gap-x-4 px-4 py-2 ${FOCUS}`}>
                    <span className="font-semibold">{i.title}</span>
                    <span className="text-[15px] text-[var(--muted)]">{WORD[i.status]}</span>
                  </summary>
                  {i.actions && i.actions.length > 0 ? (
                    <ol className="flex flex-col gap-1 border-t border-[var(--hairline)] px-4 py-3">
                      {i.actions.map((a) => (
                        <li key={a.id} className="flex items-start gap-3">
                          <span aria-hidden className="text-heritage">{MARK[a.state]}</span>
                          <span>
                            {a.label}
                            <span className="block text-[15px] text-[var(--muted)]">{STATE_WORD[a.state]}, {ownerWord(a)}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : <p className="border-t border-[var(--hairline)] px-4 py-3 text-[15px] text-[var(--muted)]">No steps to show.</p>}
                </details>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
