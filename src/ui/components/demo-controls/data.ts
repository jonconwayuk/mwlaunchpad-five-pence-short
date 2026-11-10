import { buildEngineInput, getAppliedPathway, listPersons } from '@/src/db/queries';
import { computeState } from '@/src/engine';
import { addDays } from '@/src/lib/clock';

export interface Jump { label: string; date: string }
export interface ControlsData {
  starters: { id: string; name: string; jumps: Jump[] }[];
  waiting: { personId: string; personName: string; itemId: string; actionId: string; title: string; setsOutcome: boolean }[];
}

/** Everything the Demo controls need, read on the server so a refresh recomputes it. */
export function loadControlsData(): ControlsData {
  const data: ControlsData = { starters: [], waiting: [] };
  for (const p of listPersons()) {
    if (!p.startDate || !p.offerAcceptedDate) continue;
    data.starters.push({
      id: p.id, name: p.name,
      jumps: [
        { label: 'Offer accepted', date: p.offerAcceptedDate },
        { label: 'Plus 3 weeks', date: addDays(p.offerAcceptedDate, 21) },
        { label: 'Day 1', date: p.startDate },
        { label: 'Day 14', date: addDays(p.startDate, 13) },
        { label: 'Day 30', date: addDays(p.startDate, 29) },
      ],
    });
    if (!getAppliedPathway(p.id)) continue;
    for (const i of computeState(buildEngineInput(p.id)).items) {
      const a = i.currentAction;
      if (a?.type === 'automation' && i.status !== 'done') {
        data.waiting.push({ personId: p.id, personName: p.name, itemId: i.itemId, actionId: a.id, title: i.title, setsOutcome: !!a.setsOutcome });
      }
    }
  }
  return data;
}
