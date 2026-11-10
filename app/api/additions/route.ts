import { z } from 'zod';
import { addAdditionToApplied, getAppliedPathway, getJourney, removeAdditionFromApplied } from '@/src/db/queries';
import { apiHandler, ApiError } from '@/src/lib/apiHandler';
import { filterForViewer } from '@/src/lib/roleFilter';
import type { PathwayItem } from '@/src/engine';
import { assertLineManager, stateFor } from '../team/load';
import { readJson } from '../team/json';
import { assertNoLoop } from './guard';

export const dynamic = 'force-dynamic';

const Add = z.object({
  personId: z.string().min(1),
  journeyId: z.string().min(1),
  unlock: z.discriminatedUnion('kind', [z.object({ kind: z.literal('now') }), z.object({ kind: z.literal('after'), itemId: z.string().min(1) }), z.object({ kind: z.literal('after-container'), containerId: z.string().min(1) })]),
  mandatory: z.boolean().default(false),
  byPersonId: z.string().min(1),
});
const Remove = z.object({ personId: z.string().min(1), itemId: z.string().min(1), byPersonId: z.string().min(1) });

// addAdditionToApplied throws plain-English Errors; they become 400s.
const asBadRequest = (fn: () => void) => {
  try { fn(); } catch (e) { throw new ApiError(e instanceof Error ? e.message : 'Could not change the Applied Pathway'); }
};

/** Add a Journey (B2): an HR or Line Manager Addition to one starter's Applied Pathway. */
export const POST = apiHandler(async (req: Request) => {
  const b = Add.safeParse(await readJson(req));
  if (!b.success) throw new ApiError(b.error.issues[0]?.message ?? 'Invalid body');
  const { personId, journeyId, unlock, mandatory, byPersonId } = b.data;
  const { staff } = assertLineManager(personId, byPersonId, true);
  const j = getJourney(journeyId);
  if (!j) throw new ApiError(`Journey ${journeyId} does not exist`, 404);
  const item: PathwayItem = {
    id: `add-${journeyId}`, journeyId, journeyVersion: j.version, mandatory,
    dependsOn: unlock.kind === 'now' ? [] : unlock.kind === 'after' ? [{ kind: 'item', itemId: unlock.itemId }] : [{ kind: 'container', containerId: unlock.containerId }],
    lane: j.stage, x: 0, y: 0,
    addedBy: { personId: byPersonId, name: staff.name },
  };
  const snap = getAppliedPathway(personId)?.snapshot;
  const titleOf = (id: string) => stateFor(personId).items.find((i) => i.itemId === id)?.title ?? j.title;
  asBadRequest(() => { if (snap) assertNoLoop(snap.items, item, titleOf); });
  asBadRequest(() => addAdditionToApplied(personId, item));
  return filterForViewer(stateFor(personId), staff.role === 'hr' ? 'hr' : 'line-manager');
});

/** Remove an Addition: its author only, before it starts. */
export const DELETE = apiHandler(async (req: Request) => {
  const b = Remove.safeParse(await readJson(req));
  if (!b.success) throw new ApiError(b.error.issues[0]?.message ?? 'Invalid body');
  const { personId, itemId, byPersonId } = b.data;
  const { staff } = assertLineManager(personId, byPersonId, true);
  if (stateFor(personId).items.find((i) => i.itemId === itemId)?.status !== 'not-started') {
    throw new ApiError('That journey has already started, so it cannot be removed', 409);
  }
  asBadRequest(() => removeAdditionFromApplied(personId, itemId, byPersonId));
  return filterForViewer(stateFor(personId), staff.role === 'hr' ? 'hr' : 'line-manager');
});
