import { z } from 'zod';
import { computeState } from '@/src/engine';
import { buildEngineInput, getAppliedPathway, getDemoClock, getPerson, recordActionProgress, recordOverride } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { filterForViewer, type Viewer } from '@/src/lib/roleFilter';

export const dynamic = 'force-dynamic';

const Body = z.object({
  itemId: z.string().min(1).max(60),
  actionId: z.string().min(1).max(60),
  value: z.union([z.string().max(2000), z.number()]).optional(),
  actorPersonId: z.string().min(1).max(40),
  personId: z.string().min(1).max(40).optional(),
});
const As = z.object({ as: z.enum(['starter', 'delegate', 'line-manager', 'buddy', 'hr']).default('starter') });

export const POST = apiHandler(async (req) => {
  const b = Body.parse(await req.json().catch(() => { throw new ApiError('Body must be valid JSON'); }));
  const { as } = As.parse({ as: new URL(req.url).searchParams.get('as') ?? undefined }) as { as: Viewer };
  const personId = b.personId ?? b.actorPersonId;
  const actor = getPerson(b.actorPersonId);
  if (!actor) throw new ApiError('Unknown actorPersonId');
  const starter = getPerson(personId);
  if (!starter || !getAppliedPathway(personId)) throw new ApiError('No Applied Pathway for that person', 404);
  const state = computeState(buildEngineInput(personId));
  const item = state.items.find((i) => i.itemId === b.itemId);
  if (!item) throw new ApiError('That Journey is not in this Applied Pathway');
  const today = getDemoClock();
  if (b.actionId === 'skip') {
    if (item.mandatory) throw new ApiError('Only an optional Journey can be skipped');
    if (['done', 'skipped', 'cancelled'].includes(item.status)) throw new ApiError(`That Journey is already ${item.status}`);
    recordOverride(personId, { itemId: b.itemId, status: 'skipped', byPersonId: b.actorPersonId, at: today });
  } else {
    const a = item.currentAction;
    if (a?.id !== b.actionId) throw new ApiError('That Action is not the current Action for this Journey');
    if (a.type === 'automation' || a.type === 'notification') throw new ApiError('Only Demo controls can complete a Hidden automation', 403);
    if (a.starterOnly && b.actorPersonId !== personId) throw new ApiError('Only the starter can complete this Action', 403);
    if (a.type === 'task') {
      const holder = { starter: personId, 'line-manager': starter.lineManagerId, buddy: starter.buddyId }[a.owner as string];
      const ok = a.owner === 'hr' ? actor.role === 'hr' : holder === b.actorPersonId;
      if (!ok) throw new ApiError('That Task belongs to someone else', 403);
    }
    let value: string | number | undefined;
    if (a.type === 'choose') {
      const match = a.options?.find((o) => o === String(b.value));
      if (match === undefined) throw new ApiError('That is not one of the options for this Action');
      value = match;
    } else if (a.type === 'provide') {
      // Receipt only: the content is never stored (Design.MD D3a).
      if (typeof b.value !== 'string' || !b.value.trim() || b.value.length > 2000) throw new ApiError('Provide a value of up to 2000 characters');
    } else if (b.value !== undefined) throw new ApiError('This Action does not take a value');
    recordActionProgress(personId, {
      itemId: b.itemId, actionId: b.actionId, state: 'done', doneAt: today, doneByPersonId: b.actorPersonId,
      ...(value !== undefined && { value }),
    });
  }
  return { engineState: filterForViewer(computeState(buildEngineInput(personId)), as, { actingFor: starter.name }) };
});
