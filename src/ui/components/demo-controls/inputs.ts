import type { EngineState } from '@/src/engine/types';
import type { ControlsData } from './data';

export interface InputCall { itemId: string; actionId: string; value?: string }

/** The Actions waiting on the joiner. Never a Hidden automation, someone else's Task or a Needs decision. */
export function selectInputs(state: EngineState): InputCall[] {
  const held = new Set(state.needsDecisions.map((n) => n.triggerItemId));
  const calls: InputCall[] = [];
  for (const i of state.items) {
    const a = i.currentAction;
    if (!a || i.status === 'done' || held.has(i.itemId)) continue;
    if (a.type === 'read') calls.push({ itemId: i.itemId, actionId: a.id });
    else if (a.type === 'task' && a.owner === 'starter') calls.push({ itemId: i.itemId, actionId: a.id });
    else if (a.type === 'provide') calls.push({ itemId: i.itemId, actionId: a.id, value: 'Demo value (synthetic)' });
    else if (a.type === 'choose' && a.options?.length) calls.push({ itemId: i.itemId, actionId: a.id, value: a.options[a.options.length - 1] });
  }
  return calls;
}

export const countMessage = (n: number) => `Completed ${n} ${n === 1 ? 'Action' : 'Actions'}`;

export const MAX_ROUNDS = 30;

/** Repeats until nothing is waiting on the joiner (a done Action reveals the next), through the normal Actions API so every engine rule applies. */
export async function completeInputs(personId: string, doFetch: typeof fetch = fetch): Promise<number> {
  let done = 0;
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const res = await doFetch(`/api/state?personId=${encodeURIComponent(personId)}&as=hr`);
    const j = (await res.json().catch(() => ({}))) as { data?: { engineState?: EngineState }; error?: string };
    if (!res.ok || !j.data?.engineState) throw new Error(j.error ?? 'That person has no Applied Pathway.');
    let progressed = 0;
    for (const c of selectInputs(j.data.engineState)) {
      const r = await doFetch('/api/actions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...c, actorPersonId: personId, personId }),
      });
      if (r.ok) progressed += 1;
    }
    done += progressed;
    if (!progressed) break; // nothing left, or nothing the API accepts
  }
  return done;
}

export const EQUIPMENT = { itemId: 'i-equipment', actionId: 'j-equipment-request-a1' } as const;

/** The ServiceNow control is live only while the equipment Item waits on its Hidden automation. */
export function serviceNowCall(waiting: ControlsData['waiting'], personId: string) {
  return waiting.some((w) => w.personId === personId && w.itemId === EQUIPMENT.itemId && w.actionId === EQUIPMENT.actionId)
    ? { personId, ...EQUIPMENT, result: 'returned' as const } : undefined;
}
