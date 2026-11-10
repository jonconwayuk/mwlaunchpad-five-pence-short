import { computeState, type EngineInput } from '@/src/engine';
import { buildEngineInput, getPerson } from '@/src/db/queries';
import { ApiError } from '@/src/lib/apiHandler';

/** The starter's live state, straight from the engine. */
export const stateFor = (personId: string) => computeState(buildEngineInput(personId));

/** Throws unless `staffId` is this starter's Line Manager (or HR when `allowHr`). */
export function assertLineManager(personId: string, staffId: string, allowHr = false) {
  const p = getPerson(personId);
  const staff = getPerson(staffId);
  if (!p || !staff) throw new ApiError('Unknown person', 404);
  if (p.lineManagerId !== staffId && !(allowHr && staff.role === 'hr')) {
    throw new ApiError(`${staff.name} is not the Line Manager for ${p.name}`, 403);
  }
  return { person: p, staff };
}

/** The starter's Choose results, for the Line Manager only. */
export function chooseResults(input: EngineInput) {
  return input.progress.flatMap((pr) => {
    const item = input.pathway.items.find((i) => i.id === pr.itemId);
    const j = item && input.journeys[`${item.journeyId}@${item.journeyVersion}`];
    const a = j?.actions.find((x) => x.id === pr.actionId);
    return j && a?.type === 'choose' && pr.value !== undefined ? [{ itemId: pr.itemId, title: j.title, label: a.label, value: pr.value }] : [];
  });
}
