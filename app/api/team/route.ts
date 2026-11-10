import { z } from 'zod';
import { computeState } from '@/src/engine';
import {
  addNote, buildEngineInput, getAppliedPathway, getDemoClock, getJourney, getPerson, listJourneys, listPersons, recordOverride,
} from '@/src/db/queries';
import { apiHandler, ApiError } from '@/src/lib/apiHandler';
import { filterForViewer } from '@/src/lib/roleFilter';
import { assertLineManager, chooseResults } from './load';
import { readJson } from './json';

export const dynamic = 'force-dynamic';

const Query = z.object({ viewerId: z.string().min(1), as: z.enum(['line-manager', 'buddy']) });

export const GET = apiHandler(async (req: Request) => {
  const q = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!q.success) throw new ApiError('viewerId and as=line-manager or buddy are required');
  const { viewerId, as } = q.data;
  const viewer = getPerson(viewerId);
  if (viewer?.role !== as) throw new ApiError(`${viewerId} is not a ${as}`, 403);
  const all = listPersons();
  const key = as === 'line-manager' ? 'lineManagerId' : 'buddyId';
  // The server filters for the viewer: a Buddy never receives Blocked Flags or Choose results.
  const starters = all.filter((p) => p[key] === viewerId && getAppliedPathway(p.id)).map((p) => {
    const input = buildEngineInput(p.id);
    const engineState = filterForViewer(computeState(input), as);
    return {
      person: { id: p.id, name: p.name, startDate: p.startDate },
      engineState,
      ...(as === 'line-manager' && { chooseResults: chooseResults(input) }),
    };
  });
  return {
    viewer: { id: viewer.id, name: viewer.name, role: as },
    viewers: all.filter((p) => p.role === 'line-manager' || p.role === 'buddy').map((p) => ({ id: p.id, name: p.name, role: p.role })),
    simulatedDate: getDemoClock(),
    starters,
    tasks: starters.flatMap((s) => s.engineState.tasks.filter((t) => t.owner === as)),
    ...(as === 'line-manager' && {
      library: listJourneys().map((j) => ({ id: j.id, title: j.title, stage: j.stage, tags: j.tags })),
    }),
  };
});

const Body = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('note'), personId: z.string(), authorId: z.string(), body: z.string().trim().min(1).max(500) }),
  z.object({ kind: z.literal('override'), personId: z.string(), itemId: z.string(), byPersonId: z.string(), reason: z.string().trim().min(1).max(500) }),
]);

/** A note to the starter, or a Line Manager override to Done. */
export const POST = apiHandler(async (req: Request) => {
  const b = Body.safeParse(await readJson(req));
  if (!b.success) throw new ApiError(b.error.issues[0]?.message ?? 'Invalid body');
  const at = getDemoClock();
  if (b.data.kind === 'note') {
    const { personId, authorId, body } = b.data;
    const p = getPerson(personId);
    if (!p || (p.lineManagerId !== authorId && p.buddyId !== authorId)) {
      throw new ApiError('Only the Line Manager or Buddy can send this starter a note', 403);
    }
    addNote(personId, authorId, body, at);
    return { sent: true };
  }
  const { personId, itemId, byPersonId, reason } = b.data;
  assertLineManager(personId, byPersonId);
  const item = getAppliedPathway(personId)?.snapshot.items.find((i) => i.id === itemId);
  if (!item) throw new ApiError(`${itemId} is not on this Applied Pathway`, 404);
  if (getJourney(item.journeyId, item.journeyVersion)?.declaresOutcome) {
    throw new ApiError('This Journey declares an Outcome and cannot be overridden', 409);
  }
  recordOverride(personId, { itemId, status: 'done', reason, byPersonId, at });
  return filterForViewer(computeState(buildEngineInput(personId)), 'line-manager');
});
