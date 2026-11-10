import { z } from 'zod';
import { computeState } from '@/src/engine';
import { buildEngineInput, getDemoClock, recordActionProgress, recordOverride } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { filterForViewer, type Viewer } from '@/src/lib/roleFilter';

export const dynamic = 'force-dynamic';

const Body = z.object({
  itemId: z.string().min(1).max(60),
  actionId: z.string().min(1).max(60),
  value: z.union([z.string().max(500), z.number()]).optional(),
  actorPersonId: z.string().min(1).max(40),
  personId: z.string().min(1).max(40).optional(),
});
const As = z.enum(['starter', 'delegate', 'line-manager', 'buddy', 'hr']).default('starter');

export const POST = apiHandler(async (req) => {
  const b = Body.parse(await req.json().catch(() => { throw new ApiError('Body must be valid JSON'); }));
  const as: Viewer = As.parse(new URL(req.url).searchParams.get('as') ?? undefined);
  const personId = b.personId ?? b.actorPersonId;
  let state;
  try {
    state = computeState(buildEngineInput(personId));
  } catch {
    throw new ApiError('No Applied Pathway for that person', 404);
  }
  const item = state.items.find((i) => i.itemId === b.itemId);
  if (!item) throw new ApiError('That Journey is not in this Applied Pathway');
  const today = getDemoClock();
  if (b.actionId === 'skip') {
    if (item.mandatory) throw new ApiError('Only an optional Journey can be skipped');
    recordOverride(personId, { itemId: b.itemId, status: 'skipped', byPersonId: b.actorPersonId, at: today });
  } else {
    if (item.currentAction?.id !== b.actionId) throw new ApiError('That Action is not the current Action for this Journey');
    recordActionProgress(personId, {
      itemId: b.itemId, actionId: b.actionId, state: 'done', doneAt: today, doneByPersonId: b.actorPersonId,
      ...(b.value !== undefined && { value: b.value }),
    });
  }
  return { engineState: filterForViewer(computeState(buildEngineInput(personId)), as, { actingFor: personId }) };
});
